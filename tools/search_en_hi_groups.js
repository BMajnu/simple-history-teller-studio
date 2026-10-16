const { chromium } = require('playwright-core');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // Search English History Groups
  console.log('Searching English History Groups...');
  await page.goto('https://www.facebook.com/search/groups/?q=ancient%20civilization%20world%20history', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const publicFilter = page.locator('span:has-text("Public groups"), div[role="radio"]:has-text("Public"), [aria-label*="Public groups"]').first();
  if (await publicFilter.isVisible({ timeout: 4000 }).catch(() => false)) {
    await publicFilter.click({ force: true });
    await page.waitForTimeout(4000);
  }
  await page.screenshot({ path: 'tools/fb_en_groups_search.png' });

  const enGroups = await page.evaluate(() => {
    const items = [];
    const elements = document.querySelectorAll('div[role="feed"] a[href*="/groups/"], div[role="main"] a[href*="/groups/"]');
    elements.forEach(el => {
      const href = el.href.split('?')[0];
      const text = el.innerText.trim();
      if (text && text.length > 3 && !items.find(x => x.href === href)) {
        items.push({ href, text: text.replace(/\n+/g, ' | ') });
      }
    });
    return items;
  });
  console.log('Top English Groups:', enGroups.slice(0, 10));

  // Search Hindi History Groups
  console.log('\nSearching Hindi History Groups...');
  await page.goto('https://www.facebook.com/search/groups/?q=%E0%A4%AA%E0%A5%8D%E0%A4%B0%E0%A4%BE%E0%A4%9A%E0%A5%80%E0%A4%A8%20%E0%A4%87%E0%A4%A4%E0%A4%BF%E0%A4%B9%E0%A4%BE%E0%A4%B8', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  if (await publicFilter.isVisible({ timeout: 4000 }).catch(() => false)) {
    await publicFilter.click({ force: true });
    await page.waitForTimeout(4000);
  }
  await page.screenshot({ path: 'tools/fb_hi_groups_search.png' });

  const hiGroups = await page.evaluate(() => {
    const items = [];
    const elements = document.querySelectorAll('div[role="feed"] a[href*="/groups/"], div[role="main"] a[href*="/groups/"]');
    elements.forEach(el => {
      const href = el.href.split('?')[0];
      const text = el.innerText.trim();
      if (text && text.length > 3 && !items.find(x => x.href === href)) {
        items.push({ href, text: text.replace(/\n+/g, ' | ') });
      }
    });
    return items;
  });
  console.log('Top Hindi Groups:', hiGroups.slice(0, 10));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
