const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to new_chat...');
  await page.goto('https://aistudio.google.com/app/prompts/new_chat', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Open model picker
  const modelBtn = page.locator('button.model-select-button, button:has-text("Gemini"), [aria-label*="model"]').first();
  await modelBtn.click();
  await page.waitForTimeout(1000);

  // Search for Veo 3.1 fast
  console.log('Searching for Veo 3.1 fast...');
  const searchInput = page.locator('input[placeholder*="Search for a model"]').first();
  await searchInput.fill('Veo 3.1 fast');
  await page.waitForTimeout(1000);

  // Click on the model card
  const modelCard = page.locator('div.model-card, .model-item, mat-card, [role="button"]').filter({ hasText: 'Veo 3.1 fast' }).first();
  console.log('Model card count:', await modelCard.count());
  if (await modelCard.count() > 0) {
    console.log('Clicking Veo 3.1 fast...');
    await modelCard.click();
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: 'tools/after_veo_fast_select.png' });
  console.log('Saved tools/after_veo_fast_select.png');
  console.log('Current URL:', page.url());

  // Also test searching for Gemini Omni
  await modelBtn.click();
  await page.waitForTimeout(1000);
  await searchInput.fill('Gemini Omni 1.1 Flash');
  await page.waitForTimeout(1000);
  const omniCard = page.locator('div.model-card, .model-item, mat-card, [role="button"]').filter({ hasText: 'Gemini Omni 1.1 Flash' }).first();
  console.log('Omni card count:', await omniCard.count());
  if (await omniCard.count() > 0) {
    console.log('Clicking Gemini Omni 1.1 Flash...');
    await omniCard.click();
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: 'tools/after_omni_select.png' });
  console.log('Saved tools/after_omni_select.png');
  console.log('Final URL:', page.url());

  await page.close();
})();
