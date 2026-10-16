const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('studio.youtube.com'));
  if (!page) {
    console.log('No studio page found');
    process.exit(0);
  }

  await page.screenshot({ path: 'tools/yt_upload_live_status.png' });
  const text = await page.locator('ytcp-uploads-dialog, ytcp-video-upload-progress, #dialog').innerText().catch(() => '');
  console.log('Modal text:', text.replace(/\n+/g, ' | '));

  process.exit(0);
})().catch(console.error);
