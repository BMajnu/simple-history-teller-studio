const { chromium } = require('playwright-core');

async function inspectDropdown() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];
  
  // Click dropdown
  const select = page.locator('mat-select, [role="combobox"]').first();
  await select.click();
  await page.waitForTimeout(1000);
  
  const options = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('mat-option, [role="option"]')).map(o => o.innerText.trim());
  });
  console.log('Project options:', options);
}

inspectDropdown().catch(console.error);
