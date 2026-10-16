// Generic evidence-aware daemon runner. A payload must resolve an exact target
// itself or call automation.watchPage() for each named worker; it must never
// foreground a page or fall back to pages()[0].
// Run: $env:PROJECT_ID='my_episode'; node tools/daemon_run.js <payload.js> [targetUrlSubstring]
const fs = require('fs');
const http = require('http');
const [codeFile, target] = process.argv.slice(2);
if (!codeFile) { console.error('usage: node tools/daemon_run.js <payload.js> [target]'); process.exit(1); }
const body = {
  code: fs.readFileSync(codeFile, 'utf8'),
  run: {
    projectId: process.env.PROJECT_ID || '_automation',
    workflow: process.env.WORKFLOW || 'ad_hoc',
    agentName: process.env.AGENT_NAME || 'daemon-runner',
    accountSlot: process.env.ACCOUNT_SLOT || 'unknown',
    tabName: process.env.TAB_NAME || path.basename(codeFile, path.extname(codeFile)),
    captureIntervalMs: Number(process.env.CAPTURE_INTERVAL_MS || 5000),
  },
};
if (target) body.targetUrl = target;
const data = Buffer.from(JSON.stringify(body), 'utf8');
const req = http.request({ host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: 240000 }, (res) => {
  let raw = '';
  res.on('data', (c) => { raw += c; });
  res.on('end', () => { console.log('HTTP ' + res.statusCode); console.log(raw.slice(0, 3000)); });
});
req.on('error', (e) => { console.error('DAEMON ERR:', e.message); process.exit(1); });
req.on('timeout', () => { req.destroy(new Error('timeout')); });
req.write(data);
req.end();
