const { chromium } = require('playwright-core');

async function clickNext() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];
  
  const nextBtn = page.locator('button:has-text("Next")').first();
  if (await nextBtn.isVisible()) {
    console.log('Clicking Next...');
    await nextBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tools/after_next_click.png' });
    console.log('Saved tools/after_next_click.png');
  }
}

clickNext().catch(console.error);
