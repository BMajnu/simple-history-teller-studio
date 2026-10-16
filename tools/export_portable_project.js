'use strict';

// Create a transfer-ready Studio workspace containing one complete project,
// its instructions, browser runners and the optional diagnostic evidence.
// It intentionally excludes Chromium/Electron cookies and logged-in accounts:
// credentials are machine/user-specific and must be signed in again.
//
// Usage:
//   node tools/export_portable_project.js <project_id> [destination] [--zip] [--hash]

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const positional = process.argv.slice(2).filter((arg) => !String(arg).startsWith('--'));
const flags = process.argv.slice(2).filter((arg) => String(arg).startsWith('--'));
const [requestedId, requestedDestination] = positional;
const id = String(requestedId || '').trim();
if (!/^[\w-]+$/.test(id)) {
  throw new Error('Usage: node tools/export_portable_project.js <project_id> [destination] [--zip] [--hash]');
}

const sourceProject = path.join(ROOT, 'projects', id);
if (!fs.existsSync(path.join(sourceProject, 'project.json'))) {
  throw new Error(`Project not found: ${sourceProject}`);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const exportRoot = requestedDestination
  ? path.resolve(requestedDestination)
  : path.join(ROOT, 'exports', `${id}__portable__${timestamp}`);
const withZip = flags.includes('--zip');
const withHash = flags.includes('--hash');

if (fs.existsSync(exportRoot)) throw new Error(`Destination already exists: ${exportRoot}`);
fs.mkdirSync(exportRoot, { recursive: true });

function copy(relative) {
  const source = path.join(ROOT, relative);
  const destination = path.join(exportRoot, relative);
  if (!fs.existsSync(source)) return false;
  fs.cpSync(source, destination, {
    recursive: true,
    force: false,
    errorOnExist: true,
    filter: (candidate) => {
      const rel = path.relative(ROOT, candidate).split(path.sep).join('/');
      // The source tree contains historic test screenshots and downloaded media
      // in tools/. They are not runtime dependencies and would make each
      // portable workspace unnecessarily large. Project media is copied whole.
      if (rel.startsWith('tools/') && fs.statSync(candidate).isFile()) {
        return ['.js', '.json', '.md', '.ps1', '.cmd', '.bat'].includes(path.extname(candidate).toLowerCase());
      }
      return true;
    },
  });
  return true;
}

// `node_modules` is deliberately not copied. It is OS/architecture dependent;
// RUN_PORTABLE.cmd installs the declared, locked dependencies on the target PC.
const portableFiles = [
  'electron', 'lib', 'public', 'tools', 'instructions', 'references', 'bin',
  'server.js', 'daemon.js', 'package.json', 'package-lock.json',
  'README.md', 'SYSTEM_PROMPT.md', 'AUTONOMOUS_WORKFLOW_SOP.md',
];
const copied = portableFiles.filter(copy);
copy(path.join('projects', id));

const launchScript = `@echo off\r\nsetlocal\r\ncd /d "%~dp0"\r\nset SIMPLE_ITIHASH_ROOT=%CD%\r\nwhere node >nul 2>nul || (echo Node.js 20+ is required. Install it, then run this file again. & pause & exit /b 1)\r\nif not exist node_modules (call npm ci || (pause & exit /b 1))\r\ncall npm run electron\r\n`;
fs.writeFileSync(path.join(exportRoot, 'RUN_PORTABLE.cmd'), launchScript, 'utf8');

function collect(dir, prefix = '') {
  const rows = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const absolute = path.join(dir, entry.name);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) rows.push(...collect(absolute, relative));
    else if (entry.isFile()) {
      const stat = fs.statSync(absolute);
      rows.push({
        path: relative,
        bytes: stat.size,
        sha256: withHash ? crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex') : null,
      });
    }
  }
  return rows;
}

const files = collect(exportRoot).filter((row) => row.path !== 'portable-manifest.json');
const manifest = {
  schemaVersion: 1,
  createdAt: new Date().toISOString(),
  projectId: id,
  workspace: 'Simple Itihash Production Studio',
  copiedRoots: [...copied, path.posix.join('projects', id)],
  fileCount: files.length,
  totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
  hashesIncluded: withHash,
  security: {
    credentialsIncluded: false,
    note: 'Browser profiles, cookies, API keys and logged-in accounts are deliberately excluded. Sign in on the destination computer.',
  },
  launch: 'RUN_PORTABLE.cmd',
  files,
};
fs.writeFileSync(path.join(exportRoot, 'portable-manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

let archive = null;
if (withZip) {
  const archivePath = `${exportRoot}.zip`;
  const tar = process.platform === 'win32' ? 'tar.exe' : 'tar';
  const result = spawnSync(tar, ['-a', '-c', '-f', archivePath, '-C', exportRoot, '.'], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Could not create archive: ${archivePath}`);
  archive = archivePath;
}

console.log(JSON.stringify({ ok: true, directory: exportRoot, archive, files: manifest.fileCount, bytes: manifest.totalBytes }, null, 2));
