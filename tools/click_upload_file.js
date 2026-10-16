const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];
  console.log('Page URL:', page.url());

  const uploadBtn = page.locator('button:has-text("Upload file"), div:has-text("Upload file"), #select-button').first();
  console.log('Upload btn visible:', await uploadBtn.isVisible({ timeout: 5000 }).catch(() => false));
  await uploadBtn.click();
  await page.waitForTimeout(3000);

  const dialog = page.locator('ytcp-dialog, [role="dialog"]').first();
  const isDialog = await dialog.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('Dialog visible:', isDialog);
  if (isDialog) {
    console.log('Dialog innerText:\n', await dialog.innerText());
  }

  await page.screenshot({ path: 'tools/after_click_now.png' });
  console.log('Saved tools/after_click_now.png');
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
