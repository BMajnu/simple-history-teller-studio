const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    await page.goto('https://flow.google.com/project/6b6c9890-d01a-498e-840d-d27c7ab94128', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    const promptInput = page.locator('div[contenteditable="true"], textarea, input[placeholder*="তৈরি করতে"]').first();
    console.log('Prompt input count:', await promptInput.count());
    if (await promptInput.count() > 0) {
      await promptInput.fill('Animate scene 10: Cavemen running away from roaring sabertooth tiger, 2D cartoon dynamic animation 24fps');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tools/test_flow_prompt_filled.png' });
      console.log('Saved tools/test_flow_prompt_filled.png');
    }

    await page.close();
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
})();
