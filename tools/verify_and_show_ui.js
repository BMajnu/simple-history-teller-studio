const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const profileDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = path.join(__dirname, '..');
const THUMB_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'bn_thumbnail.jpg');
const PHONE = '01833933521';
const CODE = '364130';

(async () => {
  console.log('=== STEP 1: LAUNCH VISIBLE CHROME BROWSER ON DESKTOP ===');
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    executablePath: chromePath,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--remote-debugging-port=9224'
    ],
    viewport: null
  });

  const page = context.pages()[0] || await context.newPage();
  await page.bringToFront();

  console.log('=== STEP 2: NAVIGATING TO YOUTUBE PHONE VERIFICATION ===');
  await page.goto('https://www.youtube.com/verify', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Check if we are already verified
  const bodyText = await page.innerText('body').catch(() => '');
  if (bodyText.includes('verified') || bodyText.includes('has already been verified')) {
    console.log('Phone number is already verified!');
  } else {
    // Check if on Step 1 (phone number input)
    const phoneInput = page.locator('input[type="tel"], input[type="text"], input').last();
    const isStep1 = await page.locator('#send-code-button, button:has-text("NEXT")').first().isVisible().catch(() => false);

    if (isStep1) {
      console.log('On Step 1: Entering phone number:', PHONE);
      await phoneInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await phoneInput.fill(PHONE);
      await page.waitForTimeout(1000);

      console.log('Clicking NEXT to dispatch SMS...');
      const nextBtn = page.locator('#send-code-button tp-yt-paper-button, #send-code-button a, button:has-text("NEXT")').first();
      await nextBtn.click({ force: true });
      await page.waitForTimeout(4000);
    }

    // Now we should be on Step 2 (enter 6-digit code)
    console.log('Entering 6-digit verification code:', CODE);
    const codeInput = page.locator('input[type="tel"], input[type="text"], input').last();
    await codeInput.waitFor({ state: 'visible', timeout: 10000 });
    await codeInput.click();
    await codeInput.fill(CODE);
    await page.waitForTimeout(1000);

    console.log('Clicking SUBMIT...');
    const submitBtn = page.locator('#submit-code-button tp-yt-paper-button, #submit-code-button button, button:has-text("SUBMIT"), tp-yt-paper-button:has-text("SUBMIT")').first();
    await submitBtn.click({ force: true });
    await page.waitForTimeout(5000);
  }

  await page.screenshot({ path: 'tools/yt_verification_final_state.png' });
  console.log('Saved tools/yt_verification_final_state.png');

  console.log('=== STEP 3: NAVIGATING TO VIDEO EDIT PAGE FOR THUMBNAIL ===');
  await page.goto('https://studio.youtube.com/video/ibG0M13m7I0/edit', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Scroll down to thumbnail area
  console.log('Scrolling down to thumbnail area in main container...');
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 500;
  });
  await page.waitForTimeout(1500);

  // Attach Custom Thumbnail
  console.log('Attaching custom thumbnail:', THUMB_PATH);
  const fileInput = page.locator('input#file-loader, ytcp-thumbnails-compact input[type="file"], input[type="file"]').first();
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles(THUMB_PATH);
    console.log('Thumbnail attached via file input!');
    await page.waitForTimeout(4000);
  } else {
    const uploadBtn = page.locator('ytcp-thumbnails-compact #select-button, button:has-text("Upload file"), [aria-label*="Upload file"]').first();
    if (await uploadBtn.isVisible().catch(() => false)) {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null),
        uploadBtn.click().catch(() => {})
      ]);
      if (fileChooser) {
        await fileChooser.setFiles(THUMB_PATH);
        console.log('Thumbnail selected via file chooser!');
        await page.waitForTimeout(4000);
      }
    }
  }

  // Scroll so title, preview and thumbnail are all in comfortable view
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 350;
  });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'tools/yt_thumbnail_ui_filled_preview.png' });
  console.log('Saved tools/yt_thumbnail_ui_filled_preview.png');

  console.log('=== SUCCESS: THUMBNAIL FORM FILLED & VISIBLE ON SCREEN! ===');
  console.log('NOT SAVING OR POSTING — WAITING FOR USER CONFIRMATION.');

  // Keep browser active and open on desktop
  setInterval(() => {}, 10000);
})().catch(err => {
  console.error('Error in verify and show UI:', err);
  process.exit(1);
});
