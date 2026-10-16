const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';

const args = [
  '--remote-debugging-port=9225',
  `--user-data-dir=${PROFILE_DIR}`,
  '--start-maximized',
  '--disable-blink-features=AutomationControlled',
  'https://www.facebook.com/profile.php?id=61595162615338'
];

console.log('Spawning detached Chrome on port 9225...');
const p = spawn(CHROME_PATH, args, {
  detached: true,
  stdio: 'ignore'
});
p.unref();

console.log('Spawned Chrome with PID:', p.pid);
setTimeout(() => {
  process.exit(0);
}, 2000);
