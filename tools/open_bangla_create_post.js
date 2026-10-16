const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('facebook.com')) || ctx.pages()[0];

  console.log('Navigating to your_pages...');
  await page.goto('https://www.facebook.com/pages/?category=your_pages', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'tools/fb_your_pages_fresh.png' });
  console.log('Saved tools/fb_your_pages_fresh.png');

  // Let's find the Create Post button under Simple History Teller Bangla
  // In fb_your_pages.png, each page card has "Create Post"
  const cards = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).filter(el => el.innerText && el.innerText.includes('Simple History Teller Bangla')).slice(0, 5).map(el => ({
      tag: el.tagName,
      text: el.innerText.slice(0, 100)
    }));
  });
  console.log('Cards found:', cards);

  // Click "Create Post" button associated with Simple History Teller Bangla
  const banglaSection = page.locator('div:has-text("Simple History Teller Bangla")').filter({ hasText: 'Create Post' }).last();
  if (await banglaSection.isVisible().catch(() => false)) {
    console.log('Found Bangla section with Create Post!');
    const createPostBtn = banglaSection.locator('div[role="button"]:has-text("Create Post"), button:has-text("Create Post")').first();
    await createPostBtn.click();
    await page.waitForTimeout(4000);
    console.log('Clicked Create Post! URL:', page.url());
    await page.screenshot({ path: 'tools/fb_after_create_post_click.png' });
    console.log('Saved tools/fb_after_create_post_click.png');
  }

  process.exit(0);
})();
