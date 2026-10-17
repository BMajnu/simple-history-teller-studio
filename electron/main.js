// Simple Itihash — Windows App shell (Electron + bundled Chromium).
// Wraps the EXISTING studio untouched: server.js (backend) + public/ (UI).
// - Persistent automation profile (partition persist:studio-auto): logins survive restarts.
// - remote-debugging-port 9224: daemon.js + tools/* keep working with ZERO changes.
// - Menu: show/hide the automation browser ("view browser" option).
// Run dev:  npm run electron        Build: npm run dist
const { app, BrowserWindow, Menu, shell, WebContentsView, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { fork } = require('child_process');
const http = require('http');

function resolveRoot() {
  const env = process.env.SIMPLE_ITIHASH_ROOT;
  if (env) { try { if (fs.existsSync(path.join(env, 'server.js')) && fs.existsSync(path.join(env, 'projects'))) return env; } catch {} }
  // Prefer the OUTERMOST match: dev workspaces win over the packaged bundle copy.
  let d = path.resolve(__dirname, '..');
  let best = null;
  for (let i = 0; i < 8; i++) {
    try { if (fs.existsSync(path.join(d, 'server.js')) && fs.existsSync(path.join(d, 'projects'))) best = d; } catch {}
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  return best || path.resolve(__dirname, '..');
}
const ROOT = resolveRoot();
try { process.chdir(ROOT); } catch {}
const STUDIO_URL = 'http://127.0.0.1:4000';
// Single shared profile dir for dev AND packaged builds (sessions/watcher identical).
try {
  const ud = path.join(process.env.APPDATA || path.join(process.env.USERPROFILE, 'AppData', 'Roaming'), 'simple-itihash-production-studio');
  app.setPath('userData', ud);
} catch {}
app.commandLine.appendSwitch('remote-debugging-port', '9224');
// Background capability (permanent): automation must NEVER depend on window/tab focus.
// These flags stop Chromium throttling timers/rendering in occluded/background tabs.
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('disable-renderer-backgrounding');

let mainWin = null;
let autoWin = null;
let serverProc = null;
let daemonProc = null;

function probe(url, ms) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => { res.resume(); resolve(true); });
    req.on('error', () => resolve(false));
    req.setTimeout(ms || 2000, () => { req.destroy(); resolve(false); });
  });
}

async function ensureServer() {
  if (await probe(STUDIO_URL, 2000)) return;
  serverProc = fork(path.join(ROOT, 'server.js'), [], { cwd: ROOT, silent: true });
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await probe(STUDIO_URL, 2000)) return;
  }
  throw new Error('server.js did not come up on ' + STUDIO_URL);
}

async function ensureDaemon() {
  const daemonUrl = 'http://127.0.0.1:9333/status';
  if (await probe(daemonUrl, 2000)) return;
  daemonProc = fork(path.join(ROOT, 'daemon.js'), [], { cwd: ROOT, silent: true });
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await probe(daemonUrl, 2000)) return;
  }
  try { daemonProc.kill(); } catch {}
  daemonProc = null;
  throw new Error('daemon.js did not come up on http://127.0.0.1:9333');
}

const AUTO_PART = 'persist:studio-auto';
const BAR_H = 88;
// A transient Windows restore/minimize can report a tiny content rectangle.
// Applying that number to a WebContentsView permanently collapses an otherwise
// healthy AI Studio tab into a thin strip until another resize happens.
const MIN_LAYOUT_WIDTH = 640;
const MIN_PAGE_HEIGHT = 360;
let bWin = null;
let barView = null;
const tabs = new Map();
let tabSeq = 0;
let activeId = null;
let ipcWired = false;
let layoutRetryTimer = null;

function browserLayoutStatus() {
  const contentSize = (!bWin || bWin.isDestroyed()) ? [0, 0] : bWin.getContentSize();
  const active = activeId !== null ? tabs.get(activeId) : null;
  let activeBounds = null;
  try { activeBounds = active ? active.view.getBounds() : null; } catch {}
  const healthy = Boolean(
    bWin && !bWin.isDestroyed() && !bWin.isMinimized() &&
    contentSize[0] >= MIN_LAYOUT_WIDTH &&
    contentSize[1] >= BAR_H + MIN_PAGE_HEIGHT &&
    activeBounds && activeBounds.width >= MIN_LAYOUT_WIDTH && activeBounds.height >= MIN_PAGE_HEIGHT,
  );
  return {
    supported: true,
    healthy,
    content: { width: contentSize[0], height: contentSize[1] },
    activeId,
    activeTab: active ? active.name : null,
    activeBounds,
    minimums: { width: MIN_LAYOUT_WIDTH, pageHeight: MIN_PAGE_HEIGHT },
  };
}

function queueLayoutRetry(reason) {
  if (layoutRetryTimer) clearTimeout(layoutRetryTimer);
  layoutRetryTimer = setTimeout(() => {
    layoutRetryTimer = null;
    layoutBrowser(`settled:${reason || 'unknown'}`);
  }, 250);
  layoutRetryTimer.unref?.();
}

function createBar() {
  try {
    if (!bWin || bWin.isDestroyed()) return;
    try { if (barView && !barView.isDestroyed()) { try { bWin.contentView.removeChildView(barView); } catch {} try { barView.webContents.close(); } catch {} } } catch {}
    barView = new WebContentsView({ webPreferences: { preload: path.join(__dirname, 'browser-pre.js') } });
    bWin.contentView.addChildView(barView);
    try { barView.webContents.loadFile(path.join(__dirname, 'browser.html')); } catch {}
    barView.webContents.on('render-process-gone', () => { setTimeout(() => { try { createBar(); layoutBrowser(); pushTabs(); } catch {} }, 1500); });
    barView.webContents.on('destroyed', () => { barView = null; });
    layoutBrowser('bar-created');
  } catch {}
}
function repairBar() {
  try {
    if (!bWin || bWin.isDestroyed()) ensureBrowser();
    createBar(); layoutBrowser('bar-repaired'); pushTabs();
    try { bWin.show(); } catch {}
  } catch {}
}
function ensureBrowser() {
  if (bWin && !bWin.isDestroyed()) return bWin;
  bWin = new BrowserWindow({ width: 1400, height: 950, show: false, title: 'Studio Automation Browser' });
  createBar();
  const recoverLayout = (event) => {
    layoutBrowser(event);
    queueLayoutRetry(event);
  };
  for (const event of ['resize', 'resized', 'restore', 'maximize', 'unmaximize', 'show', 'ready-to-show']) {
    bWin.on(event, () => recoverLayout(event));
  }
  bWin.on('closed', () => { bWin = null; barView = null; tabs.clear(); activeId = null; });
  layoutBrowser('window-created');
  wireTabsIpc();
  return bWin;
}
function wireTabsIpc() {
  if (ipcWired) return; ipcWired = true;
  ipcMain.handle('tabs:list', () => { pushTabs(); return true; });
  ipcMain.handle('tabs:new', (e, o) => {
    const u = (o && o.url) || o || 'about:blank';
    const background = Boolean(o && o.background);
    return openTab(u, o && o.name, {
      show: !background,
      activate: !background,
      background,
      accountSlot: o && o.accountSlot,
      agentName: o && o.agentName,
    });
  });
  ipcMain.handle('tabs:get', () => {
    const list = [...tabs.values()].map((t) => { let u = ''; try { u = t.view.webContents.getURL(); } catch {} return { id: t.id, name: t.name, url: u, accountSlot: t.accountSlot, agentName: t.agentName }; });
    return { tabs: list, active: activeId };
  });
  ipcMain.handle('tabs:layout-status', () => browserLayoutStatus());
  ipcMain.handle('tabs:repair-layout', (e, reason) => {
    layoutBrowser(`manual-repair:${String(reason || 'requested').slice(0, 80)}`);
    queueLayoutRetry('manual-repair');
    return browserLayoutStatus();
  });
  ipcMain.handle('tabs:activate-name', (e, name) => {
    const t = [...tabs.values()].find((x) => x.name === name);
    if (t) { activateTab(t.id); return true; }
    return false;
  });
  ipcMain.handle('tabs:close', (e, id) => closeTab(id));
  ipcMain.handle('tabs:activate', (e, id) => activateTab(id));
  ipcMain.handle('tabs:nav', (e, o) => { try { tabs.get(o.id).view.webContents.loadURL(o.url); } catch {} });
  ipcMain.handle('tabs:back', (e, id) => { try { const v = tabs.get(id).view.webContents; if (v.navigationHistory.canGoBack()) v.navigationHistory.goBack(); } catch {} });
  ipcMain.handle('tabs:fwd', (e, id) => { try { const v = tabs.get(id).view.webContents; if (v.navigationHistory.canGoForward()) v.navigationHistory.goForward(); } catch {} });
  ipcMain.handle('tabs:reload', (e, id) => { try { tabs.get(id).view.webContents.reload(); } catch {} });
}
function layoutBrowser(reason) {
  try {
    if (!bWin || bWin.isDestroyed() || !barView) return;
    const [W, H] = bWin.getContentSize();
    // Never propagate a minimize/restore measurement to child views. Keeping
    // their last known-good bounds is safer than the historical 100px fallback.
    if (bWin.isMinimized() || W < MIN_LAYOUT_WIDTH || H < BAR_H + MIN_PAGE_HEIGHT) {
      return false;
    }
    const pageHeight = H - BAR_H;
    tabs.forEach((t) => { try { t.view.setBounds({ x: 0, y: BAR_H, width: W, height: pageHeight }); } catch {} });
    try { bWin.contentView.removeChildView(barView); } catch {}
    try { bWin.contentView.addChildView(barView); } catch {}
    barView.setBounds({ x: 0, y: 0, width: W, height: BAR_H });
    return true;
  } catch {}
  return false;
}
function pushTabs() {
  try {
    if (!barView) return;
    const list = [...tabs.values()].map((t) => { let u = '', ti = ''; try { u = t.view.webContents.getURL(); ti = t.view.webContents.getTitle(); } catch {} return { id: t.id, name: t.name, url: u, title: ti, accountSlot: t.accountSlot, agentName: t.agentName }; });
    barView.webContents.send('tabs:update', list, activeId);
  } catch {}
}
function pickName(want) {
  const base = String(want || '').trim() || ('t' + (tabSeq + 1));
  const taken = new Set([...tabs.values()].map((t) => t.name));
  let n = base, k = 2;
  while (taken.has(n)) n = base + '-' + (k++);
  return n;
}
function accountSlotFromUrl(url) {
  const match = String(url || '').match(/\/u\/(\d+)(?:\/|\?|$)/i);
  return match ? match[1] : null;
}
function openTab(url, name, opts = {}) {
  ensureBrowser();
  const view = new WebContentsView({ webPreferences: { partition: AUTO_PART } });
  const id = ++tabSeq;
  const nm = pickName(name);
  bWin.contentView.addChildView(view);
  tabs.set(id, {
    id, name: nm, view,
    accountSlot: opts.accountSlot ?? accountSlotFromUrl(url) ?? 'unknown',
    agentName: opts.agentName || null,
  });
  const wc = view.webContents;
  wc.setWindowOpenHandler(({ url: u }) => { try { openTab(u); } catch {} return { action: 'deny' }; });
  wc.on('page-title-updated', pushTabs);
  wc.on('did-navigate', pushTabs);
  wc.on('did-finish-load', pushTabs);
  wc.on('destroyed', () => { tabs.delete(id); if (activeId === id) activeId = null; pushTabs(); });
  try { wc.loadURL(url || 'about:blank'); } catch {}
  // Browser automation workers are intentionally background-only. Their page is
  // kept attached for CDP/screenshot work but never steals the user's active tab.
  if (opts.activate !== false && !opts.background) activateTab(id);
  else {
    // Keep a background worker out of the visible view stack. CDP still owns
    // its WebContents, so it can run, receive trusted clicks and be captured.
    try { bWin.contentView.removeChildView(view); } catch {}
    layoutBrowser('background-tab-created');
  }
  if (opts.show) { try { bWin.show(); } catch {} }
  pushTabs();
  return id;
}
function activateTab(id) {
  try {
    if (!tabs.has(id)) return;
    tabs.forEach((t, k) => { try { if (k === id) bWin.contentView.addChildView(t.view); else bWin.contentView.removeChildView(t.view); } catch {} });
    activeId = id; layoutBrowser('tab-activated'); queueLayoutRetry('tab-activated'); pushTabs();
  } catch {}
}
function closeTab(id) {
  try {
    const t = tabs.get(id); if (!t) return;
    try { bWin.contentView.removeChildView(t.view); } catch {}
    try { t.view.webContents.close(); } catch {}
    tabs.delete(id);
    if (activeId === id) { const rest = [...tabs.keys()]; activeId = rest.length ? rest[rest.length - 1] : null; if (activeId) activateTab(activeId); }
    pushTabs();
  } catch {}
}
// compat shims (menu + drop watcher + daemon flows keep working)
function openInAuto(url, show) { return openTab(url, undefined, { show: show !== false, activate: show !== false }); }
function toggleAuto() {
  try {
    if (!bWin || bWin.isDestroyed()) ensureBrowser();
    if (bWin.isVisible()) bWin.hide(); else { bWin.show(); bWin.focus(); layoutBrowser('window-shown'); queueLayoutRetry('window-shown'); }
  } catch {}
}
function closeAutoExtras() {
  try {
    const ids = [...tabs.keys()];
    ids.slice(0, Math.max(0, ids.length - 1)).forEach((id) => closeTab(id));
  } catch {}
}
function openTabsFromArgs(argv) {
  for (let i = 0; i < argv.length - 1; i++) {
    if (argv[i] === '--new-tab' && argv[i + 1] && !String(argv[i + 1]).startsWith('-')) openInAuto(argv[i + 1]);
  }
}

async function createMain() {
  try {
    const { session } = require('electron');
    session.fromPartition('persist:studio-auto').setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36');
  } catch {}
  await ensureServer();
  await ensureDaemon();
  mainWin = new BrowserWindow({
    width: 1600, height: 950, title: 'Simple Studio (সিম্পল স্টুডিও)',
    webPreferences: {},
  });
  mainWin.loadURL(STUDIO_URL);
  mainWin.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(STUDIO_URL)) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWin.on('closed', () => {
    mainWin = null;
    try { bWin && !bWin.isDestroyed() && bWin.destroy(); } catch {}
    try { serverProc && serverProc.kill(); } catch {}
    try { daemonProc && daemonProc.kill(); } catch {}
    app.quit();
  });
  ensureBrowser();
  try {
    const dropFile = path.join(app.getPath('userData'), 'auto_tabs.json');
    setInterval(() => {
      try {
        if (!fs.existsSync(dropFile)) return;
        const jobs = JSON.parse(fs.readFileSync(dropFile, 'utf8'));
        try { fs.unlinkSync(dropFile); } catch {}
        (jobs.tabs || []).forEach((t) => {
          try {
            const u = typeof t === 'string' ? t : t.url;
            const nm = typeof t === 'string' ? undefined : t.name;
            openTab(u, nm, {
              background: Boolean(t && typeof t === 'object' && t.background),
              activate: !(t && typeof t === 'object' && t.background),
              accountSlot: t && typeof t === 'object' ? t.accountSlot : undefined,
              agentName: t && typeof t === 'object' ? t.agentName : undefined,
            });
          } catch {}
        });
      } catch {}
    }, 2000);
  } catch {}
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Simple Studio', submenu: [{ role: 'reload' }, { type: 'separator' }, { label: 'Quit', click: () => app.quit() }] },
    {
      label: 'Automation Browser', submenu: [
        { label: 'Show / Hide browser (watch automation)', click: toggleAuto },
        { label: 'Close extra automation windows', click: closeAutoExtras },
        { label: 'Repair toolbar and page layout', click: repairBar },
        { type: 'separator' },
        { label: 'New AI Studio tab', click: () => openInAuto('https://aistudio.google.com/') },
        { label: 'New YouTube Studio tab', click: () => openInAuto('https://studio.youtube.com/') },
        { label: 'New Flow tab', click: () => openInAuto('https://flow.google.com/') },
      ],
    },
  ]));
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', (e, argv) => { try { openTabsFromArgs(argv || []); bWin && !bWin.isDestroyed() && bWin.show(); } catch {} try { mainWin && !mainWin.isDestroyed() && (mainWin.show(), mainWin.focus()); } catch {} });
  app.whenReady().then(() => createMain().then(() => openTabsFromArgs(process.argv)).catch((e) => { console.error('FATAL:', e.message); app.quit(); }));
}
