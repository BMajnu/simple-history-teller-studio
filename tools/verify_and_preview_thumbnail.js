const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const profileDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = path.join(__dirname, '..');
const THUMB_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'bn_thumbnail.jpg');
const CODE = '364130';

console.log('=== VERIFYING PHONE WITH CODE 364130 & OPENING THUMBNAIL PREVIEW ===');

(async () => {
  console.log('1. Launching visible maximized Chrome with profile_3...');
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    executablePath: chromePath,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled'
    ],
    viewport: null
  });

  const page = context.pages()[0] || await context.newPage();

  // Bring to front on Windows via PowerShell AppActivate
  try {
    execSync('powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Chrome\')"', { stdio: 'ignore' });
  } catch (e) {}

  // 2. Submit Verification Code
  console.log('2. Navigating to https://www.youtube.com/verify ...');
  await page.goto('https://www.youtube.com/verify', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('Looking for verification code input...');
  const codeInput = page.locator('input[type="tel"], input[type="text"], input').last();
  if (await codeInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Typing verification code:', CODE);
    await codeInput.fill(CODE);
    await page.waitForTimeout(1000);

    const submitBtn = page.locator('#submit-code-button tp-yt-paper-button, button:has-text("SUBMIT"), #submit-btn, tp-yt-paper-button:has-text("SUBMIT")').first();
    if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Clicking SUBMIT...');
      await submitBtn.click({ force: true });
      await page.waitForTimeout(4000);
    }
  }

  await page.screenshot({ path: 'tools/yt_verify_status_after_code.png' });
  console.log('Saved tools/yt_verify_status_after_code.png');

  // 3. Open Video Details Edit Page
  console.log('3. Navigating to Video Details Edit page: https://studio.youtube.com/video/ibG0M13m7I0/edit ...');
  await page.goto('https://studio.youtube.com/video/ibG0M13m7I0/edit', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Bring to front again
  try {
    execSync('powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Chrome\')"', { stdio: 'ignore' });
  } catch (e) {}

  // Scroll down to thumbnail area
  console.log('4. Scrolling to Thumbnail section...');
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 500;
  });
  await page.waitForTimeout(1000);

  // 5. Upload Custom Thumbnail
  console.log('5. Attaching Custom Thumbnail:', THUMB_PATH);
  const fileInput = page.locator('input#file-loader, ytcp-thumbnails-compact input[type="file"], input[type="file"]').first();
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles(THUMB_PATH);
    console.log('Custom thumbnail attached via file input!');
    await page.waitForTimeout(3000);
  } else {
    console.log('Clicking Upload file button...');
    const uploadBtn = page.locator('ytcp-thumbnails-compact #select-button, button:has-text("Upload file"), [aria-label*="Upload file"]').first();
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null),
      uploadBtn.click().catch(() => {})
    ]);
    if (fileChooser) {
      await fileChooser.setFiles(THUMB_PATH);
      console.log('Thumbnail selected via file chooser!');
      await page.waitForTimeout(3000);
    }
  }

  // 6. Scroll back up slightly so both the video title, preview player, and thumbnail are visible
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 300;
  });
  await page.waitForTimeout(2000);

  // Bring to front
  try {
    execSync('powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Chrome\')"', { stdio: 'ignore' });
  } catch (e) {}

  await page.screenshot({ path: 'tools/yt_thumbnail_preview_ready.png' });
  console.log('Saved tools/yt_thumbnail_preview_ready.png');

  console.log('=== FORM FILLED WITH THUMBNAIL. WAITING FOR USER CONFIRMATION BEFORE SAVING! ===');
  console.log('Leaving browser window open in foreground...');

  // Keep browser alive so user can view directly on desktop
  setInterval(() => {}, 10000);
})().catch(err => {
  console.error('Error during verify and preview:', err);
  process.exit(1);
});
