const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const continueBtn = page.locator('button:has-text("Continue with pay per request")').first();
  console.log('Continue button visible:', await continueBtn.isVisible());
  if (await continueBtn.isVisible()) {
    console.log('Clicking "Continue with pay per request"...');
    await continueBtn.click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tools/after_continue_click.png' });
  console.log('Saved tools/after_continue_click.png');

  const dialogCount = await page.locator('[role="dialog"], .mat-mdc-dialog-container').count();
  console.log('Dialog count:', dialogCount);
})();
