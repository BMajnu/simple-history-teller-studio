const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to new_chat...');
  await page.goto('https://aistudio.google.com/app/prompts/new_chat', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Open model picker
  console.log('Opening model picker...');
  const modelBtn = page.locator('button.model-select-button, button:has-text("Gemini"), [aria-label*="model"]').first();
  await modelBtn.click();
  await page.waitForTimeout(1000);

  // Click Video pill
  console.log('Clicking Video pill...');
  const videoPill = page.locator('button:has-text("Video")').first();
  await videoPill.click();
  await page.waitForTimeout(1500);

  // Click Gemini Omni 1.1 Flash
  console.log('Clicking text=Gemini Omni 1.1 Flash...');
  const omniTarget = page.locator('text=Gemini Omni 1.1 Flash').first();
  await omniTarget.click();
  await page.waitForTimeout(3000);

  console.log('Current URL:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 300));
  console.log('Body Text:', bodyText.replace(/\n/g, ' '));

  await page.screenshot({ path: 'tools/omni_selected_success.png' });
  console.log('Saved tools/omni_selected_success.png');
  await page.close();
})();
