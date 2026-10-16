const { chromium } = require('playwright-core');
const fs = require('fs');

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
  await page.waitForTimeout(4000);

  // If initial FB button
  const fbBtn = page.locator('button:has-text("Continue with Facebook"), div[role="button"]:has-text("Continue with Facebook")').first();
  if (await fbBtn.isVisible().catch(() => false)) {
    console.log('Clicking "Continue with Facebook"...');
    await fbBtn.click();
    await page.waitForTimeout(4000);
  }

  // If Switch profile button
  const switchBtn = page.locator('button:has-text("Continue as Badiuzzaman Majnu"), div[role="button"]:has-text("Continue as Badiuzzaman Majnu")').first();
  if (await switchBtn.isVisible().catch(() => false)) {
    console.log('Clicking "Continue as Badiuzzaman Majnu"...');
    await switchBtn.click();
    await page.waitForTimeout(4000);
  }

  // Now click "Continue as Badiuzzaman" (the oauth confirm button)
  const oauthBtn = page.locator('button:has-text("Continue as Badiuzzaman"), div[role="button"]:has-text("Continue as Badiuzzaman")').first();
  if (await oauthBtn.isVisible().catch(() => false)) {
    console.log('Clicking "Continue as Badiuzzaman" OAuth button...');
    await oauthBtn.click();
    console.log('Waiting 15s for Instagram redirect and login...');
    await page.waitForTimeout(15000);
  } else {
    console.log('OAuth button not found directly, checking text...');
  }

  console.log('Current URL after OAuth:', page.url());
  await page.screenshot({ path: 'tools/ig_post_oauth.png' });

  const snippet = await page.evaluate(() => document.body.innerText.slice(0, 500)).catch(() => '');
  console.log('Snippet:\n', snippet.replace(/\n+/g, ' '));

  await page.waitForTimeout(3000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
