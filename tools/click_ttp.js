const { chromium } = require('playwright-core');

async function clickTTP() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];
  await page.locator('text="TTP Tech Tube Pro"').first().click();
  await page.waitForTimeout(3000);
  console.log('Clicked TTP account, current URL:', page.url());
}

clickTTP().catch(console.error);
