const { chromium } = require('playwright-core');

async function dismissModal() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];
  
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText.trim(),
      ariaLabel: b.getAttribute('aria-label'),
      className: b.className
    }));
  });
  console.log('Dialog buttons:', JSON.stringify(buttons, null, 2));

  // Look for the X button
  const closeBtn = page.locator('button:has(mat-icon:has-text("close")), button[aria-label*="close" i], button[aria-label*="dismiss" i]').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    console.log('Found close button, clicking...');
    await closeBtn.click();
  } else {
    // Look for mat-dialog-container close
    const xBtn = page.locator('mat-dialog-container button').first();
    if (await xBtn.isVisible().catch(() => false)) {
      console.log('Found mat-dialog button, clicking...');
      await xBtn.click();
    } else {
      console.log('Clicking outside...');
      await page.mouse.click(50, 50);
    }
  }

  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'tools/after_modal_close.png' });
  console.log('Saved tools/after_modal_close.png');
}

dismissModal().catch(console.error);
