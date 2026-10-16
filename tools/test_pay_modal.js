const { chromium } = require('playwright-core');

async function inspectModal() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];
  
  // Look at text of buttons in modal
  const text = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
  });
  console.log('Buttons:', text);
  
  // Click "Continue with pay per request"
  const payBtn = page.locator('text="Continue with pay per request"').first();
  if (await payBtn.isVisible()) {
    console.log('Clicking Continue with pay per request...');
    await payBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tools/after_pay_click.png' });
    console.log('Saved tools/after_pay_click.png');
  }
}

inspectModal().catch(console.error);
