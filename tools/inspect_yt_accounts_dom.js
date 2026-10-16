const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const avatar = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);

  // Click switch account
  const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("অন্য অ্যাকাউন্ট ব্যবহার")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  const items = await page.evaluate(() => {
    const list = [];
    document.querySelectorAll('ytd-account-item-renderer, ytd-compact-link-renderer, a').forEach(el => {
      const text = (el.innerText || '').trim();
      const href = el.getAttribute('href') || '';
      if (text.includes('@gmail.com') || text.includes('Majnu')) {
        list.push({
          tag: el.tagName,
          id: el.id,
          className: el.className,
          href,
          text: text.replace(/\n+/g, ' | ')
        });
      }
    });
    return list;
  });

  console.log('Account switch items:');
  console.dir(items, { depth: null });

  await page.close();
}

main().catch(console.error);
