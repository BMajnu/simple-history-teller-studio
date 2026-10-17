/**
 * Simple Studio (সিম্পল স্টুডিও) — Native Windows Desktop Launcher
 * Launches the studio backend and opens a dedicated desktop window
 * powered by Windows Edge/WebView Application Mode with GPU acceleration.
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = 4000;
const URL = `http://localhost:${PORT}`;
const EDGE_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  process.env.LOCALAPPDATA + '\\Microsoft\\Edge\\Application\\msedge.exe'
];

function isServerRunning() {
  return new Promise((resolve) => {
    const req = http.get(URL, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function startServer() {
  console.log('🚀 Starting Simple Studio Engine in background...');
  const serverProc = spawn('node', ['server.js'], {
    cwd: path.resolve(__dirname, '..'),
    detached: true,
    stdio: 'ignore'
  });
  serverProc.unref();
}

async function waitForServer(retries = 30) {
  for (let i = 0; i < retries; i++) {
    if (await isServerRunning()) return true;
    await new Promise(r => setTimeout(r, 600));
  }
  return false;
}

function findEdge() {
  for (const p of EDGE_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function launch() {
  console.log('======================================================');
  console.log('🎬 Simple Studio (সিম্পল স্টুডিও) — Desktop Video Editor');
  console.log('======================================================');

  const running = await isServerRunning();
  if (!running) {
    startServer();
    console.log('⏳ Waiting for Simple Studio Server to initialize on port 4000...');
    const ok = await waitForServer();
    if (!ok) {
      console.error('❌ Failed to start Simple Studio Server. Please check logs.');
      process.exit(1);
    }
  }
  console.log('✓ Simple Studio Server is ONLINE at', URL);

  const edgeBin = findEdge();
  const profileDir = path.resolve(__dirname, '..', '_desktop_profile');
  if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
  }

  if (edgeBin) {
    console.log('🖥️ Opening Simple Studio Desktop Window...');
    const edgeArgs = [
      `--app=${URL}`,
      '--window-size=1600,950',
      `--user-data-dir=${profileDir}`,
      '--enable-gpu-rasterization',
      '--enable-zero-copy',
      '--ignore-gpu-blocklist',
      '--disable-features=Translate',
      '--no-first-run',
      '--no-default-browser-check'
    ];
    const appWindow = spawn(edgeBin, edgeArgs, { detached: true, stdio: 'ignore' });
    appWindow.unref();
    console.log('🎉 Simple Studio launched successfully!');
  } else {
    console.log('Opening in default browser...');
    const startCmd = spawn('cmd.exe', ['/c', 'start', URL], { detached: true, stdio: 'ignore' });
    startCmd.unref();
  }
}

launch().catch(err => {
  console.error('Launch Error:', err);
  process.exit(1);
});
