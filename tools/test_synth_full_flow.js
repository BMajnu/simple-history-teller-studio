const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  console.log('Navigating to u/0/generate-speech...');
  await page.goto('https://aistudio.google.com/u/0/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Click Create new dialog
  const createCard = page.locator('text="Create new dialog"').first();
  if (await createCard.isVisible()) {
    console.log('Clicking "Create new dialog"...');
    await createCard.click();
    await page.waitForTimeout(2000);
  }

  // Find textarea
  const textarea = page.locator('textarea').first();
  await textarea.waitFor({ timeout: 10000 });
  console.log('Found textarea!');

  // Set Voice to Charon
  const speakerBtn = page.locator('button').filter({ hasText: 'Speaker' }).first();
  if (await speakerBtn.count() > 0) {
    const txt = (await speakerBtn.innerText()).trim();
    console.log('Current speaker button:', txt);
    if (!txt.includes('Charon')) {
      await speakerBtn.click();
      await page.waitForTimeout(1000);

      const searchInput = page.locator('.cdk-overlay-container input, input[placeholder*="Search"]').first();
      if (await searchInput.count() > 0) {
        await searchInput.fill('Charon');
        await page.waitForTimeout(800);
        const row = page.locator('.cdk-overlay-container').getByText('Charon', { exact: true }).first();
        if (await row.count() > 0) await row.click();
        await page.waitForTimeout(600);
      }
      await page.keyboard.press('Escape');
      console.log('Selected Charon voice!');
    }
  }

  // Type text
  const text = 'আমি সময়ের সাক্ষী! আজ তুমি যে দেশেরই নাগরিক হও না কেন...';
  await textarea.click();
  await textarea.fill(text);
  await page.waitForTimeout(500);

  // Take screenshot before run
  await page.screenshot({ path: 'tools/before_run_click.png' });

  // Locate Run button
  const runBtn = page.locator('button:has-text("Run"), button.ctrl-enter-submits').last();
  console.log('Clicking Run button:', await runBtn.innerText());
  await runBtn.click();

  // Monitor generation
  let audioSrc = null;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1500);
    const state = await page.evaluate(() => {
      const aud = document.querySelector('audio');
      const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
      const err = document.querySelector('.error-message, mat-error, [role="alert"]');
      return {
        hasAudio: !!aud && aud.duration > 0.5,
        dur: aud ? aud.duration : 0,
        src: aud ? aud.src : null,
        stop,
        err: err ? err.innerText : null
      };
    });

    console.log(`[${((i + 1) * 1.5).toFixed(1)}s] Audio: ${state.hasAudio} (${state.dur.toFixed(1)}s) | Stop: ${state.stop} | Err: ${state.err}`);
    if (state.hasAudio && !state.stop) {
      audioSrc = state.src;
      break;
    }
  }

  if (audioSrc) {
    console.log('Audio generated successfully!');
    const b64 = await page.evaluate(async (src) => {
      const res = await fetch(src);
      const ab = await res.arrayBuffer();
      const bytes = new Uint8Array(ab);
      let bin = '';
      for (let j = 0; j < bytes.length; j++) bin += String.fromCharCode(bytes[j]);
      return btoa(bin);
    }, audioSrc);

    fs.writeFileSync('tools/test_charon_success.wav', Buffer.from(b64, 'base64'));
    console.log('Saved tools/test_charon_success.wav! Size:', fs.statSync('tools/test_charon_success.wav').size);
  } else {
    await page.screenshot({ path: 'tools/failed_audio_state.png' });
    console.log('Failed to generate audio. Saved tools/failed_audio_state.png');
  }
})();
