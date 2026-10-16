const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to https://aistudio.google.com/app/prompts/new_chat...');
  await page.goto('https://aistudio.google.com/app/prompts/new_chat', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Open model picker
  const modelBtn = page.locator('button.model-select-button, button:has-text("Gemini"), [aria-label*="model"]').first();
  await modelBtn.click();
  await page.waitForTimeout(1000);

  // Click "Video" filter pill
  console.log('Clicking "Video" category pill...');
  const videoPill = page.locator('button:has-text("Video"), [role="tab"]:has-text("Video"), .category-pill:has-text("Video")').first();
  await videoPill.click();
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'tools/after_click_video_pill.png' });
  console.log('Saved tools/after_click_video_pill.png');

  // Find Gemini Omni 1.1 Flash or Veo
  const omniModel = page.locator('button:has-text("Gemini Omni 1.1 Flash"), [role="option"]:has-text("Gemini Omni 1.1 Flash"), div:has-text("gemini-omni-1.1-flash")').first();
  console.log('Omni model count:', await omniModel.count());
  if (await omniModel.count() > 0) {
    console.log('Clicking Gemini Omni 1.1 Flash...');
    await omniModel.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tools/omni_model_active.png' });
    console.log('Saved tools/omni_model_active.png');
  }

  console.log('Current URL after model selection:', page.url());
  await page.close();
})();
