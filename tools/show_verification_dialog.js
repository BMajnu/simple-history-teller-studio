const { chromium } = require('playwright-core');
const { execSync } = require('child_process');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Launching visible Chrome with user profile...');
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

  console.log('Navigating to Part 3 edit page...');
  await page.goto('https://studio.youtube.com/video/jg48SOofyDk/edit', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Scroll to thumbnail
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 450;
  });
  await page.waitForTimeout(1000);

  // Click on "Upload file"
  console.log('Triggering thumbnail upload...');
  const uploadBtn = page.locator('button:has-text("Upload file"), div:has-text("Upload file"), #select-button').first();
  if (await uploadBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await uploadBtn.click();
    await page.waitForTimeout(2000);
  }

  // Take screenshot of step 1
  await page.screenshot({ path: 'tools/verification_modal_open.png' });

  // Click Next on the modal
  const nextBtn = page.locator('ytcp-dialog button:has-text("Next"), ytcp-dialog #next-button').first();
  if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Clicking Next to see verification options...');
    await nextBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tools/verification_modal_step2.png' });
    const modalText = await page.locator('ytcp-dialog, [role="dialog"]').first().innerText().catch(() => '');
    console.log('Modal Step 2 Details:\n', modalText);
  }

  try {
    execSync('powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Chrome\')"', { stdio: 'ignore' });
  } catch (e) {}

  console.log('Chrome is open in foreground on user display. Waiting 180s...');
  await page.waitForTimeout(180000);
  process.exit(0);
})().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
