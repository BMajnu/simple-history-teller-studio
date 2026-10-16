const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to generate-speech...');
  await page.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  await page.keyboard.press('Escape');

  // Dismiss any dialogs
  for (let c = 0; c < 3; c++) {
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

  await page.screenshot({ path: 'tools/speech_ui_debug.png' });
  console.log('Saved tools/speech_ui_debug.png');

  const btns = await page.locator('button').allInnerTexts();
  console.log('Buttons on speech page:', btns);

  const textareas = await page.locator('textarea').count();
  console.log('Textareas:', textareas);

  await page.close();
  await browser.close();
})();
