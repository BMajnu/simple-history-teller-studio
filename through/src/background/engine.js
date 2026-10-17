/**
 * Through – Simple Automation | Background job engine (universal, domain-agnostic).
 *
 * Design (from FlowKit + VeoFlow, generalized):
 * - FlowKit: agent builds request envelopes, page executes authenticated RPC, queue + poll.
 * - VeoFlow: sidepanel bulk queue, apply-settings-once, EXECUTE_TASK per item, pause-for-input, auto-download.
 * - Through: neither site nor task type is hard-coded here. Jobs carry their own
 *   { url, siteId, actions[] }. Site-specific selectors live in src/sites/*.json
 *   or are passed inline per action. This file only: tabs, queue, pause, logs, downloads.
 *
 * Job shape (universal):
 *   { id, label?, url, siteId?, actions: [{op, args}], meta?, retries? }
 * Action ops (executed by content.js, see CONTENT_OPS there):
 *   navigate | waitFor | click | fill | selectOption | uploadDataUrl | extract |
 *   sleep | runJS | pageRpc | askHuman | download
 *
 * Messages:
 *   THROUGH_START_JOBS { jobs, options:{concurrency:1, stopOnError:false} }
 *   THROUGH_STOP | THROUGH_CONTINUE | THROUGH_STATUS | THROUGH_ENQUEUE { jobs }
 *   THROUGH_DOWNLOAD_URL { url, filename } (page -> background download via chrome.downloads)
 *   THROUGH_BRIDGE_GET | THROUGH_BRIDGE_SET {enabled, baseUrl} | THROUGH_BRIDGE_SYNC
 *
 * Bridge mode (optional): when enabled, the engine polls a local server's
 *   GET /api/through/pending?claim=1  (any server speaking the 5-endpoint
 *   contract in through/README.md — our studio :4000 is just one example),
 * executes claimed jobs with the same tab+action machinery, and POSTs each
 * result to /api/through/jobs/:id/result. Panel queue and bridge queue never
 * run at the same time: bridge sync skips while the panel queue is busy.
 */

const LOG_KEY = 'through.logs';
const QUEUE_KEY = 'through.queue';
const MAX_LOGS = 500;

const state = {
  isRunning: false,
  pausedForHuman: false,
  queue: [],
  activeTabId: null,
  currentIndex: 0,
  options: { concurrency: 1, stopOnError: false },
};

let continueResolver = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getStore(keys) {
  return chrome.storage.local.get(keys);
}

function emit(msg) {
  chrome.runtime.sendMessage(msg).catch(() => {});
}

async function log(level, message, extra) {
  const entry = { t: Date.now(), iso: new Date().toISOString(), level, message, extra: extra || null };
  console.log(`[Through:${level}]`, message, extra || '');
  try {
    const { [LOG_KEY]: logs = [] } = await getStore([LOG_KEY]);
    logs.push(entry);
    while (logs.length > MAX_LOGS) logs.shift();
    await chrome.storage.local.set({ [LOG_KEY]: logs });
  } catch {}
  emit({ type: 'THROUGH_LOG', entry });
}

function progress(current, total, status) {
  emit({ type: 'THROUGH_PROGRESS', data: { current, total, status } });
}

async function persistQueue() {
  await chrome.storage.local.set({ [QUEUE_KEY]: state.queue, 'through.running': state.isRunning });
}

// --- bridge mode (optional server poll, no new permissions beyond host) ---

const BRIDGE_KEY = 'through.bridge';
const bridge = { enabled: false, baseUrl: 'http://127.0.0.1:4000' };

async function loadBridgeConfig() {
  try {
    const { [BRIDGE_KEY]: cfg } = await getStore([BRIDGE_KEY]);
    if (cfg && typeof cfg === 'object') {
      bridge.enabled = cfg.enabled === true;
      if (typeof cfg.baseUrl === 'string' && /^https?:\/\//.test(cfg.baseUrl)) {
        bridge.baseUrl = cfg.baseUrl.replace(/\/+$/, '');
      }
    }
  } catch {}
}

async function saveBridgeConfig() {
  await chrome.storage.local.set({ [BRIDGE_KEY]: { ...bridge } });
}

function bridgeUrl(path) {
  return bridge.baseUrl + path;
}

async function reportBridgeResults(jobs) {
  // POST results for bridge-origin jobs; never throws (bridge may be down).
  for (const j of jobs) {
    if (j.origin !== 'bridge' || !j.bridgeId) continue;
    try {
      await fetch(bridgeUrl(`/api/through/jobs/${encodeURIComponent(j.bridgeId)}/result`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          j.status === 'done'
            ? { status: 'done', result: j.result !== undefined ? j.result : null }
            : { status: 'failed', error: j.error || 'failed' }
        ),
      });
    } catch (e) {
      await log('warning', `bridge report failed: ${j.bridgeId}`, { error: String(e.message || e) });
    }
  }
}

async function bridgeSync() {
  if (!bridge.enabled || state.isRunning || state.pausedForHuman) return { ok: false, skipped: true };
  let claimed = [];
  try {
    const res = await fetch(bridgeUrl('/api/through/pending?claim=1&limit=5'));
    if (!res.ok) throw new Error('http-' + res.status);
    const data = await res.json();
    claimed = (data && data.jobs) || [];
  } catch (e) {
    return { ok: false, error: 'bridge-unreachable: ' + String(e.message || e) };
  }
  if (!claimed.length) return { ok: true, count: 0 };
  await log('info', `bridge claimed ${claimed.length} jobs from ${bridge.baseUrl}`);
  state.queue = claimed.map((j, i) => ({
    id: j.id || `bridge-${Date.now()}-${i}`,
    origin: 'bridge',
    bridgeId: j.id,
    label: j.label || j.id,
    siteId: j.siteId || 'generic',
    url: j.url,
    actions: j.actions || [],
    retries: j.retries || 0,
    status: 'pending',
    meta: j.meta || null,
  }));
  state.options = { concurrency: 1, stopOnError: false };
  state.currentIndex = 0;
  state.isRunning = true;
  await persistQueue();
  emit({ type: 'THROUGH_STATUS', isRunning: true });
  emit({ type: 'THROUGH_QUEUE', queue: state.queue });
  try {
    await processQueue();
  } catch (e) {
    await log('error', 'bridge processQueue crashed', { error: String(e.message || e) });
    state.isRunning = false;
  }
  return { ok: true, count: claimed.length };
}

// --- flow site protocol (VeoFlow page contract, exact order) ----------------
// Jobs with siteId==='flow' run the Flow page sequence: CLICK_START_PROJECT
// once + APPLY_SETTINGS once per run (first flow job defines run settings),
// then per-job EXECUTE_TASK with mode-specific wait/download/pause.
// Page contract: src/sites/flow/flow-content.js. Only message names + order here.

const FLOW_MODES = ['text-to-video', 'frames-to-video', 'create-image', 'ingredients'];
let flowPackCache = null;
async function getFlowPack() {
  if (flowPackCache) return flowPackCache;
  try {
    const res = await fetch(chrome.runtime.getURL('src/sites/sitePacks.json'));
    const packs = await res.json();
    flowPackCache = (packs && packs.flow) || null;
  } catch { flowPackCache = null; }
  return flowPackCache;
}
let flowDefaultsCache = null;
async function flowBaseDefaults() {
  // Run defaults come from the flow pack's settingsSchema (data), never literals here.
  if (flowDefaultsCache) return flowDefaultsCache;
  const pack = await getFlowPack();
  const schema = (pack && pack.settingsSchema) || [];
  const get = (key) => { const f = schema.find((x) => x.key === key); return f ? f.default : undefined; };
  const mf = schema.find((x) => x.key === 'model');
  flowDefaultsCache = {
    creationMode: get('creationMode') || 'text-to-video',
    model: (mf && mf.defaultVideo) || '',
    ratio: get('ratio') || 'landscape',
    outputCount: get('outputCount') || '1',
    language: get('language') || 'en',
    autoDownload: !!get('autoDownload'),
    downloadFolder: get('downloadFolder') || 'VeoFlow',
    pauseForReference: !!get('pauseForReference'),
    waitTimeMin: get('waitTimeMin') || 30,
    waitTimeMax: get('waitTimeMax') || 120,
  };
  return flowDefaultsCache;
}
const flowSettingsOf = (base, job) => ({ ...base, ...((job && job.flow) || {}) });
const flowModeOf = (job, settings) =>
  ((job && job.flow && job.flow.creationMode) || job.type || (settings && settings.creationMode) || 'text-to-video');

async function sendFlowTab(tabId, type, data) {
  let res;
  try {
    res = await chrome.tabs.sendMessage(tabId, data === undefined ? { type } : { type, data });
  } catch (e) {
    throw new Error('flow-message-failed(' + type + '): ' + (e.message || e));
  }
  if (!res) throw new Error('flow-empty-response(' + type + ')');
  return res;
}

function flowTaskOf(job, settings, mode) {
  return {
    id: job.id,
    type: FLOW_MODES.includes(mode) ? mode : 'text-to-video',
    prompt: (job.meta && job.meta.payload) || job.label || '',
    folder: settings.downloadFolder || 'VeoFlow',
    ...((job.flow && job.flow.image) ? { image: job.flow.image } : {}),
  };
}

async function waitForVideoPartialCompletion(tabId, settings, isLast) {
  const min = (parseFloat(settings.waitTimeMin) || 30) * 1000;
  const max = (parseFloat(settings.waitTimeMax) || 120) * 1000;
  const target = isLast ? max : Math.min(min + (max - min) * 0.5, max * 0.6);
  await log('info', (isLast ? 'Waiting for final video... ' : 'Waiting for video to be partially complete (~50%)... ')
    + '(~' + Math.round(target / 1000) + 's)');
  const t0 = Date.now();
  for (;;) {
    if (!state.isRunning) throw new Error('Queue stopped');
    let st = { status: 'unknown' };
    try { st = await sendFlowTab(tabId, 'CHECK_VIDEO_STATUS'); }
    catch (e) { await log('warning', 'Status check error (continuing)', { error: String(e.message || e) }); }
    if (st && st.status === 'completed') return { completed: true, videoUrl: st.videoUrl };
    if (st && st.status === 'error') throw new Error(st.error || 'video-error');
    if (Date.now() - t0 >= target) return { completed: false };
    await sleep(Math.min(3000, target - (Date.now() - t0)));
  }
}

async function pauseForFlowReference(mode, jobId) {
  const pack = await getFlowPack();
  const copy = (pack && pack.pausedCopy && (mode === 'frames-to-video' ? pack.pausedCopy.frames : pack.pausedCopy.others)) || null;
  state.pausedForHuman = true;
  emit({
    type: 'THROUGH_PAUSED', jobId,
    reason: copy ? copy.title : 'paused-for-reference',
    title: copy ? copy.title : 'Paused',
    body: copy ? copy.body : 'Add the reference, then continue.',
    actionLabel: copy ? copy.action : 'Continue',
  });
  await log('info', 'paused for human: ' + (copy ? copy.title : 'reference'), { jobId });
  progress(state.currentIndex + 1, state.queue.length, copy ? copy.title : 'Paused');
  await new Promise((resolve) => { continueResolver = resolve; });
  state.pausedForHuman = false;
  emit({ type: 'THROUGH_RESUMED', jobId });
}

async function runFlowJob(job, tabId, settings, isLast) {
  const mode = flowModeOf(job, settings);
  const task = flowTaskOf(job, settings, mode);
  const exec = await sendFlowTab(tabId, 'EXECUTE_TASK', { task, settings });
  if (exec && exec.skipped) {
    await log('info', 'flow task deduped (already processed)', { id: job.id });
    return { mode, skipped: true };
  }
  if (!exec || exec.success === false) throw new Error((exec && exec.error) || 'flow-task-failed');

  if (mode === 'create-image') {
    await sleep(3000);
    if (settings.pauseForReference && !isLast) await pauseForFlowReference(mode, job.id);
  } else if (mode === 'frames-to-video') {
    if (settings.pauseForReference && !isLast) await pauseForFlowReference(mode, job.id);
  } else {
    await waitForVideoPartialCompletion(tabId, settings, isLast);
    if (settings.autoDownload) {
      const dl = await sendFlowTab(tabId, 'DOWNLOAD_VIDEO', { folder: task.folder });
      if (dl && dl.success === false) await log('warning', 'flow download failed', { error: dl.error });
      else await log('success', 'Video downloaded');
    }
    if (!isLast) await sleep(1000 + Math.random() * 1000);
  }
  return { mode };
}

// --- tabs ---------------------------------------------------------------

async function getOrCreateTab(url) {
  const target = new URL(url);
  const domain = target.hostname;
  try {
    const tabs = await chrome.tabs.query({ url: `*://${domain}/*` });
    if (tabs.length > 0) return tabs[0];
  } catch {}
  return chrome.tabs.create({ url, active: true });
}

async function waitTabReady(tabId, timeout = 30000) {
  const start = Date.now();
  for (;;) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab.status === 'complete') return tab;
    } catch { throw new Error('tab-closed'); }
    if (Date.now() - start > timeout) throw new Error('tab-load-timeout');
    await sleep(500);
  }
}

async function ensureContent(tabId, attempts = 3) {
  const ping = () => Promise.race([
    chrome.tabs.sendMessage(tabId, { type: 'THROUGH_PING' }),
    new Promise((_, rej) => setTimeout(() => rej(new Error('ping-timeout')), 2000)),
  ]);
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await ping();
      if (res && res.ok) return true;
    } catch (e) {
      if (i === attempts) break;
      await sleep(600);
    }
  }
  // Fallback (VeoFlow parity): tabs opened before install/reload have no
  // content scripts — inject directly, then re-ping.
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/content/content.js', 'src/sites/flow/flow-content.js'],
    });
    await sleep(1500);
    const res = await ping();
    if (res && res.ok) return true;
  } catch (e) {
    throw new Error('content-script-unreachable: ' + String((e && e.message) || e));
  }
  throw new Error('content-script-unreachable: ping-timeout');
}

async function ensurePageBridge(tabId) {
  // Inject MAIN-world bridge on demand (for authenticated page-context RPC / captcha).
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/injected/pageBridge.js'],
    });
  } catch (e) {
    await log('warning', 'pageBridge inject skipped', { error: String(e.message || e) });
  }
}

// --- job execution ------------------------------------------------------

async function executeJob(job) {
  if (!state.activeTabId) throw new Error('no-active-tab');
  const preview = (job.label || job.id || 'job').toString().slice(0, 80);
  await log('info', `job start: ${preview}`, { id: job.id, siteId: job.siteId || null });

  let res;
  try {
    res = await chrome.tabs.sendMessage(state.activeTabId, {
      type: 'THROUGH_EXECUTE_ACTIONS',
      job,
    });
  } catch (e) {
    throw new Error('content-message-failed: ' + (e.message || e));
  }

  if (!res) throw new Error('empty-content-response');
  if (res.needHuman) {
    // Generic pause — VeoFlow's pauseForReference generalized to any human input
    // (attach file, solve captcha, approve credits, pick reference, etc).
    state.pausedForHuman = true;
    emit({ type: 'THROUGH_PAUSED', jobId: job.id, reason: res.needHuman,
      title: 'Paused for human input', body: res.needHuman, actionLabel: 'Continue' });
    await log('info', `paused for human: ${res.needHuman}`, { jobId: job.id });
    progress(state.currentIndex + 1, state.queue.length, `Paused — ${res.needHuman}`);
    await new Promise((resolve) => { continueResolver = resolve; });
    state.pausedForHuman = false;
    emit({ type: 'THROUGH_RESUMED', jobId: job.id });
    // Re-query content for final status after human continues
    try {
      res = await chrome.tabs.sendMessage(state.activeTabId, { type: 'THROUGH_JOB_STATUS', jobId: job.id });
    } catch {}
  }
  if (res && res.ok === false) throw new Error(res.error || 'job-failed');
  return res;
}

async function processQueue() {
  if (!state.isRunning || state.queue.length === 0) return;
  const total = state.queue.length;
  await log('info', `queue start: ${total} jobs`, { options: state.options });
  const flowSession = { applied: false, settings: null, tabId: null };
  if (state.queue.some((j) => j.siteId === 'flow')) progress(0, total, 'Opening Google Flow...');

  for (; state.currentIndex < state.queue.length; state.currentIndex++) {
    if (!state.isRunning) { await log('info', 'queue stopped by user'); break; }
    const job = state.queue[state.currentIndex];
    if (job.status === 'done') continue;
    job.status = 'running';
    await persistQueue();
    emit({ type: 'THROUGH_QUEUE', queue: state.queue });
    progress(state.currentIndex + 1, total, `Job ${state.currentIndex + 1}/${total}`);

    // One tab per distinct origin; reuse when same domain (bulk-in-same-project pattern).
    try {
      const tab = await getOrCreateTab(job.url);
      state.activeTabId = tab.id;
      try { await chrome.tabs.update(tab.id, { active: true }); } catch {}
      await waitTabReady(tab.id);
      await sleep(1200);
      await ensureContent(tab.id);
      await ensurePageBridge(tab.id);
    } catch (e) {
      job.status = 'failed'; job.error = 'tab-setup: ' + e.message;
      await log('error', `job tab setup failed: ${job.id}`, { error: job.error });
      if (state.options.stopOnError) break;
      continue;
    }

    const isFlowJob = job.siteId === 'flow';
    const isLastJob = state.currentIndex === state.queue.length - 1;
    if (isFlowJob && !flowSession.applied) {
      // First flow job defines run settings; project click + settings applied once.
      flowSession.settings = flowSettingsOf(await flowBaseDefaults(), job);
      try { await sendFlowTab(state.activeTabId, 'CLICK_START_PROJECT'); } catch (e) {
        await log('warning', 'flow start-project failed (continuing)', { error: String(e.message || e) });
      }
      await sleep(2000);
      const ap = await sendFlowTab(state.activeTabId, 'APPLY_SETTINGS', {
        mode: flowModeOf(job, flowSession.settings), settings: flowSession.settings,
      });
      if (ap && ap.success === false) {
        job.status = 'failed'; job.error = 'apply-settings: ' + (ap.error || 'failed');
        await log('error', `job failed: ${job.id}`, { error: job.error });
        emit({ type: 'THROUGH_JOB_FAILED', job });
        if (state.options.stopOnError) { state.currentIndex = state.queue.length; break; }
        continue;
      }
      flowSession.applied = true;
      flowSession.tabId = state.activeTabId;
    }

    const retries = Math.max(0, job.retries || 0);
    let attempt = 0, done = false;
    while (!done && attempt <= retries) {
      try {
        const out = isFlowJob
          ? await runFlowJob(job, state.activeTabId, flowSession.settings, isLastJob)
          : await executeJob(job);
        job.status = 'done'; job.result = out && out.data !== undefined ? out.data : null;
        await log('success', `job done: ${job.id}`);
        done = true;
      } catch (e) {
        attempt++;
        job.error = String(e.message || e);
        if (attempt > retries) {
          job.status = 'failed';
          await log('error', `job failed: ${job.id}`, { error: job.error });
          emit({ type: 'THROUGH_JOB_FAILED', job });
          if (state.options.stopOnError) { state.currentIndex = state.queue.length; break; }
          await sleep(1500);
        } else {
          await log('warning', `job retry ${attempt}/${retries}: ${job.id}`, { error: job.error });
          await sleep(1500);
        }
      }
    }
    await persistQueue();
    emit({ type: 'THROUGH_QUEUE', queue: state.queue });
  }

  if (flowSession.applied && flowSession.tabId) {
    try { await sendFlowTab(flowSession.tabId, 'RESET_SETTINGS_FLAG'); } catch {}
  }
  await reportBridgeResults(state.queue);
  state.isRunning = false;
  await persistQueue();
  emit({ type: 'THROUGH_STATUS', isRunning: false });
  progress(state.queue.length, state.queue.length, 'Completed');
  const remaining = state.queue.filter((j) => j.status !== 'done');
  state.queue = remaining;
  await persistQueue();
  emit({ type: 'THROUGH_QUEUE', queue: remaining });
  await log('success', `queue finished, ${remaining.length} remaining (failed/pending)`);
}

// --- messages -----------------------------------------------------------

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    switch (msg.type) {
      case 'THROUGH_START_JOBS': {
        if (state.isRunning) { sendResponse({ ok: false, error: 'already-running' }); return; }
        state.queue = (msg.jobs || []).map((j, i) => ({
          id: j.id || `job-${Date.now()}-${i}`,
          status: 'pending',
          retries: j.retries || 0,
          ...j,
        }));
        state.options = { concurrency: 1, stopOnError: false, ...(msg.options || {}) };
        state.currentIndex = Math.max(0, (parseInt(state.options.startFrom) || 1) - 1);
        state.isRunning = true;
        await persistQueue();
        emit({ type: 'THROUGH_STATUS', isRunning: true });
        emit({ type: 'THROUGH_QUEUE', queue: state.queue });
        sendResponse({ ok: true, count: state.queue.length });
        processQueue().catch(async (e) => {
          await log('error', 'processQueue crashed', { error: String(e.message || e) });
          state.isRunning = false;
          emit({ type: 'THROUGH_STATUS', isRunning: false });
        });
        return;
      }
      case 'THROUGH_ENQUEUE': {
        const items = (msg.jobs || []).map((j, i) => ({ id: j.id || `job-${Date.now()}-${i}`, status: 'pending', retries: 0, ...j }));
        state.queue.push(...items);
        await persistQueue();
        emit({ type: 'THROUGH_QUEUE', queue: state.queue });
        sendResponse({ ok: true, count: state.queue.length });
        return;
      }
      case 'THROUGH_RETRY': {
        // Working retry (failed jobs only). Absent/dead upstream — implemented here.
        const ids = Array.isArray(msg.ids) ? msg.ids : null;
        let n = 0;
        for (const j of state.queue) {
          if (j.status === 'failed' && (!ids || ids.includes(j.id))) {
            j.status = 'pending'; j.error = null; n++;
          }
        }
        await persistQueue();
        emit({ type: 'THROUGH_QUEUE', queue: state.queue });
        if (n > 0 && !state.isRunning) {
          state.currentIndex = Math.max(0, state.queue.findIndex((j) => j.status === 'pending'));
          state.isRunning = true;
          await persistQueue();
          emit({ type: 'THROUGH_STATUS', isRunning: true });
          sendResponse({ ok: true, retried: n });
          processQueue().catch(async (e) => {
            await log('error', 'processQueue crashed', { error: String(e.message || e) });
            state.isRunning = false;
            emit({ type: 'THROUGH_STATUS', isRunning: false });
          });
          return;
        }
        sendResponse({ ok: true, retried: n });
        return;
      }
      case 'THROUGH_STOP': {
        state.isRunning = false;
        if (continueResolver) { continueResolver(); continueResolver = null; }
        await persistQueue();
        emit({ type: 'THROUGH_STATUS', isRunning: false });
        await log('info', 'stopped by user');
        sendResponse({ ok: true });
        return;
      }
      case 'THROUGH_CONTINUE': {
        if (state.pausedForHuman && continueResolver) {
          continueResolver(); continueResolver = null;
          sendResponse({ ok: true });
        } else sendResponse({ ok: false, error: 'not-paused' });
        return;
      }
      case 'THROUGH_STATUS': {
        sendResponse({ ok: true, isRunning: state.isRunning, paused: state.pausedForHuman, count: state.queue.length, activeTabId: state.activeTabId, bridge: { ...bridge } });
        return;
      }
      case 'THROUGH_BRIDGE_GET': {
        sendResponse({ ok: true, bridge: { ...bridge } });
        return;
      }
      case 'THROUGH_BRIDGE_SET': {
        if (msg.enabled !== undefined) bridge.enabled = msg.enabled === true;
        if (typeof msg.baseUrl === 'string' && /^https?:\/\//.test(msg.baseUrl)) {
          bridge.baseUrl = msg.baseUrl.replace(/\/+$/, '');
        }
        await saveBridgeConfig();
        await setupBridgeAlarm();
        await log('info', `bridge ${bridge.enabled ? 'enabled' : 'disabled'} (${bridge.baseUrl})`);
        sendResponse({ ok: true, bridge: { ...bridge } });
        return;
      }
      case 'THROUGH_BRIDGE_SYNC': {
        const r = await bridgeSync();
        sendResponse({ ok: r.ok !== false, ...r });
        return;
      }
      case 'THROUGH_DOWNLOAD_URL': {
        try {
          const { url, filename } = msg;
          if (!url) throw new Error('no-url');
          chrome.downloads.download({ url, filename: filename || `through_${Date.now()}`, saveAs: false }, (dlId) => {
            if (chrome.runtime.lastError) sendResponse({ ok: false, error: chrome.runtime.lastError.message });
            else sendResponse({ ok: true, downloadId: dlId });
          });
        } catch (e) { sendResponse({ ok: false, error: String(e.message || e) }); }
        return;
      }
      default:
        sendResponse({ ok: false, error: 'unknown-type' });
    }
  })();
  return true;
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId === state.activeTabId) {
    state.activeTabId = null;
    if (state.isRunning) {
      await log('warning', 'active tab closed, stopping queue');
      state.isRunning = false;
      emit({ type: 'THROUGH_STATUS', isRunning: false });
    }
  }
});

chrome.storage.local.get([QUEUE_KEY], (r) => {
  if (r && r[QUEUE_KEY]) { state.queue = r[QUEUE_KEY]; }
});

async function setupBridgeAlarm() {
  try {
    await chrome.alarms.clear('through-bridge');
    if (bridge.enabled) chrome.alarms.create('through-bridge', { periodInMinutes: 1 });
  } catch {}
}

// Without this, clicking the toolbar icon does nothing (MV3 default:
// action clicks are ignored unless a popup is set or this behavior is on).
async function setupPanelBehavior() {
  try {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } catch (e) {
    await log('warning', 'sidePanel behavior not set', { error: String(e.message || e) });
  }
}

chrome.runtime.onInstalled.addListener(() => { void setupPanelBehavior(); });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm && alarm.name === 'through-bridge') {
    bridgeSync().then((r) => {
      if (r && r.ok === false && !r.skipped) log('warning', 'bridge sync: ' + (r.error || 'failed'));
    }).catch(() => {});
  }
});

(async () => {
  await loadBridgeConfig();
  await setupBridgeAlarm();
  await setupPanelBehavior();
})();
console.log('[Through] background engine ready (universal)');
