'use strict';

// One dedicated BGM composition worker. This is suitable for a full episode;
// `dispatch.js` is the compact multi-worker Lyria diagnostic runner.
const http = require('http');

const PROJECT_ID = process.env.PROJECT_ID || '_automation';
const ACCOUNT_SLOT = process.env.ACCOUNT_SLOT || 'unknown';
const RUN_ID = `bgm-${Date.now().toString(36)}`;
const TAB_NAME = `bgm-u${ACCOUNT_SLOT}-${RUN_ID}`;
const MARKER = `si_bgm=${encodeURIComponent(RUN_ID)}`;

const BGM_PROMPT = `
[0:00 - 2:00] Intro: intensity 2/10, ancient prehistoric mystery; primal hollow-log drum heartbeat, distant bamboo flute, subtle desert cave wind and dark resonant bass drone. No vocals.
[2:00 - 5:30] Rising mystery: intensity 5/10; Egyptian ney flute, oud picking, sistrum rhythm and low cello drone. No vocals.
[5:30 - 9:00] Dramatic climax: intensity 8/10; orchestral swell, urgent strings, deep kettledrums and cinematic brass. No vocals.
[9:00 - 12:30] Mughal court: intensity 6/10; sitar phrase, tabla pattern and tanpura drone. No vocals.
[12:30 - 15:00] Scholarly reflection: intensity 4/10; soft oud arpeggios, gentle cello and warm Arabic strings. No vocals.
[15:00 - 17:00] Peaceful outro: intensity 2/10; decaying ney flute, single guitar pluck and fading ambient drone. No vocals.
Target: 17-minute era-authentic historical documentary score, 48kHz stereo, smooth organic transitions, purely instrumental.
`.trim();

function post(body, timeout = 120000) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(body), 'utf8');
    const request = http.request({
      host: '127.0.0.1', port: 9333, path: '/run-script', method: 'POST', timeout,
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
    }, (response) => {
      let raw = '';
      response.on('data', (chunk) => { raw += chunk; });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          if (response.statusCode >= 400) reject(new Error(parsed.error || raw.slice(0, 1000)));
          else resolve(parsed);
        } catch { reject(new Error(`Invalid daemon response: ${raw.slice(0, 1000)}`)); }
      });
    });
    request.on('error', reject);
    request.on('timeout', () => request.destroy(new Error('Daemon timeout')));
    request.write(data);
    request.end();
  });
}

const code = `return (async () => {
  const marker = ${JSON.stringify(MARKER)};
  const tabName = ${JSON.stringify(TAB_NAME)};
  const prompt = ${JSON.stringify(BGM_PROMPT)};
  const pages = () => browser.contexts().flatMap((context) => context.pages());
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const bar = pages().find((page) => (page.url() || '').includes('browser.html'));
  if (!bar) return { fail: 'named-tab toolbar unavailable' };
  const url = 'https://aistudio.google.com/app/new_music?model=lyria-3.5&' + marker;
  await bar.evaluate(({ url, tabName, slot }) => window.stb.newTab(url, tabName, {
    background: true, accountSlot: slot, agentName: 'bgm-composer'
  }), { url, tabName, slot: ${JSON.stringify(ACCOUNT_SLOT)} });
  let page = null;
  for (let attempt = 0; attempt < 40; attempt++) {
    const matches = pages().filter((candidate) => (candidate.url() || '').includes(marker));
    if (matches.length === 1) { page = matches[0]; break; }
    await sleep(500);
  }
  if (!page) return { fail: 'named BGM tab not found or ambiguous' };
  await page.context().newCDPSession(page).then((s) => s.send('Emulation.setFocusEmulationEnabled', { enabled: true })).catch(() => {});
  await automation.watchPage(page, { agentName: 'bgm-composer', accountSlot: ${JSON.stringify(ACCOUNT_SLOT)}, tabName });
  const box = page.locator('textarea, div[contenteditable="true"], [role="textbox"]').first();
  await box.waitFor({ state: 'visible', timeout: 30000 });
  await box.fill(prompt);
  const buttons = page.locator('button');
  for (let i = 0, count = await buttons.count(); i < count; i++) {
    const button = buttons.nth(i);
    const label = (await button.innerText().catch(() => '')).trim();
    if (/^generate\\b/i.test(label) && await button.isVisible().catch(() => false) && !await button.isDisabled().catch(() => true)) {
      await button.click({ force: true, timeout: 15000 });
      await sleep(1000);
      const state = await page.evaluate(() => ({
        busy: [...document.querySelectorAll('button, [role="button"]')].some((node) => /^(stop|cancel)$/i.test((node.innerText || node.getAttribute('aria-label') || '').trim())),
        hasAudio: Boolean(document.querySelector('audio[src], audio source[src]')),
      }));
      if (!state.busy && !state.hasAudio) { await automation.capture('run_not_accepted'); return { fail: 'Generate click was not accepted' }; }
      return { ok: true, url: page.url(), state };
    }
  }
  await automation.capture('control_disabled');
  return { fail: 'enabled Generate button missing' };
})()`;

post({
  code,
  run: { projectId: PROJECT_ID, workflow: 'bgm_dispatch', agentName: 'bgm-composer', accountSlot: ACCOUNT_SLOT, tabName: TAB_NAME, captureIntervalMs: 5000 },
}).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => { console.error(error.message); process.exitCode = 1; });
