const { spawn } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profileDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';

console.log('Spawning independent Chrome instance on port 9224...');
const child = spawn(chromePath, [
  '--remote-debugging-port=9224',
  `--user-data-dir=${profileDir}`,
  '--disable-blink-features=AutomationControlled',
  '--no-first-run',
  '--no-default-browser-check'
], {
  detached: true,
  stdio: 'ignore'
});

child.unref();
console.log('Chrome process spawned with PID:', child.pid);
