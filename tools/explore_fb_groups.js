const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('=== EXPLORING FACEBOOK GROUPS ===');

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // 1. Navigate to FB home
  console.log('Navigating to Facebook...');
  await page.goto('https://www.facebook.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // Switch context back to personal profile if currently on a Page
  const switchBack = page.locator('div[role="button"]:has-text("Switch to Badiuzzaman"), div[aria-label*="Switch to Badiuzzaman"]').first();
  if (await switchBack.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Switching back to personal profile Badiuzzaman Majnu...');
    await switchBack.click({ force: true });
    await page.waitForTimeout(6000);
  }

  // 2. Check Joined Groups
  console.log('Checking joined groups: https://www.facebook.com/groups/joins/ ...');
  await page.goto('https://www.facebook.com/groups/joins/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'tools/fb_my_groups.png' });

  const myGroups = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href*="/groups/"]'));
    const unique = new Map();
    anchors.forEach(a => {
      const href = a.href.split('?')[0];
      const text = a.innerText.trim();
      if (text && text.length > 2 && !href.includes('/feed') && !href.includes('/joins') && !href.includes('/discover')) {
        if (!unique.has(href)) {
          unique.set(href, text.replace(/\n+/g, ' '));
        }
      }
    });
    return Array.from(unique.entries()).map(([href, text]) => ({ href, text }));
  });

  console.log(`Found ${myGroups.length} joined groups:`, myGroups);

  // 3. Search Bangla Groups
  console.log('\nSearching Bangla history groups...');
  await page.goto('https://www.facebook.com/search/groups/?q=%E0%A6%87%E0%A6%A4%E0%A6%BF%E0%A6%B9%E0%A6%BE%E0%A6%B8', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // Click "Public groups" filter if visible
  const publicFilter = page.locator('span:has-text("Public groups"), div[role="radio"]:has-text("Public"), [aria-label*="Public groups"]').first();
  if (await publicFilter.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Clicking Public groups filter...');
    await publicFilter.click({ force: true });
    await page.waitForTimeout(4000);
  }
  await page.screenshot({ path: 'tools/fb_bn_groups_search.png' });

  const bnSearchResults = await page.evaluate(() => {
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
  console.log('Bangla search results:', bnSearchResults.slice(0, 10));

  await ctx.close();
  console.log('\nGroup exploration finished!');
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
