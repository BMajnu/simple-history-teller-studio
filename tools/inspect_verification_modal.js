const { chromium } = require('playwright-core');
const { execSync } = require('child_process');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--remote-debugging-port=9224'
    ],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  try {
    execSync('powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Chrome\')"', { stdio: 'ignore' });
  } catch (e) {}

  console.log('Navigating to Part 3 edit page: https://studio.youtube.com/video/jg48SOofyDk/edit');
  await page.goto('https://studio.youtube.com/video/jg48SOofyDk/edit', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Scroll to thumbnail section
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 400;
  });
  await page.waitForTimeout(1000);

  // Take screenshot before click
  await page.screenshot({ path: 'tools/part3_before_click.png' });

  // Click on "Upload file" thumbnail button
  console.log('Locating upload file thumbnail button...');
  const uploadFileBtn = page.locator('button:has-text("Upload file"), div:has-text("Upload file"), #select-button, [aria-label*="Upload file"]').first();
  if (await uploadFileBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking upload file button...');
    await uploadFileBtn.click();
    await page.waitForTimeout(3000);
  }

  // Check if dialog is visible
  const dialog = page.locator('ytcp-dialog, [role="dialog"]').first();
  const isDialog = await dialog.isVisible({ timeout: 3000 }).catch(() => false);
  console.log('Dialog visible:', isDialog);
  if (isDialog) {
    const dialogText = await dialog.innerText();
    console.log('Dialog text:\n', dialogText);

    await page.screenshot({ path: 'tools/dialog_step1.png' });

    // Click NEXT on the dialog
    const nextBtn = page.locator('ytcp-dialog button:has-text("Next"), ytcp-dialog #next-button, button:has-text("Next")').first();
    if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Clicking Next on dialog...');
      await nextBtn.click();
      await page.waitForTimeout(4000);
      const nextDialogText = await page.locator('ytcp-dialog, [role="dialog"]').first().innerText().catch(() => '');
      console.log('Next dialog text:\n', nextDialogText);
      await page.screenshot({ path: 'tools/dialog_step2.png' });
    }
  }

  // Keep Chrome open and running for the user
  console.log('Chrome is open on screen for inspection.');
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
