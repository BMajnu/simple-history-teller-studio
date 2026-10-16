const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('generate-speech'));
  if (!page) throw new Error('No speech page found');

  const text = "To explore more hidden truths and wild ironies across the centuries, subscribe right now to Simple History Teller! See you in the next episode!";
  const outPath = path.resolve('projects/sample_first_king/audio/raw/en_scene_0080.wav');

  // Dismiss any backdrops
  await page.evaluate(() => {
    document.querySelectorAll('.cdk-overlay-backdrop').forEach(el => el.remove());
  });

  const textarea = page.locator('textarea').first();
  await textarea.fill(text);
  await page.waitForTimeout(300);

  // Find run button
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run"), button.ms-button-primary').first();
  console.log('Run button count:', await runBtn.count());
  await runBtn.click({ force: true });
  console.log('Clicked Run button, waiting for audio...');

  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(1000);
    const res = await page.evaluate(() => {
      const aud = document.querySelector('audio');
      const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
      return {
        hasAudio: !!aud && aud.duration > 0.5,
        dur: aud ? aud.duration : 0,
        src: aud ? aud.src : null,
        stop
      };
    });
    if (res.hasAudio && !res.stop) {
      console.log('Audio generated! Duration:', res.dur, 'Fetching...');
      const b64 = await page.evaluate(async (src) => {
        const r = await fetch(src);
        const ab = await r.arrayBuffer();
        const bytes = new Uint8Array(ab);
        let s = '';
        for (let j = 0; j < bytes.length; j++) s += String.fromCharCode(bytes[j]);
        return btoa(s);
      }, res.src);
      fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
      console.log('✓ Saved to', outPath, fs.statSync(outPath).size, 'bytes');
      process.exit(0);
    }
  }

  console.log('Timeout waiting for audio');
  process.exit(1);
})().catch(console.error);
