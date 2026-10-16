'use strict';

// Project-local evidence for every browser automation run. This module is kept
// dependency-free so it works in both the development checkout and the
// electron-builder portable bundle.
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');

const DEFAULT_INTERVAL_MS = 5000;
const MIN_INTERVAL_MS = 5000;
const MAX_INTERVAL_MS = 10000;
const MAX_SCREENSHOTS = 240; // 20 minutes at the 5-second minimum.

function safeSegment(value, fallback) {
  const cleaned = String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^[.]+|[.]+$/g, '')
    .slice(0, 96);
  return cleaned || fallback;
}

function clampInterval(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_INTERVAL_MS;
  return Math.max(MIN_INTERVAL_MS, Math.min(MAX_INTERVAL_MS, Math.round(n)));
}

function isoNow() { return new Date().toISOString(); }

function bounded(promise, timeoutMs, label) {
  let timer = null;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} exceeded ${timeoutMs}ms`)), timeoutMs);
    timer.unref?.();
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function redacted(value, limit = 8000) {
  return String(value || '')
    .replace(/AIza[\w-]{20,}/g, '[REDACTED_GOOGLE_KEY]')
    .replace(/\b(?:sk|rk)_[A-Za-z0-9_-]{16,}\b/g, '[REDACTED_SECRET]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]')
    .slice(0, limit);
}

function accountFromUrl(url) {
  const match = String(url || '').match(/\/u\/(\d+)(?:\/|\?|$)/i);
  return match ? match[1] : null;
}

function projectFromCode(code) {
  const match = String(code || '').match(/projects[\\/]([A-Za-z0-9_-]+)/i);
  return match ? match[1] : null;
}

function atomicJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  try { fs.renameSync(tmp, file); }
  catch {
    // Windows can briefly lock a recently-read JSON file. The copied result is
    // still complete because the temporary file was fully written first.
    fs.copyFileSync(tmp, file);
    try { fs.unlinkSync(tmp); } catch {}
  }
}

function appendNdjson(file, row) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, `${JSON.stringify(row)}\n`, 'utf8');
}

function compactResult(result) {
  try {
    const text = JSON.stringify(result);
    if (text.length <= 4000) return result;
    return { truncated: true, preview: redacted(text, 4000) };
  } catch {
    return redacted(result, 4000);
  }
}

class WorkerMonitor {
  constructor(run, page, metadata) {
    this.run = run;
    this.page = page;
    this.metadata = metadata;
    this.agentKey = safeSegment(
      `${metadata.agentName || 'agent'}__account_u${metadata.accountSlot ?? 'unknown'}${metadata.tabName ? `__${metadata.tabName}` : ''}`,
      'agent__account_uunknown',
    );
    this.dir = path.join(run.agentsDir, this.agentKey);
    this.screensDir = path.join(this.dir, 'screenshots');
    this.statesDir = path.join(this.dir, 'states');
    this.eventsFile = path.join(this.dir, 'events.ndjson');
    this.statusFile = path.join(this.dir, 'status.json');
    this.errorFile = path.join(this.dir, 'failure.json');
    this.interval = null;
    this.captureInFlight = null;
    this.captureNumber = 0;
    this.started = false;
    this.finished = false;
    this.bound = [];
    this.status = {
      schemaVersion: 1,
      state: 'created',
      startedAt: null,
      finishedAt: null,
      captures: 0,
      intervalMs: run.intervalMs,
      metadata: this.metadata,
      directory: this.dir,
    };
  }

  writeStatus(extra) {
    if (extra) Object.assign(this.status, extra);
    atomicJson(this.statusFile, this.status);
    this.run.updateSummary();
  }

  event(type, detail) {
    appendNdjson(this.eventsFile, {
      at: isoNow(),
      type,
      detail: detail === undefined ? null : detail,
    });
  }

  bind(event, handler) {
    try {
      this.page.on(event, handler);
      this.bound.push([event, handler]);
    } catch {}
  }

  async start() {
    if (this.started) return this.info();
    this.started = true;
    fs.mkdirSync(this.screensDir, { recursive: true });
    fs.mkdirSync(this.statesDir, { recursive: true });
    this.status.startedAt = isoNow();
    this.status.state = 'running';
    this.writeStatus();
    this.event('worker_started', { url: this.safeUrl() });

    this.bind('console', (message) => this.event('console', {
      level: message.type(), text: redacted(message.text(), 2000),
    }));
    this.bind('pageerror', (error) => this.event('page_error', { message: redacted(error && error.stack || error, 4000) }));
    this.bind('requestfailed', (request) => this.event('request_failed', {
      url: redacted(request.url(), 1000),
      error: redacted(request.failure() && request.failure().errorText, 1000),
    }));
    this.bind('framenavigated', (frame) => {
      if (frame === this.page.mainFrame()) this.event('navigated', { url: redacted(frame.url(), 1600) });
    });

    await this.capture('initial');
    this.interval = setInterval(() => {
      this.capture('periodic').catch(() => {});
    }, this.run.intervalMs);
    this.interval.unref?.();
    return this.info();
  }

  safeUrl() {
    try { return redacted(this.page.url(), 1600); } catch { return ''; }
  }

  async readState() {
    try {
      return await bounded(this.page.evaluate(() => {
        const text = document.body ? document.body.innerText : '';
        const signal = text.match(/(?:failed to generate|generation failed|unable to generate|rate limit|quota|api key|permission denied|try again|network error).{0,200}/ig);
        const buttons = [...document.querySelectorAll('button, [role="button"]')]
          .map((node) => (node.innerText || node.getAttribute('aria-label') || '').trim())
          .filter(Boolean)
          .filter((label) => /^(run|generate|stop|cancel|retry|continue)/i.test(label))
          .slice(0, 20);
        return {
          title: document.title,
          url: location.href,
          readyState: document.readyState,
          textTail: text.slice(-8000),
          failureSignals: signal ? signal.slice(0, 12) : [],
          actionButtons: buttons,
          capturedAt: new Date().toISOString(),
        };
      }), 6000, 'DOM state read');
    } catch (error) {
      return { stateReadError: redacted(error && error.message || error, 1000), capturedAt: isoNow() };
    }
  }

  async capture(label) {
    if (!this.started || this.finished) return null;
    if (this.captureNumber >= MAX_SCREENSHOTS) {
      if (!this.status.captureLimitReached) {
        this.status.captureLimitReached = true;
        this.event('capture_limit_reached', { limit: MAX_SCREENSHOTS });
        this.writeStatus();
      }
      return null;
    }
    if (this.captureInFlight) return this.captureInFlight;
    this.captureInFlight = (async () => {
      const ordinal = String(++this.captureNumber).padStart(4, '0');
      const safeLabel = safeSegment(label, 'state');
      const screenshot = path.join(this.screensDir, `${ordinal}_${safeLabel}.png`);
      const stateFile = path.join(this.statesDir, `${ordinal}_${safeLabel}.json`);
      let screenshotError = null;
      try {
        // Electron background views can leave Playwright waiting on web-font
        // readiness indefinitely. Raw CDP is immediate and captures the actual
        // rendered pixels, so prefer it before the browser-level helper.
        const session = await bounded(
          this.page.context().newCDPSession(this.page),
          3000,
          'CDP session creation',
        );
        try {
          const capture = await bounded(
            session.send('Page.captureScreenshot', { format: 'png', fromSurface: true }),
            5000,
            'CDP screenshot',
          );
          fs.writeFileSync(screenshot, Buffer.from(capture.data, 'base64'));
          this.event('screenshot_cdp', { label });
        } finally {
          await session.detach().catch(() => {});
        }
      } catch (error) {
        screenshotError = redacted(error && error.message || error, 1000);
        // CDP is preferred for Electron views, but keep Playwright as a bounded
        // fallback for browser targets that do not expose the CDP Page domain.
        try {
          const bytes = await bounded(
            this.page.screenshot({ type: 'png', timeout: 8000 }),
            9000,
            'Playwright screenshot',
          );
          fs.writeFileSync(screenshot, bytes);
          screenshotError = null;
          this.event('screenshot_fallback_playwright', { label });
        } catch (fallbackError) {
          screenshotError = `${screenshotError}; Playwright fallback: ${redacted(fallbackError && fallbackError.message || fallbackError, 800)}`;
        }
      }
      const state = await this.readState();
      state.screenshot = screenshotError ? null : screenshot;
      state.screenshotError = screenshotError;
      state.label = label;
      atomicJson(stateFile, state);
      this.status.captures = this.captureNumber;
      this.status.lastCaptureAt = isoNow();
      this.status.lastScreenshot = screenshotError ? null : screenshot;
      this.status.lastState = stateFile;
      this.writeStatus();
      this.event('capture', { label, screenshot: screenshotError ? null : screenshot, state: stateFile, screenshotError });
      return { screenshot: screenshotError ? null : screenshot, state: stateFile };
    })();
    try { return await this.captureInFlight; }
    finally { this.captureInFlight = null; }
  }

  async finish(ok, detail) {
    if (this.finished) return this.info();
    this.finished = true;
    if (this.interval) clearInterval(this.interval);
    // Capture once more after stopping the interval guard. Temporarily allow the
    // final capture so a short run still always has both initial and terminal evidence.
    this.finished = false;
    await this.capture(ok ? 'final_success' : 'final_failure');
    this.finished = true;
    for (const [event, handler] of this.bound) {
      try { this.page.removeListener(event, handler); } catch {}
    }
    this.bound = [];
    const finalState = ok ? 'succeeded' : 'failed';
    this.status.finishedAt = isoNow();
    this.status.state = finalState;
    this.status.result = compactResult(detail);
    this.writeStatus();
    this.event('worker_finished', { state: finalState, result: this.status.result });
    if (!ok) atomicJson(this.errorFile, {
      failedAt: this.status.finishedAt,
      error: compactResult(detail),
      statusFile: this.statusFile,
      screenshots: this.screensDir,
      states: this.statesDir,
    });
    return this.info();
  }

  info() {
    return {
      agent: this.metadata.agentName,
      accountSlot: this.metadata.accountSlot,
      tabName: this.metadata.tabName || null,
      directory: this.dir,
      statusFile: this.statusFile,
      screenshots: this.screensDir,
    };
  }
}

class AutomationRun {
  constructor({ root, metadata = {}, intervalMs }) {
    this.root = root;
    this.metadata = {
      projectId: safeSegment(metadata.projectId, '_automation'),
      workflow: safeSegment(metadata.workflow, 'ad_hoc'),
      agentName: safeSegment(metadata.agentName, 'daemon'),
      accountSlot: metadata.accountSlot === undefined || metadata.accountSlot === null ? 'unknown' : String(metadata.accountSlot),
      tabName: metadata.tabName ? safeSegment(metadata.tabName, 'tab') : null,
      targetUrl: metadata.targetUrl || null,
      requestedAt: isoNow(),
    };
    this.intervalMs = clampInterval(intervalMs || metadata.captureIntervalMs);
    const suffix = crypto.randomBytes(3).toString('hex');
    this.runId = `${new Date().toISOString().replace(/[:.]/g, '-')}__${this.metadata.workflow}__${suffix}`;
    this.projectDir = path.join(root, 'projects', this.metadata.projectId);
    this.runDir = path.join(this.projectDir, 'automation_runs', this.runId);
    this.agentsDir = path.join(this.runDir, 'agents');
    this.runFile = path.join(this.runDir, 'run.json');
    this.workers = new Map();
    this.started = false;
    this.finished = false;
    // Legacy or ad-hoc callers may not know a production project yet. Give
    // their evidence a first-class Studio project rather than a detached temp
    // folder, while never replacing an existing project manifest.
    const projectFile = path.join(this.projectDir, 'project.json');
    if (!fs.existsSync(projectFile)) {
      fs.mkdirSync(this.projectDir, { recursive: true });
      atomicJson(projectFile, {
        schemaVersion: 1,
        metadata: {
          title_en: `Automation evidence — ${this.metadata.projectId}`,
          title_bn: `অটোমেশন প্রমাণ — ${this.metadata.projectId}`,
          createdBy: 'automation-observability',
          createdAt: isoNow(),
        },
        style_preset: 'OPERATIONS',
        scenes: [],
        total_duration_seconds: 0,
      });
    }
    fs.mkdirSync(this.agentsDir, { recursive: true });
    this.updateSummary();
  }

  updateSummary(extra) {
    const workers = [...this.workers.values()].map((worker) => ({
      ...worker.info(), state: worker.status.state, captures: worker.status.captures,
    }));
    atomicJson(this.runFile, {
      schemaVersion: 1,
      runId: this.runId,
      root: this.root,
      projectId: this.metadata.projectId,
      workflow: this.metadata.workflow,
      metadata: this.metadata,
      intervalMs: this.intervalMs,
      state: this.finished ? 'finished' : this.started ? 'running' : 'created',
      updatedAt: isoNow(),
      ...extra,
      workers,
    });
  }

  async watch(page, overrides = {}) {
    if (!page) return null;
    const currentUrl = (() => { try { return page.url(); } catch { return ''; } })();
    const metadata = {
      ...this.metadata,
      ...overrides,
      accountSlot: overrides.accountSlot ?? accountFromUrl(currentUrl) ?? this.metadata.accountSlot,
      targetUrl: currentUrl || this.metadata.targetUrl,
    };
    const key = safeSegment(
      `${metadata.agentName || 'agent'}__account_u${metadata.accountSlot ?? 'unknown'}${metadata.tabName ? `__${metadata.tabName}` : ''}`,
      `agent_${this.workers.size + 1}`,
    );
    const existing = this.workers.get(key);
    if (existing) return existing.info();
    const worker = new WorkerMonitor(this, page, metadata);
    this.workers.set(key, worker);
    await worker.start();
    this.updateSummary();
    return worker.info();
  }

  record(type, detail) {
    appendNdjson(path.join(this.runDir, 'events.ndjson'), { at: isoNow(), type, detail: detail === undefined ? null : detail });
  }

  async start(page) {
    this.started = true;
    this.record('run_started', this.metadata);
    if (page) await this.watch(page, this.metadata);
    this.updateSummary();
    return this.info();
  }

  async capture(label) {
    return Promise.all([...this.workers.values()].map((worker) => worker.capture(label)));
  }

  async finish(ok, detail) {
    if (this.finished) return this.info();
    this.finished = true;
    await Promise.all([...this.workers.values()].map((worker) => worker.finish(ok, detail)));
    this.record('run_finished', { ok, result: compactResult(detail) });
    this.updateSummary({ finishedAt: isoNow(), ok, result: compactResult(detail) });
    return this.info();
  }

  info() {
    return {
      runId: this.runId,
      projectId: this.metadata.projectId,
      workflow: this.metadata.workflow,
      directory: this.runDir,
      manifest: this.runFile,
      intervalMs: this.intervalMs,
    };
  }
}

function createAutomationRun({ root, metadata, intervalMs }) {
  return new AutomationRun({ root, metadata, intervalMs });
}

module.exports = {
  accountFromUrl,
  createAutomationRun,
  projectFromCode,
  redacted,
  safeSegment,
};
