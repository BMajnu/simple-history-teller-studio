const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('tiktok.com'));
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);
  const bio = await p.evaluate(() => {
    return {
      title: document.title,
      h1: document.querySelector('h1')?.innerText,
      h2: document.querySelector('h2')?.innerText,
      bio: document.querySelector('[data-e2e="user-bio"]')?.innerText,
      avatarSrc: document.querySelector('img[class*="ImgAvatar"]')?.src
    };
  });
  console.log('Profile details:', JSON.stringify(bio, null, 2));
  await p.screenshot({ path: 'tools/tiktok_c1_verified_live.png' });
  process.exit(0);
})();
