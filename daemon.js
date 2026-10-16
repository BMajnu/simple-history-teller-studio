/**
 * Autonomous Cloud AI Browser Daemon Server (CDP Bridge)
 * Port: 127.0.0.1:9333
 * Chrome CDP Remote Debugging Port: 127.0.0.1:9224
 *
 * Capabilities:
 * - Persistent connection to Chrome via Chrome DevTools Protocol (CDP)
 * - Automates Google AI Studio (gemini-3.8-flash-tts, Screenplay Blocks, Expression Tags)
 * - Automates Google Flow (Chatbox Multi-Prompt Batching, Image-to-Video Veo Action Clips)
 * - Safe status checks and execution sandbox
 */

const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { accountFromUrl, createAutomationRun, projectFromCode, redacted, safeSegment } = require('./lib/automation-observability');

const PORT = process.env.DAEMON_PORT || 9333;
const CDP_PORT = process.env.CDP_PORT || 9224;
const CDP_URL = `http://127.0.0.1:${CDP_PORT}`;

process.on('uncaughtException', (err) => {
  console.error('[Daemon] Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Daemon] Unhandled Rejection:', reason);
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

let browser = null;

async function getBrowser() {
  if (browser && browser.isConnected()) return browser;
  try {
    browser = await chromium.connectOverCDP(CDP_URL);
    return browser;
  } catch (err) {
    browser = null;
    throw new Error(`Cannot connect to Chrome on ${CDP_URL}. Ensure Chrome was launched with --remote-debugging-port=${CDP_PORT}`);
  }
}

async function findTab(urlSubstring) {
  const b = await getBrowser();
  const matches = [];
  for (const ctx of b.contexts()) {
    for (const page of ctx.pages()) {
      const url = page.url();
      if (url === urlSubstring || url.includes(urlSubstring)) matches.push(page);
    }
  }
  // A generic URL is not a worker identity. Scripts can resolve their own
  // uniquely-marked pages via `browser`, but this bridge never falls back to
  // pages()[0] or observes an arbitrary tab.
  return matches.length === 1 ? matches[0] : null;
}

function runMetadata(body) {
  const requested = body.run || body.observability || {};
  const targetUrl = body.targetUrl || requested.targetUrl || '';
  return {
    projectId: safeSegment(requested.projectId || projectFromCode(body.code) || '_automation', '_automation'),
    workflow: safeSegment(requested.workflow || 'ad_hoc', 'ad_hoc'),
    agentName: safeSegment(requested.agentName || requested.agent || 'daemon', 'daemon'),
    accountSlot: requested.accountSlot ?? accountFromUrl(targetUrl) ?? 'unknown',
    tabName: requested.tabName || null,
    targetUrl,
    captureIntervalMs: requested.captureIntervalMs,
  };
}

// ------------------------------------------------------------- REST Endpoints

/** Check live CDP connection and list open tabs */
app.get('/status', async (req, res) => {
  try {
    const b = await getBrowser();
    const tabs = [];
    for (const ctx of b.contexts()) {
      for (const p of ctx.pages()) {
        try {
          tabs.push({
            url: p.url(),
            title: await p.title().catch(() => ''),
            isAIStudio: p.url().includes('aistudio.google.com'),
            isFlow: p.url().includes('flow.google.com')
          });
        } catch (e) {}
      }
    }
    res.json({
      connected: true,
      cdpUrl: CDP_URL,
      tabCount: tabs.length,
      tabs
    });
  } catch (err) {
    res.json({
      connected: false,
      cdpUrl: CDP_URL,
      error: err.message,
      help: `Launch Chrome with: chrome.exe --remote-debugging-port=${CDP_PORT}`
    });
  }
});

/** Execute a scoped Playwright script against an explicitly identified tab. */
app.post('/run-script', async (req, res) => {
  const { code, targetUrl } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  const metadata = runMetadata(req.body);
  const run = createAutomationRun({ root: __dirname, metadata, intervalMs: metadata.captureIntervalMs });

  try {
    const b = await getBrowser();
    const page = targetUrl ? await findTab(targetUrl) : null;
    await run.start(page);
    if (!page && targetUrl) {
      run.record('target_unresolved', {
        targetUrl,
        reason: 'target matched zero or multiple tabs; use a unique URL marker or call automation.watchPage()',
      });
    } else if (!page) {
      run.record('worker_observation_deferred', { reason: 'multi-tab script must call automation.watchPage() for each uniquely resolved worker' });
    }

    // Existing scripts retain page/browser/require. Multi-tab scripts receive an
    // optional fourth value and opt in with automation.watchPage().
    const automation = {
      ...run.info(),
      record: (type, detail) => run.record(type, detail),
      capture: (label) => run.capture(label),
      watchPage: (workerPage, overrides) => run.watch(workerPage, overrides),
    };
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const fn = new AsyncFunction('page', 'browser', 'require', 'automation', code);
    const result = await fn(page, b, require, automation);
    const evidence = await run.finish(true, result);

    res.json({ ok: true, result, automation: evidence });
  } catch (err) {
    const evidence = await run.finish(false, { message: redacted(err.message, 2000), stack: redacted(err.stack, 6000) });
    res.status(500).json({ error: err.message, stack: err.stack, automation: evidence });
  }
});

/** Launch or restart Chrome with Remote Debugging Port */
app.post('/launch-chrome', (req, res) => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const args = [
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-blink-features=AutomationControlled',
    'https://flow.google.com/',
    'https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts'
  ];

  if (req.body?.userDataDir) {
    args.unshift(`--user-data-dir=${req.body.userDataDir}`);
  }

  const p = spawn(chromePath, args, { detached: true, stdio: 'ignore' });
  p.unref();

  res.json({ ok: true, message: `Chrome launch triggered with port ${CDP_PORT}` });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  ======================================================`);
  console.log(`  Cloud AI Autonomous Browser Daemon Server (CDP Bridge)`);
  console.log(`  → Listening on http://127.0.0.1:${PORT}`);
  console.log(`  → Target CDP: ${CDP_URL}`);
  console.log(`  ======================================================\n`);
});
