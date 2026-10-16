const { chromium } = require('playwright-core');
const { execSync } = require('child_process');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];

  try {
    execSync('powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Chrome\')"', { stdio: 'ignore' });
  } catch (e) {}

  await page.waitForTimeout(3000);
  console.log('Current URL:', page.url());

  // Check if dialog is visible
  let dialog = page.locator('ytcp-dialog, [role="dialog"]').first();
  let isDialog = await dialog.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('Dialog visible initially:', isDialog);

  if (!isDialog) {
    // Scroll to thumbnail section
    await page.evaluate(() => {
      const m = document.querySelector('main#main');
      if (m) m.scrollTop = 400;
    });
    await page.waitForTimeout(1000);

    // Look for upload file button
    console.log('Looking for upload file button...');
    const uploadBtn = page.locator('button:has-text("Upload file"), div:has-text("Upload file"), #select-button, [aria-label*="Upload file"]').first();
    if (await uploadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Clicking Upload file button...');
      await uploadBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  isDialog = await dialog.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('Dialog visible after click:', isDialog);
  if (isDialog) {
    const text = await dialog.innerText();
    console.log('Dialog text:\n', text);
    await page.screenshot({ path: 'tools/dialog_step1.png' });

    // Click Next button if present
    const nextBtn = dialog.locator('button:has-text("Next"), #next-button').first();
    if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Clicking Next...');
      await nextBtn.click();
      await page.waitForTimeout(3000);
      const step2Text = await page.locator('ytcp-dialog, [role="dialog"]').first().innerText().catch(() => '');
      console.log('Step 2 text:\n', step2Text);
      await page.screenshot({ path: 'tools/dialog_step2.png' });
    }
  }

  await page.screenshot({ path: 'tools/current_state.png' });
  console.log('Saved tools/current_state.png');
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
