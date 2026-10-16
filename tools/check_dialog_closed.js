const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  await page.screenshot({ path: 'tools/dialog_state_now.png' });
  console.log('Saved tools/dialog_state_now.png');

  const dialogCount = await page.locator('[role="dialog"], .mat-mdc-dialog-container').count();
  console.log('Dialog count:', dialogCount);

  const runBtn = page.locator('button:has-text("Run")').last();
  console.log('Run disabled attribute:', await runBtn.getAttribute('disabled'));
  console.log('Run aria-disabled:', await runBtn.getAttribute('aria-disabled'));
})();
