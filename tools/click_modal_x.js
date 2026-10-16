const { chromium } = require('playwright-core');

async function clickModalX() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];
  
  // Click the X icon coordinates or the mat-icon / svg
  console.log('Clicking X at 1205, 325...');
  await page.mouse.click(1205, 325);
  await page.waitForTimeout(1000);
  
  // Also try clicking the backdrop at 100, 100
  await page.mouse.click(100, 100);
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'tools/after_x_click.png' });
  console.log('Saved tools/after_x_click.png');
}

clickModalX().catch(console.error);
