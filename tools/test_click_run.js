const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  // We are currently on generate-speech or navigate to it
  await page.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  const textarea = page.locator('textarea').first();
  await textarea.click();
  await textarea.fill('আমি সময়ের সাক্ষী! আজ তুমি যে দেশেরই নাগরিক হও না কেন...');
  await page.waitForTimeout(500);

  // Set voice to Charon
  const speakerBtn = page.locator('button').filter({ hasText: 'Speaker' }).first();
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

  await page.screenshot({ path: 'tools/after_voice_select.png' });
  console.log('Voice selected. Now clicking Run...');

  // Click Run
  const runBtn = page.locator('button:has-text("Run")').last();
  await runBtn.click();
  console.log('Clicked Run!');

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tools/after_run_click.png' });
  console.log('Screenshot saved after Run click.');

  await browser.close();
})();
