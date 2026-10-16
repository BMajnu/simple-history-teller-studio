const { chromium } = require('playwright-core');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VIDEO_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'video_bn.mp4');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages()[0] || await ctx.newPage();

  console.log('Navigating to YouTube Studio Upload page...');
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/upload?d=pt', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(4000);

  // Click Upload videos button if present
  const uploadBtn = page.locator('ytcp-button:has-text("Upload videos"), button:has-text("Upload videos"), ytcp-button:has-text("ভিডিও আপলোড"), button:has-text("ভিডিও আপলোড"), #upload-button').first();
  if (await uploadBtn.isVisible().catch(() => false)) {
    console.log('Clicking upload button...');
    await uploadBtn.click();
    await page.waitForTimeout(3000);
  }

  const cdp = await ctx.newCDPSession(page);
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', {
    nodeId: root.nodeId,
    selector: 'input[type="file"]'
  });
  console.log('Found file input nodeId:', nodeId);

  console.log('Calling DOM.setFileInputFiles with path:', VIDEO_PATH);
  await cdp.send('DOM.setFileInputFiles', {
    files: [VIDEO_PATH],
    nodeId: nodeId
  });

  console.log('DOM.setFileInputFiles succeeded! Waiting 5s...');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tools/test_cdp_upload_result.png' });
  console.log('Screenshot saved to tools/test_cdp_upload_result.png');
  process.exit(0);
})().catch(err => {
  console.error('CDP Upload Error:', err);
  process.exit(1);
});
