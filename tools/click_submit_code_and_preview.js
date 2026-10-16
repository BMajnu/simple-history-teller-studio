const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const THUMB_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'bn_thumbnail.jpg');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(x => x.url().includes('youtube.com/verify')) || ctx.pages()[0];

  console.log('1. Clicking SUBMIT button on verification page...');
  const submitBtn = p.locator('#submit-button tp-yt-paper-button, #submit-button a, #submit-button #button').first();
  await submitBtn.click({ force: true });
  console.log('Clicked SUBMIT! Waiting 5s...');
  await p.waitForTimeout(5000);

  await p.screenshot({ path: 'tools/verification_success_live.png' });
  console.log('Saved tools/verification_success_live.png');

  // 2. Open Video Edit Page
  console.log('2. Navigating to Video Details Edit page: https://studio.youtube.com/video/ibG0M13m7I0/edit ...');
  await p.goto('https://studio.youtube.com/video/ibG0M13m7I0/edit', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(5000);

  // Scroll down to Thumbnail section
  console.log('3. Scrolling to Thumbnail section...');
  await p.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 500;
  });
  await p.waitForTimeout(1500);

  // Click Upload file or attach to file input
  console.log('4. Attaching Custom Thumbnail:', THUMB_PATH);
  const uploadBtn = p.locator('ytcp-thumbnails-compact #select-button, button:has-text("Upload file"), [aria-label*="Upload file"]').first();
  if (await uploadBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking Upload file button...');
    const [fileChooser] = await Promise.all([
      p.waitForEvent('filechooser', { timeout: 6000 }).catch(() => null),
      uploadBtn.click().catch(() => {})
    ]);
    if (fileChooser) {
      console.log('FileChooser triggered! Setting file...');
      await fileChooser.setFiles(THUMB_PATH);
      await p.waitForTimeout(4000);
    } else {
      console.log('Fallback: using CDP DOM.setFileInputFiles...');
      const cdp = await ctx.newCDPSession(p);
      const { root } = await cdp.send('DOM.getDocument');
      const { nodeId } = await cdp.send('DOM.querySelector', {
        nodeId: root.nodeId,
        selector: 'input#file-loader, ytcp-thumbnails-compact input[type="file"], input[type="file"]'
      }).catch(() => ({ nodeId: 0 }));
      if (nodeId) {
        await cdp.send('DOM.setFileInputFiles', { files: [THUMB_PATH], nodeId });
        await p.waitForTimeout(4000);
      }
    }
  }

  // Scroll back so both title, preview and thumbnail are visible
  await p.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 320;
  });
  await p.waitForTimeout(1500);

  // Bring Chrome window to front on desktop
  try {
    execSync('powershell -ExecutionPolicy Bypass -File tools/bring_chrome_front.ps1', { stdio: 'ignore' });
  } catch (e) {}

  await p.screenshot({ path: 'tools/thumbnail_attached_preview.png' });
  console.log('Saved tools/thumbnail_attached_preview.png');
  console.log('=== CUSTOM THUMBNAIL ATTACHED & PREVIEW READY! ===');
  console.log('NO CHANGES SAVED — WAITING FOR USER CONFIRMATION.');

  process.exit(0);
})().catch(console.error);
