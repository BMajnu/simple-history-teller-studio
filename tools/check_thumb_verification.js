const { chromium } = require('playwright-core');
const { execSync } = require('child_process');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  let browser, ctx;
  try {
    browser = await chromium.connectOverCDP('http://127.0.0.1:9224', { timeout: 2000 });
    ctx = browser.contexts()[0];
    if (ctx.pages().length === 0) throw new Error('No open pages');
  } catch (e) {
    ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: false,
      executablePath: CHROME_PATH,
      args: [
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
        '--remote-debugging-port=9224'
      ],
      viewport: null
    });
    browser = ctx;
  }

  const page = ctx.pages()[0] || await ctx.newPage();
  try {
    execSync('powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Chrome\')"', { stdio: 'ignore' });
  } catch (e) {}

  console.log('Navigating to Part 3 edit page: https://studio.youtube.com/video/jg48SOofyDk/edit');
  await page.goto('https://studio.youtube.com/video/jg48SOofyDk/edit', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Try uploading thumbnail
  console.log('Attaching Part 3 thumbnail...');
  const editThumbInput = page.locator('input#file-loader, ytcp-thumbnails-compact input[type="file"], input[type="file"]').first();
  await editThumbInput.setInputFiles('D:\\Developing Projects\\Itihash Explainer Video\\projects\\sample_first_king\\metadata\\shorts_full\\thumb_full_part3.jpg');
  await page.waitForTimeout(3000);

  // Check if dialog is visible
  const dialog = page.locator('ytcp-dialog, [role="dialog"]').first();
  const isDialog = await dialog.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('Dialog visible:', isDialog);
  if (isDialog) {
    const dialogText = await dialog.innerText();
    console.log('Dialog text:\n', dialogText);

    // Click NEXT to see what verification options exist
    const nextBtn = page.locator('ytcp-dialog button:has-text("Next"), ytcp-dialog #next-button, button:has-text("Next")').first();
    if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Clicking Next on verification dialog...');
      await nextBtn.click();
      await page.waitForTimeout(3000);
      const nextDialogText = await page.locator('ytcp-dialog, [role="dialog"]').first().innerText().catch(() => '');
      console.log('Next dialog text:\n', nextDialogText);
    }
  }

  await page.screenshot({ path: 'tools/dialog_verification_check.png' });
  console.log('Saved tools/dialog_verification_check.png');
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
