const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to https://aistudio.google.com/app/prompts/new_chat...');
  await page.goto('https://aistudio.google.com/app/prompts/new_chat', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  console.log('Current URL:', page.url());
  console.log('Title:', await page.title());
  await page.screenshot({ path: 'tools/new_chat_screen.png' });
  console.log('Saved tools/new_chat_screen.png');

  // Check model selector button
  const modelBtn = page.locator('button.model-select-button, button:has-text("Gemini"), [aria-label*="model"], .model-picker').first();
  console.log('Model button count:', await modelBtn.count());
  if (await modelBtn.count() > 0) {
    console.log('Model button text:', await modelBtn.innerText());
    await modelBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tools/model_picker_screen.png' });
    console.log('Saved tools/model_picker_screen.png');
  }

  await page.close();
})();
