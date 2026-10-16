const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const modalBtns = await page.locator('.mat-mdc-dialog-container button, [role="dialog"] button').all();
  for (let i = 0; i < modalBtns.length; i++) {
    console.log(i, (await modalBtns[i].innerText()).trim(), await modalBtns[i].getAttribute('class'));
  }

  // Find close button or click Continue with pay per request
  const closeBtn = page.locator('.mat-mdc-dialog-container button:has(mat-icon:has-text("close")), [role="dialog"] button:has-text("close")').first();
  if (await closeBtn.count() > 0) {
    console.log('Clicking close (✕) button...');
    await closeBtn.click();
  } else if (modalBtns.length > 0) {
    console.log('Clicking modal button 0...');
    await modalBtns[0].click();
  }
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tools/after_modal_click_clean.png' });
  console.log('Saved tools/after_modal_click_clean.png');
})();
