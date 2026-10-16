const { chromium } = require('playwright-core');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const THUMB_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'bn_thumbnail.jpg');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0];

  console.log('Finding Upload file thumbnail button...');
  const uploadBtn = page.locator('ytcp-thumbnails-compact #select-button, button:has-text("Upload file"), [aria-label*="Upload file"]').first();
  console.log('Upload file button visible:', await uploadBtn.isVisible());

  // Click Upload file
  console.log('Clicking Upload file button...');
  await uploadBtn.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'tools/yt_after_click_upload_file.png' });
  console.log('Saved tools/yt_after_click_upload_file.png');

  process.exit(0);
})().catch(console.error);
