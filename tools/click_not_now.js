const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function clickNotNow() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const notNowBtn = page.locator('button:has-text("এখন না"), a:has-text("এখন না"), text="এখন না"').first();
  if (await notNowBtn.isVisible().catch(() => false)) {
    console.log('Clicking "এখন না"...');
    await notNowBtn.click();
    await page.waitForTimeout(4000);
  }

  const shot = await page.screenshot({ type: 'png' });
  const shotPath = path.join(__dirname, 'after_not_now.png');
  fs.writeFileSync(shotPath, shot);
  console.log('Current URL:', page.url());
}

clickNotNow().catch(console.error);
