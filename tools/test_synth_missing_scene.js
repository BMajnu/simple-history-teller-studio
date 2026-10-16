const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const SLOTS = ['u/3', 'u/1', 'u/4', 'u/0', 'u/2', 'u/5', 'u/6'];
const MODELS = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts'];

async function testSynth() {
  console.log('Connecting to Chrome CDP on 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  const text = "নৃতত্ত্ববিদরা একে বলেন 'রিভার্স ডমিন্যান্স হায়ারার্কি'—যেখানে দুর্বলরা জোট বেঁধে যেকোনো সম্ভাব্য স্বৈরশাসককে অঙ্কুরেই ধ্বংস করে দিত।";
  const voice = 'Charon';

  let currentSlotIdx = 0;
  let currentModelIdx = 0;

  for (let attempt = 0; attempt < SLOTS.length * MODELS.length; attempt++) {
    const slot = SLOTS[currentSlotIdx];
    const model = MODELS[currentModelIdx];
    const url = `https://aistudio.google.com/${slot}/generate-speech?model=${model}`;
    console.log(`Trying [${slot}] [${model}]...`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
      await page.waitForTimeout(3000);
      await page.keyboard.press('Escape');

      // Dismiss dialogs
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

      // Voice
      const speakerBtn = page.locator('button').filter({ hasText: 'Speaker' }).first();
      if (await speakerBtn.count() > 0) {
        const txt = (await speakerBtn.innerText()).trim();
        if (!txt.toLowerCase().includes(voice.toLowerCase())) {
          await speakerBtn.click();
          await page.waitForTimeout(700);
          const searchInput = page.locator('.cdk-overlay-container input, input[placeholder*="Search"]').first();
          if (await searchInput.count() > 0) {
            await searchInput.fill(voice);
            await page.waitForTimeout(600);
            const row = page.locator('.cdk-overlay-container').getByText(voice, { exact: true }).first();
            if (await row.count() > 0) await row.click();
            await page.waitForTimeout(400);
          }
          await page.keyboard.press('Escape');
          await page.waitForTimeout(400);
        }
      }

      // Fill textarea
      const textarea = page.locator('textarea:visible').first();
      await textarea.click();
      await textarea.fill(text);
      await page.waitForTimeout(400);

      const runBtn = page.locator('button:has-text("Run")').last();
      await runBtn.click();

      let completed = false;
      let audioData = null;

      for (let i = 0; i < 35; i++) {
        await page.waitForTimeout(1200);

        const modal = page.locator('text="Upgrade to unlock more"').first();
        if (await modal.isVisible().catch(() => false)) {
          throw new Error('UPGRADE_MODAL');
        }

        const state = await page.evaluate(() => {
          const aud = document.querySelector('audio');
          const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
          const err = document.querySelector('.error-message, mat-error, [role="alert"]');
          return {
            hasAudio: !!aud && aud.duration > 0.5,
            src: aud ? aud.src : null,
            stop,
            err: err ? err.innerText : null
          };
        });

        if (state.err && /quota|exceeded/i.test(state.err)) {
          throw new Error('QUOTA_LIMIT');
        }

        if (state.hasAudio && !state.stop && state.src && state.src.startsWith('data:audio/wav;base64,')) {
          audioData = state.src.split(',')[1];
          completed = true;
          break;
        }
      }

      if (completed && audioData) {
        const outPath = path.join(__dirname, '..', 'projects', 'sample_first_king', 'audio', 'test_scene_0007.wav');
        fs.writeFileSync(outPath, Buffer.from(audioData, 'base64'));
        console.log(`SUCCESS! Saved test_scene_0007.wav (${fs.statSync(outPath).size} bytes)`);
        return;
      }
    } catch (e) {
      console.warn(`Attempt failed on [${slot}][${model}]: ${e.message}`);
      currentSlotIdx = (currentSlotIdx + 1) % SLOTS.length;
      if (attempt >= SLOTS.length && currentModelIdx === 0) {
        currentModelIdx = 1;
        currentSlotIdx = 0;
      }
    }
  }
}

testSynth().catch(console.error);
