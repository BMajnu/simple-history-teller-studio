'use strict';

// Read-only environment check for a copied Studio workspace.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const commandWorks = (command, args) => {
  const result = spawnSync(command, args, { cwd: root, stdio: 'ignore', shell: process.platform === 'win32' });
  return result.status === 0;
};
const checks = [
  ['server.js', fs.existsSync(path.join(root, 'server.js'))],
  ['daemon.js', fs.existsSync(path.join(root, 'daemon.js'))],
  ['Electron entry point', fs.existsSync(path.join(root, 'electron', 'main.js'))],
  ['Automation observability module', fs.existsSync(path.join(root, 'lib', 'automation-observability.js'))],
  ['Node.js 20+', Number(process.versions.node.split('.')[0]) >= 20],
  ['npm dependencies', fs.existsSync(path.join(root, 'node_modules', 'electron')) && fs.existsSync(path.join(root, 'node_modules', 'playwright-core'))],
  ['FFmpeg (bundled or PATH)', fs.existsSync(path.join(root, 'bin', 'ffmpeg.exe')) || commandWorks('ffmpeg', ['-version'])],
  ['Project folder', fs.existsSync(path.join(root, 'projects'))],
];
const result = {
  ok: checks.every(([, ok]) => ok),
  root,
  checkedAt: new Date().toISOString(),
  checks: checks.map(([name, ok]) => ({ name, ok })),
  next: 'Browser sessions are intentionally not transferred. Start RUN_PORTABLE.cmd, then sign in to each AI account in the Automation Browser.',
};
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.ok ? 0 : 1;
