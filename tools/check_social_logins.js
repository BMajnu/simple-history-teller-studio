const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('--- CHECKING SOCIAL MEDIA LOGINS ---');

  // Check Facebook
  try {
    console.log('Checking Facebook...');
    await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    const fbUrl = page.url();
    const fbLogged = !fbUrl.includes('login') && !fbUrl.includes('recover');
    console.log('Facebook URL:', fbUrl, '| Logged In:', fbLogged);
    await page.screenshot({ path: 'tools/status_fb.png' });
  } catch (e) {
    console.log('FB error:', e.message);
  }

  // Check TikTok
  try {
    console.log('Checking TikTok...');
    await page.goto('https://www.tiktok.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    const ttUrl = page.url();
    console.log('TikTok URL:', ttUrl);
    await page.screenshot({ path: 'tools/status_tiktok.png' });
  } catch (e) {
    console.log('TikTok error:', e.message);
  }

  // Check Instagram
  try {
    console.log('Checking Instagram...');
    await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    const igUrl = page.url();
    console.log('Instagram URL:', igUrl);
    await page.screenshot({ path: 'tools/status_ig.png' });
  } catch (e) {
    console.log('Instagram error:', e.message);
  }

  await page.close();
  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
