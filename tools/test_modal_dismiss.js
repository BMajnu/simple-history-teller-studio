const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const modal = page.locator('text="Upgrade to unlock more"').first();
  console.log('Modal visible:', await modal.isVisible());

  // Click close button
  const closeBtn = page.locator('[role="dialog"] button:has-text("close"), [role="dialog"] button[aria-label*="close"], [role="dialog"] button mat-icon:has-text("close")').first();
  if (await closeBtn.count() > 0) {
    console.log('Clicking close (✕) button...');
    await closeBtn.click();
    await page.waitForTimeout(1000);
  } else {
    console.log('Pressing Escape...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'tools/after_modal_close.png' });
  console.log('Saved tools/after_modal_close.png');

  // Check if Run is clickable now
  const runBtn = page.locator('button:has-text("Run")').last();
  console.log('Run disabled attribute:', await runBtn.getAttribute('disabled'));
  console.log('Run aria-disabled:', await runBtn.getAttribute('aria-disabled'));
})();
