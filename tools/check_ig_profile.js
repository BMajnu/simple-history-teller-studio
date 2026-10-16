const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

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

  await page.goto('https://www.instagram.com/simplehistorytellerofficial/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const shotPath = 'tools/ig_profile_after_part1.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);

  const snippet = await page.evaluate(() => document.body.innerText.slice(0, 500)).catch(() => '');
  console.log('Snippet:\n', snippet.replace(/\n+/g, ' '));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
