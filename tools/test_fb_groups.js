const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

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

  // Navigate to Facebook
  await page.goto('https://www.facebook.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // Check if we need to switch back to personal profile
  const profileBtn = page.locator('div[aria-label*="Your profile"], div[role="button"][aria-label*="profile"]').first();
  console.log('Checking profile context...');
  
  // Try switching to personal profile if switched to a page
  const switchBackBtn = page.locator('div[aria-label*="Switch to Badiuzzaman Majnu"], div[role="button"]:has-text("Switch to Badiuzzaman")').first();
  if (await switchBackBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Clicking Switch back to Badiuzzaman Majnu...');
    await switchBackBtn.click({ force: true });
    await page.waitForTimeout(6000);
  }

  // Navigate to Your Groups
  console.log('Navigating to https://www.facebook.com/groups/joins/ ...');
  await page.goto('https://www.facebook.com/groups/joins/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'tools/fb_groups_joins.png' });
  console.log('Saved tools/fb_groups_joins.png');

  // Extract joined groups if any
  const groupLinks = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href*="/groups/"]'));
    return anchors.map(a => ({
      text: a.innerText.trim(),
      href: a.href
    })).filter(g => g.text.length > 2 && !g.href.includes('/feed') && !g.href.includes('/joins') && !g.href.includes('/discover'));
  });
  console.log('Joined groups found:', groupLinks.slice(0, 15));

  // Search for Bangla history groups
  console.log('\nSearching for Bangla history groups...');
  await page.goto('https://www.facebook.com/search/groups/?q=%E0%A6%87%E0%A6%A4%E0%A6%BF%E0%A6%B9%E0%A6%BE%E0%A6%B8', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tools/fb_groups_search_bn.png' });
  console.log('Saved tools/fb_groups_search_bn.png');

  // Search for English history groups
  console.log('\nSearching for English world history groups...');
  await page.goto('https://www.facebook.com/search/groups/?q=ancient%20world%20history', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tools/fb_groups_search_en.png' });
  console.log('Saved tools/fb_groups_search_en.png');

  // Search for Hindi history groups
  console.log('\nSearching for Hindi history groups...');
  await page.goto('https://www.facebook.com/search/groups/?q=%E0%A4%87%E0%A4%A4%E0%A4%BF%E0%A4%B9%E0%A4%BE%E0%A4%B8', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tools/fb_groups_search_hi.png' });
  console.log('Saved tools/fb_groups_search_hi.png');

  await ctx.close();
  console.log('Done exploring groups!');
  process.exit(0);
})().catch(err => {
  console.error('Error exploring groups:', err);
  process.exit(1);
});
