const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const THUMB_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'bn_thumbnail.jpg');
const PHONE = '01833933521';
const CODE = '364130';

(async () => {
  console.log('Connecting to active Chrome on port 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0] || await ctx.newPage();

  console.log('1. Navigating to https://www.youtube.com/verify ...');
  await page.goto('https://www.youtube.com/verify', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Check if we are on step 1 (Phone number)
  const sendCodeBtn = page.locator('#send-code-button').first();
  if (await sendCodeBtn.isVisible().catch(() => false)) {
    console.log('On Step 1: Entering phone number:', PHONE);
    const phoneInput = page.locator('input').last();
    await phoneInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await phoneInput.fill(PHONE);
    await page.waitForTimeout(1000);

    console.log('Clicking NEXT...');
    const paperBtn = page.locator('#send-code-button tp-yt-paper-button, #send-code-button a, #send-code-button #text').first();
    await paperBtn.click({ force: true });
    await page.waitForTimeout(4000);
  }

  // Now on Step 2: Enter code
  console.log('On Step 2: Entering 6-digit code:', CODE);
  const codeInput = page.locator('input').last();
  await codeInput.waitFor({ state: 'visible', timeout: 15000 });
  await codeInput.click();
  await codeInput.fill(CODE);
  await page.waitForTimeout(1000);

  console.log('Clicking SUBMIT...');
  const submitBtn = page.locator('#submit-code-button tp-yt-paper-button, #submit-code-button #button, #submit-code-button button, button:has-text("SUBMIT")').first();
  await submitBtn.click({ force: true });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'tools/verification_result_screen.png' });
  console.log('Saved tools/verification_result_screen.png');

  // Now go to Video Edit page
  console.log('2. Navigating to Video Details Edit page: https://studio.youtube.com/video/ibG0M13m7I0/edit ...');
  await page.goto('https://studio.youtube.com/video/ibG0M13m7I0/edit', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Scroll down to Thumbnail section
  console.log('3. Scrolling to Thumbnail section...');
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 500;
  });
  await page.waitForTimeout(1500);

  // Click Upload file or attach to file input
  console.log('4. Uploading Custom Thumbnail:', THUMB_PATH);
  const uploadBtn = page.locator('ytcp-thumbnails-compact #select-button, button:has-text("Upload file"), [aria-label*="Upload file"]').first();
  if (await uploadBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking Upload file button...');
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 6000 }).catch(() => null),
      uploadBtn.click().catch(() => {})
    ]);
    if (fileChooser) {
      console.log('FileChooser triggered! Setting file...');
      await fileChooser.setFiles(THUMB_PATH);
      await page.waitForTimeout(4000);
    } else {
      console.log('FileChooser not caught, trying CDP setFileInputFiles...');
      const cdp = await ctx.newCDPSession(page);
      const { root } = await cdp.send('DOM.getDocument');
      const { nodeId } = await cdp.send('DOM.querySelector', {
        nodeId: root.nodeId,
        selector: 'input#file-loader, ytcp-thumbnails-compact input[type="file"], input[type="file"]'
      }).catch(() => ({ nodeId: 0 }));
      if (nodeId) {
        await cdp.send('DOM.setFileInputFiles', { files: [THUMB_PATH], nodeId });
        await page.waitForTimeout(4000);
      }
    }
  }

  // Scroll so everything is visible
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 350;
  });
  await page.waitForTimeout(2000);

  // Bring to front
  try {
    execSync('powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Chrome\')"', { stdio: 'ignore' });
  } catch (e) {}

  await page.screenshot({ path: 'tools/thumbnail_ready_preview.png' });
  console.log('Saved tools/thumbnail_ready_preview.png');
  console.log('=== PREVIEW READY! WAITING FOR USER CONFIRMATION BEFORE SAVING! ===');

  process.exit(0);
})().catch(err => {
  console.error('Error during verification and preview:', err);
  process.exit(1);
});
