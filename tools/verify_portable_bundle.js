'use strict';

// Usage: node tools/verify_portable_bundle.js <portable-workspace-directory>
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const dir = path.resolve(process.argv[2] || '');
const manifestPath = path.join(dir, 'portable-manifest.json');
if (!fs.existsSync(manifestPath)) throw new Error(`portable-manifest.json not found in ${dir}`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const missing = [];
const mismatched = [];

for (const file of manifest.files || []) {
  const full = path.join(dir, file.path);
  if (!fs.existsSync(full)) { missing.push(file.path); continue; }
  if (Number(fs.statSync(full).size) !== Number(file.bytes)) mismatched.push({ path: file.path, reason: 'size' });
  if (file.sha256) {
    const hash = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
    if (hash !== file.sha256) mismatched.push({ path: file.path, reason: 'sha256' });
  }
}

const result = { ok: missing.length === 0 && mismatched.length === 0, projectId: manifest.projectId, missing, mismatched };
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.ok ? 0 : 1;
