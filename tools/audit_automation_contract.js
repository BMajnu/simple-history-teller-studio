'use strict';

// Static migration audit. It does not execute browser automation or modify a
// project unless --write is supplied.
//
//   node tools/audit_automation_contract.js
//   node tools/audit_automation_contract.js --write
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOOLS = path.join(ROOT, 'tools');
const CANONICAL = new Set([
  'test_parallel_images_10.js',
  'aistudio_speech_helper.js',
  'dispatch.js',
  'try_lyria_multi.js',
  'dispatch_bgm_electron.js',
  'selftest.js',
  'daemon_run.js',
]);

function jsFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return jsFiles(full);
    return entry.isFile() && entry.name.endsWith('.js') ? [full] : [];
  });
}

function scan(file) {
  const text = fs.readFileSync(file, 'utf8');
  const issue = (id, pattern, guidance) => ({ id, guidance, lines: text.split(/\r?\n/)
    .map((line, index) => pattern.test(line.replace(/\/\/.*$/, '')) ? index + 1 : null).filter(Boolean) });
  const issues = [
    issue('foreground_tab', /\.bringToFront\s*\(/, 'Use a named background tab plus focus emulation; never foreground the worker.'),
    issue('arbitrary_page', /pages\(\)\s*\[\s*0\s*\]/, 'Resolve exactly one unique URL marker or toolbar tab name.'),
    issue('dom_synthetic_submit', /(?:querySelector|querySelectorAll).*\.click\(\)|\.click\(\).*dispatchEvent/, 'Use Playwright locator.click({ force: true }) and verify a state transition.'),
  ].filter((entry) => entry.lines.length);
  return { file: path.relative(ROOT, file).split(path.sep).join('/'), canonical: CANONICAL.has(path.basename(file)), issues };
}

const report = {
  schemaVersion: 1,
  auditedAt: new Date().toISOString(),
  policy: 'Named background workers only; trusted locator click for Run/Generate; no foregrounding and no pages()[0] fallback.',
  files: jsFiles(TOOLS).map(scan).filter((entry) => entry.issues.length),
};
report.summary = {
  legacyFilesWithFindings: report.files.filter((entry) => !entry.canonical).length,
  canonicalFilesWithFindings: report.files.filter((entry) => entry.canonical).length,
  findings: report.files.reduce((sum, entry) => sum + entry.issues.length, 0),
};

if (process.argv.includes('--write')) {
  const dir = path.join(ROOT, 'projects', '_automation', 'automation_audits');
  fs.mkdirSync(dir, { recursive: true });
  const output = path.join(dir, `audit_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(output, JSON.stringify(report, null, 2), 'utf8');
  report.output = output;
}
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.summary.canonicalFilesWithFindings ? 1 : 0;
