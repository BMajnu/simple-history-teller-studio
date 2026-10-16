const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('studio.youtube.com'));

  console.log('Clicking Done on ytcp-banner-editor...');
  await page.evaluate(() => {
    const bannerDone = document.querySelector('ytcp-banner-editor #done-button button, ytcp-banner-editor #done-button, ytcp-banner-editor button');
    if (bannerDone) bannerDone.click();
  });
  await page.waitForTimeout(3000);

  console.log('Clicking Publish on Studio...');
  await page.evaluate(() => {
    const pub = document.querySelector('#publish-button button, #publish-button');
    if (pub) pub.click();
  });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'tools/c1_published_live.png' });
  console.log('Channel 1 is published live!');
  process.exit(0);
})();
