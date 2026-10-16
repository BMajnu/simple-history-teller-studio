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

  console.log('Navigating to login page...');
  await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'tools/ig_login_screen.png' });

  // Check if "Log in with Facebook" is present
  const fbLoginBtn = page.locator('button:has-text("Log in with Facebook"), span:has-text("Log in with Facebook")').first();
  const userInput = page.locator('input[name="username"], input[aria-label*="username"]').first();

  console.log('FB login btn visible:', await fbLoginBtn.isVisible().catch(() => false));
  console.log('User input visible:', await userInput.isVisible().catch(() => false));

  if (await fbLoginBtn.isVisible().catch(() => false)) {
    console.log('Trying Log in with Facebook...');
    await fbLoginBtn.click();
    await page.waitForTimeout(8000);
    console.log('URL after FB login click:', page.url());
    await page.screenshot({ path: 'tools/ig_after_fb_login_click.png' });
  }

  // Check if now logged in
  if (page.url().includes('instagram.com') && !page.url().includes('login') && !page.url().includes('accounts')) {
    console.log('LOGGED IN SUCCESSFULLY VIA FACEBOOK!');
  } else {
    // If not logged in, let's try direct username/password
    console.log('Trying direct credentials login...');
    const uInp = page.locator('input[name="username"]').first();
    const pInp = page.locator('input[name="password"]').first();
    if (await uInp.isVisible().catch(() => false)) {
      await uInp.fill('simplehistorytellerofficial');
      await page.waitForTimeout(500);
      await pInp.fill('***REMOVED***');
      await page.waitForTimeout(500);
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      console.log('Submitted credentials, waiting 10s...');
      await page.waitForTimeout(10000);
      console.log('URL after direct login:', page.url());
      await page.screenshot({ path: 'tools/ig_after_cred_submit.png' });
    }
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
