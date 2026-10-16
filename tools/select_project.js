const { chromium } = require('playwright-core');

async function selectProject() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];
  
  const opt = page.locator('mat-option:has-text("fluent-stratum")').first();
  if (await opt.isVisible()) {
    await opt.click();
    console.log('Selected fluent-stratum!');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tools/after_project_selected.png' });
    console.log('Saved tools/after_project_selected.png');
  }
}

selectProject().catch(console.error);
