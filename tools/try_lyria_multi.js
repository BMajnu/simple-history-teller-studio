// Bounded Lyria multi-worker orchestrator.
// It delegates dispatch to dispatch.js, which owns named tabs and state-gated UI
// readiness, then harvests the generated audio by that exact run ID.
//
// Run all workers: node tools/try_lyria_multi.js
// Harvest a known existing run only: $env:RUN_ID='lyria-...'; $env:HARVEST_ONLY='1'; node tools/try_lyria_multi.js
// Dry surface test: $env:DRY='1'; node tools/try_lyria_multi.js
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PROJECT_ID = process.env.PROJECT_ID || '_automation';
const ACCOUNT_SLOT = process.env.ACCOUNT_SLOT || 'unknown';
const OUTDIR = path.join(ROOT, 'projects', PROJECT_ID, 'audio', 'bgm_candidates');
const WORKERS = ['m0', 'm1', 'm2'];
const FFMPEG_PROBE = path.join(ROOT, 'bin', 'ffprobe.exe');

function post(body, ms) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const req = http.request({
      host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: ms,
    }, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(raw) }); }
        catch { reject(new Error(`Daemon returned invalid JSON (${raw.length} bytes)`)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('Daemon timeout')));
    req.write(data);
    req.end();
  });
}

function outputFile(worker) {
  return path.join(OUTDIR, `lyria_multi${worker.slice(1)}.mp3`);
}

function hasSavedOutput(worker) {
  try { return fs.statSync(outputFile(worker)).size > 50000; }
  catch { return false; }
}

function runDispatch(active) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, 'dispatch.js')], {
      cwd: ROOT,
      env: { ...process.env, PROJECT_ID, ACCOUNT_SLOT, WORKERS: active.join(','), DRY: process.env.DRY === '1' ? '1' : '' },
      windowsHide: true,
    });
    let out = '';
    child.stdout.on('data', (chunk) => { out += chunk; process.stdout.write(chunk); });
    child.stderr.on('data', (chunk) => { process.stderr.write(chunk); });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(`Dispatch exited ${code}`));
      const runId = out.match(/^RUN_ID=(.+)$/m)?.[1]?.trim();
      if (!runId) return reject(new Error('Dispatch did not report RUN_ID'));
      resolve(runId);
    });
  });
}

function harvestCode(runId, workers) {
  return `return (async () => {
    const fs = require('fs');
    const cp = require('child_process');
    const OUTDIR = ${JSON.stringify(OUTDIR)};
    const PROBE = ${JSON.stringify(FFMPEG_PROBE)};
    const RUN_ID = ${JSON.stringify(runId)};
    const workers = ${JSON.stringify(workers)};
    const pages = () => browser.contexts().flatMap((context) => context.pages());
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const pending = workers.map((worker) => ({ worker, marker: 'si_dispatch=' + encodeURIComponent(RUN_ID + '-' + worker), stable: 0 }));
    const done = {};
    const deadline = Date.now() + 300000;
    while (Date.now() < deadline && pending.some((item) => !done[item.worker])) {
      for (const item of pending) {
        if (done[item.worker]) continue;
        const matches = pages().filter((p) => (p.url() || '').includes(item.marker));
        const pg = matches.length === 1 ? matches[0] : null;
        if (!pg) { item.missing = (item.missing || 0) + 1; continue; }
        try {
          await automation.watchPage(pg, { agentName: 'bgm-worker-' + item.worker, accountSlot: ${JSON.stringify(ACCOUNT_SLOT)}, tabName: RUN_ID + '-' + item.worker });
          const state = await pg.evaluate(() => {
            const text = document.body.innerText;
            const audio = [...document.querySelectorAll('audio')]
              .map((a) => ({ src: a.currentSrc || a.src || '', duration: a.duration || 0 }))
              .filter((a) => a.src.startsWith('data:audio/'))
              .sort((a, b) => b.duration - a.duration);
            const error = text.match(/generation failed[^.]{0,120}|rate limit[^.]{0,120}|permission denied[^.]{0,120}/i);
            return { audio, busy: /thinking|generating|composing/i.test(text.slice(0, 6000)), error: error ? error[0] : null };
          });
          if (state.error) { done[item.worker] = { fail: state.error }; continue; }
          const best = state.audio[0];
          if (!state.busy && best && best.duration > 30) item.stable += 1; else item.stable = 0;
          if (item.stable < 2) continue;
          const dest = OUTDIR + '/lyria_multi' + item.worker.slice(1) + '.mp3';
          fs.writeFileSync(dest, Buffer.from(best.src.slice(best.src.indexOf(',') + 1), 'base64'));
          const duration = Number(cp.execFileSync(PROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', dest], { encoding: 'utf8' }).trim());
          done[item.worker] = { ok: duration > 30, dest, bytes: fs.statSync(dest).size, duration };
        } catch (error) {
          item.errors = (item.errors || 0) + 1;
          if (item.errors >= 3) done[item.worker] = { fail: String(error.message || error).slice(0, 120) };
        }
      }
      if (pending.some((item) => !done[item.worker])) await sleep(6000);
    }
    return workers.map((worker) => ({ worker, ...(done[worker] || { fail: 'generation timeout' }) }));
  })()`;
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const requested = (process.env.WORKERS || '').split(',').map((worker) => worker.trim()).filter(Boolean);
  const wanted = requested.length ? WORKERS.filter((worker) => requested.includes(worker)) : WORKERS;
  if (!wanted.length) throw new Error('No valid workers requested');
  const active = wanted.filter((worker) => !hasSavedOutput(worker));
  if (!active.length) { console.log('ALL REQUESTED OUTPUTS ALREADY SAVED'); return; }

  const harvestOnly = process.env.HARVEST_ONLY === '1';
  const runId = harvestOnly ? process.env.RUN_ID : await runDispatch(active);
  if (!runId) throw new Error('HARVEST_ONLY=1 requires RUN_ID');
  if (process.env.DRY === '1') { console.log(`DRY DISPATCH PASS — run=${runId}; no audio requested`); return; }

  console.log(`Harvesting ${active.join(', ')} for ${runId}...`);
  const response = await post({
    code: harvestCode(runId, active),
    run: { projectId: PROJECT_ID, workflow: 'bgm_harvest', agentName: 'bgm-fleet', accountSlot: ACCOUNT_SLOT, tabName: runId, captureIntervalMs: 5000 },
  }, 360000);
  const rows = response.json?.result || [];
  let ok = 0;
  for (const row of rows) {
    if (row.ok) {
      ok += 1;
      console.log(`${row.worker}: SAVED ${(row.bytes / 1024).toFixed(0)}KB, ${row.duration.toFixed(1)}s → ${row.dest}`);
    } else console.log(`${row.worker}: FAIL ${row.fail || 'unknown'}`);
  }
  console.log(ok === active.length ? `MULTI PASS ${ok}/${active.length}` : `MULTI RESULT ${ok}/${active.length}`);
  process.exitCode = ok === active.length ? 0 : 2;
}

main().catch((error) => { console.error(`FATAL: ${error.message}`); process.exit(1); });
