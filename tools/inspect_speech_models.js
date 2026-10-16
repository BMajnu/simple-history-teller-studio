const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  await page.goto('https://aistudio.google.com/u/3/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);

  // Click model card or dropdown on the right side
  const modelBtn = page.locator('text="Gemini 3.8 Flash TTS", text="gemini-3.8-flash-tts"').first();
  console.log('Model button exists:', await modelBtn.count() > 0);
  if (await modelBtn.count() > 0) {
    await modelBtn.click();
    await page.waitForTimeout(1000);
    const options = await page.locator('.cdk-overlay-container, mat-option, [role="option"], [role="menuitem"]').allInnerTexts();
    console.log('Model options in menu:', options);
    await page.keyboard.press('Escape');
  }

  // Also check if navigating to model=gemini-3.8-flash-lite-tts or similar works
  const testModels = ['gemini-3.8-flash-lite-tts', 'gemini-2.5-flash-lite-tts', 'gemini-3.8-flash-lite'];
  for (const m of testModels) {
    await page.goto(`https://aistudio.google.com/u/3/generate-speech?model=${m}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const title = await page.evaluate(() => {
      const el = document.querySelector('run-settings, .run-settings-panel');
      return el ? el.innerText.slice(0, 150).replace(/\n/g, ' ') : document.body.innerText.slice(0, 100).replace(/\n/g, ' ');
    });
    console.log(`Model [${m}] -> title: ${title}`);
  }
})();
