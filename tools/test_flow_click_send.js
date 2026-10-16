const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    await page.goto('https://flow.google.com/project/6b6c9890-d01a-498e-840d-d27c7ab94128', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const promptInput = page.locator('div[contenteditable="true"]').first();
    await promptInput.fill('Animate scene 10: Cavemen running away from roaring sabertooth tiger, 2D cartoon dynamic animation 24fps');
    await page.waitForTimeout(1000);

    const sendBtn = page.locator('button:has(mat-icon:has-text("arrow_forward")), button[aria-label*="জেনারেট"]').first();
    console.log('Clicking send...');
    await sendBtn.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'tools/test_flow_after_send.png' });
    console.log('Saved tools/test_flow_after_send.png');

    const overlays = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.cdk-overlay-container *, mat-dialog-container *, .modal *')).map(el => ({
        text: (el.innerText || '').slice(0, 50).trim(),
        class: el.className
      })).filter(x => x.text);
    });
    console.log('Overlays after click:', JSON.stringify(overlays.slice(0, 15), null, 2));

    await page.close();
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
})();
