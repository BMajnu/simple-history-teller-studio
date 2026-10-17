const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

(async () => {
  console.log('=== CHECKING CURRENT FACEBOOK PAGES & PROFILE ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  // 1. Check Personal Profile
  console.log('Navigating to personal profile...');
  await page.goto('https://www.facebook.com/me', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  console.log('Personal profile URL:', page.url());
  const meShot = path.join(ARTIFACT_DIR, 'fb_me_profile.png');
  await page.screenshot({ path: meShot });
  console.log('Saved:', meShot);

  // 2. Check Pages List
  console.log('Navigating to Pages list...');
  await page.goto('https://www.facebook.com/pages/?category=your_pages', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const pagesShot = path.join(ARTIFACT_DIR, 'fb_your_pages.png');
  await page.screenshot({ path: pagesShot });
  console.log('Saved:', pagesShot);

  const pageTexts = await page.evaluate(() => {
    return document.body.innerText.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 50);
  });
  console.log('Page text snippets:', pageTexts.slice(0, 25));

  await ctx.close();
  console.log('Done.');
})().catch(console.error);
