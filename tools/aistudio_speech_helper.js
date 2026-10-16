'use strict';

// AI Studio speech helper with an owned, named background tab and evidence.
// Usage from another tool:
//   synthesizeWithAIStudio(text, 'Cruz', '.../projects/my_episode/audio/raw/x.wav',
//     { projectId: 'my_episode', accountSlot: 2, agentName: 'speech-u2-bn-001' })
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function projectFromOutput(outFile) {
  const match = String(outFile || '').replace(/\\/g, '/').match(/\/projects\/([\w-]+)\//i);
  return match ? match[1] : (process.env.PROJECT_ID || '_automation');
}

async function synthesizeWithAIStudio(text, voiceName, outFile, options = {}) {
  const projectId = options.projectId || projectFromOutput(outFile);
  const accountSlot = String(options.accountSlot ?? process.env.ACCOUNT_SLOT ?? '0');
  const agentName = options.agentName || `speech-u${accountSlot}-${Date.now().toString(36)}`;
  const tabName = options.tabName || agentName;
  const dry = options.dry === true || process.env.DRY === '1';
  const marker = `si_speech=${encodeURIComponent(`${tabName}-${Date.now().toString(36)}`)}`;
  const url = `https://aistudio.google.com/u/${encodeURIComponent(accountSlot)}/generate-speech?model=gemini-3.8-flash-tts&${marker}`;

  const code = `
    return (async () => {
      const marker = ${JSON.stringify(marker)};
      const url = ${JSON.stringify(url)};
      const tabName = ${JSON.stringify(tabName)};
      const agentName = ${JSON.stringify(agentName)};
      const accountSlot = ${JSON.stringify(accountSlot)};
      const promptText = ${JSON.stringify(String(text))};
      const voiceName = ${JSON.stringify(String(voiceName || ''))};
      const dry = ${JSON.stringify(dry)};
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const pages = () => browser.contexts().flatMap((context) => context.pages());
      const bar = pages().find((candidate) => (candidate.url() || '').includes('browser.html'));
      if (!bar) return { fail: 'named-tab toolbar unavailable' };
      await bar.evaluate(({ targetUrl, targetName, slot, agent }) => window.stb.newTab(
        targetUrl, targetName, { background: true, accountSlot: slot, agentName: agent }
      ), { targetUrl: url, targetName: tabName, slot: accountSlot, agent: agentName });

      let page = null;
      for (let attempt = 0; attempt < 40; attempt++) {
        const matches = pages().filter((candidate) => (candidate.url() || '').includes(marker));
        if (matches.length === 1) { page = matches[0]; break; }
        await sleep(500);
      }
      if (!page) return { fail: 'named speech tab not found or ambiguous' };
      await page.context().newCDPSession(page)
        .then((session) => session.send('Emulation.setFocusEmulationEnabled', { enabled: true }))
        .catch(() => {});
      await automation.watchPage(page, { agentName, accountSlot, tabName });

      const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
      await textarea.waitFor({ state: 'visible', timeout: 30000 });

      if (voiceName) {
        const voiceChip = page.locator('.voice-chip, button.voice-playground-chip').first();
        if (await voiceChip.isVisible().catch(() => false)) {
          const current = await voiceChip.innerText().catch(() => '');
          if (!current.toLowerCase().includes(voiceName.toLowerCase())) {
            await voiceChip.click({ force: true });
            const search = page.locator('input[placeholder*="Search"][placeholder*="voices"], input[aria-label*="Search"]').first();
            if (await search.isVisible().catch(() => false)) await search.fill(voiceName);
            const choice = page.getByRole('button', { name: new RegExp(voiceName, 'i') }).first();
            if (!await choice.isVisible().catch(() => false)) {
              await automation.capture('voice_missing');
              return { fail: 'voice missing: ' + voiceName };
            }
            await choice.click({ force: true });
          }
        }
      }

      await textarea.fill(promptText);
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      let runButton = null;
      for (let i = 0; i < buttonCount; i++) {
        const candidate = buttons.nth(i);
        const label = (await candidate.innerText().catch(() => '')).trim();
        if (/^run\\b/i.test(label) && await candidate.isVisible().catch(() => false) && !await candidate.isDisabled().catch(() => true)) {
          runButton = candidate;
          break;
        }
      }
      if (!runButton) {
        await automation.capture('control_disabled');
        return { fail: 'enabled Run button missing' };
      }
      if (dry) {
        await automation.capture('speech_dry_ready');
        return { dry: true, runReady: true, voiceName, url: page.url() };
      }
      await runButton.click({ force: true, timeout: 15000 });

      let transitionObserved = false;
      let completed = false;
      for (let i = 0; i < 60; i++) {
        await sleep(1000);
        const state = await page.evaluate(() => ({
          hasAudio: Boolean(document.querySelector('audio[src], audio source[src]')),
          busy: [...document.querySelectorAll('button, [role="button"]')]
            .some((node) => /^(stop|cancel)$/i.test((node.innerText || node.getAttribute('aria-label') || '').trim())),
        })).catch(() => ({ hasAudio: false, busy: false }));
        transitionObserved ||= state.busy || state.hasAudio;
        if (transitionObserved && !state.busy && state.hasAudio) { completed = true; break; }
      }
      if (!transitionObserved) {
        await automation.capture('run_not_accepted');
        return { fail: 'Run click was not accepted' };
      }

      const b64 = await page.evaluate(async () => {
        const audio = document.querySelector('audio');
        const source = audio && (audio.currentSrc || audio.src || audio.querySelector('source')?.src);
        if (!source) return null;
        const response = await fetch(source);
        const blob = await response.blob();
        const bytes = new Uint8Array(await blob.arrayBuffer());
        let binary = '';
        for (const byte of bytes) binary += String.fromCharCode(byte);
        return btoa(binary);
      });
      if (!b64) { await automation.capture('download_missing'); return { fail: 'audio output missing', completed }; }
      return { completed, hasB64: true, b64 };
    })();
  `;

  const res = await fetch('http://127.0.0.1:9333/run-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      run: { projectId, workflow: 'speech', agentName, accountSlot, tabName, captureIntervalMs: 5000 },
    }),
  });
  const data = await res.json();
  if (dry) {
    if (!res.ok || !data.result?.dry) {
      throw new Error(`Speech UI dry check failed: ${JSON.stringify(data).slice(0, 2000)}`);
    }
    return { ...data.result, automation: data.automation };
  }
  if (!res.ok || !data.result?.b64) {
    throw new Error(`Failed to generate or extract speech from AI Studio: ${JSON.stringify(data).slice(0, 2000)}`);
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, Buffer.from(data.result.b64, 'base64'));
  return outFile;
}

async function test() {
  const projectId = process.env.PROJECT_ID || '_automation';
  const testFile = path.join(ROOT, 'projects', projectId, 'audio', 'raw', 'test_aistudio_scene2.wav');
  console.log('Testing synthesizeWithAIStudio...');
  const result = await synthesizeWithAIStudio('আজ তুমি যে ভাষায় তোমার বন্ধুদের সাথে কথা বলছো, ভেবে দেখেছো কখনো—কোথা থেকে এলো এই ভাষা?', 'Ludo', testFile, { projectId, agentName: 'speech-smoke-test', dry: process.env.DRY === '1' });
  if (process.env.DRY === '1') console.log('DRY PASS:', JSON.stringify(result));
  else console.log('SUCCESS! File generated at:', testFile, 'Size:', fs.statSync(testFile).size);
}

if (require.main === module) test().catch((error) => { console.error(error); process.exitCode = 1; });

module.exports = { synthesizeWithAIStudio };
