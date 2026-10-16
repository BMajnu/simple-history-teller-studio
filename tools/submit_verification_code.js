const { chromium } = require('playwright-core');
const path = require('path');

const CODE = process.argv[2];
if (!CODE) {
  console.error('Please provide code as argument: node submit_verification_code.js 123456');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const THUMB_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'bn_thumbnail.jpg');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('youtube.com/verify')) || ctx.pages()[0];

  console.log('Entering 6-digit verification code:', CODE);
  const codeInput = page.locator('input[type="tel"], input[type="text"], input').last();
  await codeInput.waitFor({ state: 'visible', timeout: 10000 });
  await codeInput.fill(CODE);
  await page.waitForTimeout(1000);

  // Click SUBMIT button
  const submitBtn = page.locator('#submit-code-button tp-yt-paper-button, button:has-text("SUBMIT"), #submit-btn, tp-yt-paper-button:has-text("SUBMIT")').first();
  console.log('Clicking SUBMIT...');
  await submitBtn.click({ force: true });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'tools/yt_verify_success_screen.png' });
  console.log('Saved tools/yt_verify_success_screen.png');

  // Now immediately navigate to Video Edit page and upload custom thumbnail!
  console.log('Navigating to Video Details edit page to apply custom thumbnail...');
  await page.goto('https://studio.youtube.com/video/ibG0M13m7I0/edit', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Scroll down to thumbnail
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 500;
  });
  await page.waitForTimeout(1000);

  // Look for thumbnail file input or upload file button
  console.log('Attaching custom thumbnail file:', THUMB_PATH);
  const cdp = await ctx.newCDPSession(page);
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', {
    nodeId: root.nodeId,
    selector: 'input#file-loader, ytcp-thumbnails-compact input[type="file"], input[type="file"]'
  }).catch(() => ({ nodeId: 0 }));

  if (nodeId) {
    await cdp.send('DOM.setFileInputFiles', {
      files: [THUMB_PATH],
      nodeId: nodeId
    });
    console.log('Thumbnail attached via CDP!');
    await page.waitForTimeout(4000);
  } else {
    console.log('Clicking Upload file button...');
    const uploadBtn = page.locator('ytcp-thumbnails-compact #select-button, button:has-text("Upload file")').first();
    await uploadBtn.click();
    await page.waitForTimeout(2000);
  }

  // Click Save button
  const saveBtn = page.locator('#save, button:has-text("Save"), ytcp-button:has-text("Save")').first();
  if (await saveBtn.isVisible().catch(() => false)) {
    console.log('Clicking Save button...');
    await saveBtn.click({ force: true });
    await page.waitForTimeout(5000);
    console.log('Save completed!');
  }

  await page.screenshot({ path: 'tools/yt_video_with_custom_thumbnail.png' });
  console.log('Saved tools/yt_video_with_custom_thumbnail.png');

  process.exit(0);
})().catch(console.error);
