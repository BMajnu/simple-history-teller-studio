/* Through sidepanel (vanilla, zero-build so it loads anywhere). */
let PACKS = {};
let queue = [];
let progress = { current: 0, total: 0, status: 'Ready' };
let runSettings = {}; // per-site run settings (flow pack: exact SettingsTab schema)
let addingRef = false; // dedupe guard: ignore concurrent Add clicks

const $ = (id) => document.getElementById(id);

document.querySelectorAll('nav button').forEach((b) => {
  b.onclick = () => {
    document.querySelectorAll('nav button').forEach((x) => x.classList.remove('active'));
    document.querySelectorAll('section').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    $('tab-' + b.dataset.tab).classList.add('active');
  };
});

async function loadPacks() {
  try {
    const url = chrome.runtime.getURL('src/sites/sitePacks.json');
    PACKS = await (await fetch(url)).json();
  } catch { PACKS = { generic: { label: 'Generic (any site)', match: [], note: 'Pass explicit selectors per action.' } }; }
  const sel = $('siteSel'); sel.innerHTML = '';
  const pv = $('packView'); pv.innerHTML = '';
  for (const [id, p] of Object.entries(PACKS)) {
    const o1 = document.createElement('option'); o1.value = id; o1.textContent = p.label || id; sel.appendChild(o1);
    const o2 = document.createElement('option'); o2.value = id; o2.textContent = p.label || id; pv.appendChild(o2);
  }
  showPack();
}
function showPack() {
  const id = $('packView').value || 'generic';
  $('packJson').value = JSON.stringify(PACKS[id], null, 2);
  $('packNote').textContent = (PACKS[id] && PACKS[id].note) || '';
}
$('packView') && ($('packView').onchange = showPack);
$('siteSel') && ($('siteSel').onchange = async () => { await loadRunSettings($('siteSel').value); renderRunSettings(); });

async function loadRunSettings(siteId) {
  const pack = PACKS[siteId] || {};
  const stored = await chrome.storage.local.get(['through.settings.' + siteId]);
  const saved = stored['through.settings.' + siteId] || {};
  runSettings[siteId] = {};
  for (const f of (pack.settingsSchema || [])) {
    if (saved[f.key] !== undefined) runSettings[siteId][f.key] = saved[f.key];
    else if (f.key === 'model') runSettings[siteId].model = f.defaultVideo;
    else runSettings[siteId][f.key] = f.default;
  }
}

function renderRunSettings() {
  const siteId = ($('siteSel') && $('siteSel').value) || 'generic';
  const pack = PACKS[siteId] || {};
  const box = $('runSettings');
  if (!box) return;
  box.innerHTML = '';
  const schema = pack.settingsSchema || [];
  if (!schema.length) return;
  const st = runSettings[siteId] || {};
  const head = document.createElement('div');
  head.className = 'hint'; head.textContent = 'Run settings (applied once per queue):';
  box.appendChild(head);
  const mode = st.creationMode || 'text-to-video';
  const isImage = mode === 'create-image';
  for (const f of schema) {
    if (f.showIf) {
      const k = Object.keys(f.showIf)[0];
      if (st[k] !== f.showIf[k]) continue;
    }
    const row = document.createElement('div');
    row.className = 'fld';
    const lab = document.createElement('label');
    lab.textContent = (f.key === 'outputCount' && isImage && f.labelImage) ? f.labelImage : f.label;
    if (f.sub) {
      const s = document.createElement('span');
      s.className = 'sub'; s.textContent = f.sub;
      lab.appendChild(document.createElement('br')); lab.appendChild(s);
    }
    row.appendChild(lab);
    let input;
    if (f.type === 'select') {
      input = document.createElement('select');
      for (const o of (f.options || [])) {
        const op = document.createElement('option');
        op.value = o.value; op.textContent = o.label;
        input.appendChild(op);
      }
      input.value = st[f.key] !== undefined ? String(st[f.key]) : String(f.default);
    } else if (f.type === 'model') {
      input = document.createElement('select');
      const list = isImage ? pack.imageModels : pack.videoModels;
      for (const o of (list || [])) {
        const op = document.createElement('option');
        op.value = o.value; op.textContent = o.label;
        input.appendChild(op);
      }
      input.value = st.model || (isImage ? f.defaultImage : f.defaultVideo);
    } else if (f.type === 'toggle') {
      input = document.createElement('input');
      input.type = 'checkbox'; input.checked = !!st[f.key];
    } else if (f.type === 'number') {
      input = document.createElement('input');
      input.type = 'number';
      input.value = st[f.key] !== undefined ? st[f.key] : f.default;
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.placeholder = f.default || '';
      input.value = st[f.key] !== undefined ? st[f.key] : (f.default || '');
    }
    input.onchange = async () => {
      let v = input.type === 'checkbox' ? input.checked : input.value;
      if (input.type === 'number') v = parseFloat(input.value);
      runSettings[siteId][f.key] = v;
      if (f.key === 'creationMode') {
        const mf = (pack.settingsSchema || []).find((x) => x.key === 'model');
        if (mf) runSettings[siteId].model = (v === 'create-image') ? mf.defaultImage : mf.defaultVideo;
      }
      try { await chrome.storage.local.set({ ['through.settings.' + siteId]: runSettings[siteId] }); } catch {}
      renderRunSettings();
    };
    row.appendChild(input);
    box.appendChild(row);
    if (f.note && f.key === 'model') {
      const n = document.createElement('div');
      n.className = 'hint'; n.textContent = f.note;
      box.appendChild(n);
    }
  }
}

// Build generic jobs from bulk text + selected pack.
// IMPORTANT: pack only supplies DEFAULT selectors; every job stays explicit JSON
// so any local agent (studio :4000, FlowKit :8100, plain script) can bypass the panel.
function bulkToJobs(text, siteId) {
  const pack = PACKS[siteId] || PACKS.generic || {};
  const d = pack.defaults || {};
  const chunks = String(text).split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return chunks.map((chunk, i) => {
    const lines = chunk.split('\n');
    let label = `job-${i + 1}`;
    let payload = chunk;
    if (lines[0].startsWith('##')) { label = lines[0].replace(/^##\s*/, '').slice(0, 80); payload = lines.slice(1).join('\n'); }
    const job = {
      id: `panel-${Date.now()}-${i}`,
      label,
      siteId,
      url: d.url || '',
      actions: [
        { op: 'waitFor', args: { selectors: d.promptBox || ['textarea', 'div[contenteditable="true"]'], timeout: 15000 } },
        { op: 'fill', args: { selector: (d.promptBox || ['textarea'])[0], text: payload, clearFirst: true } },
        ...(d.submit ? [{ op: 'click', args: { selector: d.submit } }] : []),
      ],
      meta: { payload: payload.slice(0, 2000), pack: siteId },
    };
    if (siteId === 'flow') {
      // Exact flow run config travels with each job; engine applies it once.
      job.flow = { ...(runSettings[siteId] || {}) };
      job.type = job.flow.creationMode || 'text-to-video';
    }
    return job;
  });
}

function renderQueue() {
  const box = $('qList'); box.innerHTML = '';
  queue.filter((j) => j.status !== 'failed').forEach((j) => {
    const div = document.createElement('div'); div.className = 'job';
    const s = document.createElement('span'); s.innerHTML = `<b class="st-${j.status || 'pending'}">●</b> ${(j.label || j.id || '').slice(0, 60)}`;
    const del = document.createElement('button'); del.textContent = '✕'; del.className = 'ghost'; del.style.flex = '0 0 auto';
    del.onclick = () => { queue = queue.filter((x) => x.id !== j.id); renderQueue(); };
    div.appendChild(s); div.appendChild(del); box.appendChild(div);
  });
  $('prog').textContent = queue.length ? `${progress.status} (${progress.current}/${progress.total}) · ${queue.length} queued` : progress.status;
  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  if ($('progBar')) $('progBar').style.width = pct + '%';
  const anyDone = queue.some((j) => j.status === 'done');
  if ($('btnClear')) $('btnClear').style.display = anyDone ? '' : 'none';
  // Failed tasks (exact template) with working retry
  const failed = queue.filter((j) => j.status === 'failed');
  const fb = $('failedList');
  if (fb) {
    fb.innerHTML = '';
    if (failed.length) {
      const h = document.createElement('div');
      h.className = 'hint'; h.textContent = `Failed Tasks (${failed.length})`;
      fb.appendChild(h);
      failed.forEach((j) => {
        const div = document.createElement('div'); div.className = 'job';
        const label = ((j.meta && j.meta.payload) || j.label || j.id || '').slice(0, 50);
        const s = document.createElement('span');
        s.innerHTML = `<b class="st-failed">●</b> ${label}...<br/><span class="hint">${(j.error || 'Unknown error').slice(0, 120)}</span>`;
        const rb = document.createElement('button');
        rb.textContent = 'Retry'; rb.className = 'ghost'; rb.style.flex = '0 0 auto'; rb.title = 'Retry this task';
        rb.onclick = () => chrome.runtime.sendMessage({ type: 'THROUGH_RETRY', ids: [j.id] });
        div.appendChild(s); div.appendChild(rb); fb.appendChild(div);
      });
    }
  }
  if ($('failedActions')) $('failedActions').style.display = failed.length ? '' : 'none';
}

$('btnEnqueue').onclick = () => {
  if (addingRef) return; // exact dedupe guard: ignore concurrent Add clicks
  addingRef = true;
  const jobs = bulkToJobs($('bulk').value, $('siteSel').value || 'generic');
  if (!jobs.length) { addingRef = false; return; }
  // Fill missing URL from current tab when pack has no fixed URL (generic flow).
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabUrl = tabs && tabs[0] && tabs[0].url;
    const now = Date.now();
    const recent = queue
      .filter((p) => p.addedAt > now - 2000)
      .map((p) => ((p.meta && p.meta.payload) || p.label || ''));
    const fresh = jobs.filter((j) => !recent.includes(((j.meta && j.meta.payload) || j.label || '')));
    fresh.forEach((j) => {
      if (!j.url && tabUrl) j.url = tabUrl;
      j.addedAt = now;
      queue.push(j);
    });
    chrome.storage.local.set({ 'through.queue.panel': queue });
    renderQueue();
    $('bulk').value = '';
    setTimeout(() => { addingRef = false; }, 500);
  });
};
$('btnImport').onclick = () => $('filePick').click();
$('filePick').onchange = (e) => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      if (f.name.endsWith('.json')) {
        const arr = JSON.parse(r.result);
        queue.push(...(Array.isArray(arr) ? arr : arr.jobs || []));
      } else $('bulk').value = String(r.result);
      renderQueue();
    } catch (err) { alert('Import failed: ' + err.message); }
  };
  r.readAsText(f);
};

$('btnStart').onclick = () => {
  if (!queue.length) return;
  const st = runSettings[($('siteSel') && $('siteSel').value) || 'generic'] || {};
  const options = { stopOnError: false };
  if (st.startFrom) options.startFrom = st.startFrom;
  chrome.runtime.sendMessage({ type: 'THROUGH_START_JOBS', jobs: queue, options }, () => renderQueue());
};
$('btnStop').onclick = () => chrome.runtime.sendMessage({ type: 'THROUGH_STOP' });
$('btnContinue').onclick = () => chrome.runtime.sendMessage({ type: 'THROUGH_CONTINUE' });
$('btnClear').onclick = () => { queue = queue.filter((j) => j.status !== 'done'); renderQueue(); };
if ($('btnRetryAll')) $('btnRetryAll').onclick = () => chrome.runtime.sendMessage({ type: 'THROUGH_RETRY' });
if ($('btnClearFailed')) $('btnClearFailed').onclick = () => {
  queue = queue.filter((j) => j.status !== 'failed');
  chrome.storage.local.set({ 'through.queue.panel': queue });
  renderQueue();
};

function renderBridge(cfg) {
  if (!cfg) return;
  $('bridgeState').textContent = `${cfg.enabled ? 'on' : 'off'} · ${cfg.baseUrl || ''}`;
  $('bridgeUrl').value = cfg.baseUrl || 'http://127.0.0.1:4000';
  $('btnBridgeToggle').textContent = cfg.enabled ? 'Disable' : 'Enable';
}
async function loadBridge() {
  try {
    const r = await chrome.runtime.sendMessage({ type: 'THROUGH_BRIDGE_GET' });
    if (r && r.ok) renderBridge(r.bridge);
  } catch {}
}
$('btnBridgeSave').onclick = async () => {
  const r = await chrome.runtime.sendMessage({ type: 'THROUGH_BRIDGE_SET', baseUrl: $('bridgeUrl').value });
  if (r && r.ok) renderBridge(r.bridge);
};
$('btnBridgeToggle').onclick = async () => {
  const cur = $('btnBridgeToggle').textContent !== 'Disable';
  const r = await chrome.runtime.sendMessage({ type: 'THROUGH_BRIDGE_SET', enabled: cur, baseUrl: $('bridgeUrl').value });
  if (r && r.ok) renderBridge(r.bridge);
};
$('btnBridgeSync').onclick = async () => {
  const r = await chrome.runtime.sendMessage({ type: 'THROUGH_BRIDGE_SYNC' });
  if (r && r.ok === false && r.error) alert('Bridge sync: ' + r.error);
};

document.querySelectorAll('[data-flow]').forEach((b) => {
  b.onclick = async () => {
    try {
      const url = chrome.runtime.getURL(`examples/${b.dataset.flow}.json`);
      const data = await (await fetch(url)).json();
      $('flowPrev').textContent = JSON.stringify(data, null, 2).slice(0, 3000);
      const jobs = Array.isArray(data) ? data : data.jobs || [];
      queue.push(...jobs.map((j, i) => ({ id: `flow-${Date.now()}-${i}`, status: 'pending', ...j })));
      renderQueue();
    } catch (e) { $('flowPrev').textContent = 'Load failed: ' + e.message; }
  };
});

async function refreshLogs() {
  const { 'through.logs': logs = [] } = await chrome.storage.local.get(['through.logs']);
  $('logBox').innerHTML = logs.slice(-200).map((l) => `<div>[${l.iso.slice(11, 19)}] <b>${l.level}</b> ${String(l.message).slice(0, 220)}</div>`).join('');
  $('logBox').scrollTop = 1e9;
  const okCount = logs.filter((l) => l.level === 'success').length;
  const failedCount = queue.filter((j) => j.status === 'failed').length;
  const rate = logs.length ? Math.round((okCount / logs.length) * 100) : 0;
  const videos = logs.filter((l) => l.level === 'success' && /video/i.test(l.message || '')).length;
  if ($('statsRow')) $('statsRow').textContent =
    `Total Logs: ${logs.length} · Failed Tasks: ${failedCount} · Success Rate: ${rate}% · Videos Generated: ${videos}`;
}
$('btnRefreshLogs').onclick = refreshLogs;
$('btnClearLogs').onclick = async () => { await chrome.storage.local.set({ 'through.logs': [] }); refreshLogs(); };
$('btnExport').onclick = async () => {
  const { 'through.logs': logs = [] } = await chrome.storage.local.get(['through.logs']);
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), queue, logs }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'through-export.json'; a.click();
};

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'THROUGH_PROGRESS') { progress = msg.data; renderQueue(); }
  if (msg.type === 'THROUGH_QUEUE') { queue = msg.queue || queue; renderQueue(); }
  if (msg.type === 'THROUGH_PAUSED') {
    $('pausedBox').style.display = 'block';
    $('pausedTitle').textContent = msg.title || ('Paused for human input (' + (msg.reason || '') + ')');
    $('pausedBody').textContent = msg.body || msg.reason || '';
    $('continueLabel').textContent = msg.actionLabel || 'Continue';
  }
  if (msg.type === 'THROUGH_RESUMED') { $('pausedBox').style.display = 'none'; }
  if (msg.type === 'THROUGH_LOG') refreshLogs();
});

(async function init() {
  await loadPacks();
  await loadRunSettings(($('siteSel') && $('siteSel').value) || 'generic');
  renderRunSettings();
  await loadBridge();
  const s = await chrome.storage.local.get(['through.queue.panel']);
  if (s['through.queue.panel']) queue = s['through.queue.panel'];
  renderQueue(); refreshLogs();
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs && tabs[0] && tabs[0].url;
    if (url) {
      $('domain').textContent = new URL(url).hostname + ' — connected';
      $('dot').classList.add('on');
    }
  });
})();
