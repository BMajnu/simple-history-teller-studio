const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  console.log('Connecting to Chrome CDP on port 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  console.log('Navigating to u/1/generate-speech...');
  await page.goto('https://aistudio.google.com/u/1/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Dismiss dialogs if any
  for (let c = 0; c < 2; c++) {
    const dlg = page.locator('[role=dialog], mat-dialog-container').first();
    if (await dlg.isVisible().catch(() => false)) {
      const btn = dlg.locator('button:has-text("Continue"), button:has-text("Accept"), button:has-text("I agree"), button:has-text("close")').first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(1000);
      }
    }
  }

  const createCard = page.locator('text="Create new dialog"').first();
  if (await createCard.isVisible().catch(() => false)) {
    await createCard.click();
    await page.waitForTimeout(2000);
  }

  // 1. Set Voice to Cruz
  console.log('Setting Voice to Cruz...');
  const speakerBtn = page.locator('button').filter({ hasText: 'Speaker' }).first();
  await speakerBtn.click();
  await page.waitForTimeout(800);

  const searchInput = page.locator('.cdk-overlay-container input, input[placeholder*="Search"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('Cruz');
    await page.waitForTimeout(600);
    const row = page.locator('.cdk-overlay-container').getByText('Cruz', { exact: true }).first();
    if (await row.count() > 0) await row.click();
    await page.waitForTimeout(500);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 2. Set Style to "An Old Story Teller, Old Man voice"
  console.log('Setting Style prompt: "An Old Story Teller, Old Man voice"...');
  const styleBtn = page.locator('button').filter({ hasText: 'Style' }).first();
  if (await styleBtn.count() > 0) {
    await styleBtn.click();
    await page.waitForTimeout(800);

    const styleTextarea = page.locator('.cdk-overlay-container textarea').first();
    if (await styleTextarea.count() > 0) {
      await styleTextarea.fill('An Old Story Teller, Old Man voice');
      await page.waitForTimeout(500);
      console.log('Filled style textarea!');
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
  }

  // 3. Fill the main speech text
  console.log('Filling main speech block textarea...');
  const mainTextarea = page.locator('textarea:visible').first();
  const testText = 'ইতিহাসের আরও রোমাঞ্চকর ও বিস্ময়কর সত্য জানতে এখনই সাবস্ক্রাইব করে সঙ্গে থাকো সিম্পল হিস্ট্রি টেলার বাংলা চ্যানেলে। দেখা হচ্ছে পরের পর্বে!';
  await mainTextarea.click();
  await mainTextarea.fill(testText);
  await page.waitForTimeout(600);

  await page.screenshot({ path: 'tools/ready_cruz_filled.png' });
  console.log('Saved tools/ready_cruz_filled.png');

  // 4. Click Run
  const runBtn = page.locator('button:has-text("Run")').last();
  const disabled = await runBtn.getAttribute('aria-disabled');
  console.log(`Run button aria-disabled: ${disabled}`);

  await runBtn.click();
  console.log('Clicked Run! Waiting for Cruz elderly speech generation...');

  let audioSrc = null;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1500);
    const state = await page.evaluate(() => {
      const aud = document.querySelector('audio');
      const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
      return {
        hasAudio: !!aud && aud.duration > 0.5,
        dur: aud ? aud.duration : 0,
        src: aud ? aud.src : null,
        stop
      };
    });

    console.log(`[${((i + 1) * 1.5).toFixed(1)}s] Audio: ${state.hasAudio} (${state.dur.toFixed(1)}s) | Stop: ${state.stop}`);
    if (state.hasAudio && !state.stop) {
      audioSrc = state.src;
      break;
    }
  }

  if (audioSrc) {
    console.log('🎉 Cruz Elderly Male Voice generated successfully!');
    const b64 = await page.evaluate(async (src) => {
      const res = await fetch(src);
      const ab = await res.arrayBuffer();
      const bytes = new Uint8Array(ab);
      let bin = '';
      for (let j = 0; j < bytes.length; j++) bin += String.fromCharCode(bytes[j]);
      return btoa(bin);
    }, audioSrc);

    fs.writeFileSync('tools/test_cruz_elderly_scene79.wav', Buffer.from(b64, 'base64'));
    console.log('Saved tools/test_cruz_elderly_scene79.wav! Size:', fs.statSync('tools/test_cruz_elderly_scene79.wav').size);
  } else {
    console.log('Generation timed out or failed.');
  }
})();
