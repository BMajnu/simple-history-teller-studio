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
  
  // Go to the switch prompt or instagram login
  await page.goto('https://www.instagram.com/simplehistorytellerofficial/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const fbBtn = page.locator('button:has-text("Continue with Facebook"), div[role="button"]:has-text("Continue with Facebook")').first();
  if (await fbBtn.isVisible().catch(() => false)) {
    console.log('Clicking "Continue with Facebook"...');
    await fbBtn.click();
    await page.waitForTimeout(5000);
  }

  // Check for "Continue as Badiuzzaman Majnu"
  const switchBtn = page.locator('button:has-text("Continue as Badiuzzaman Majnu"), div[role="button"]:has-text("Continue as Badiuzzaman Majnu"), a:has-text("Continue as Badiuzzaman Majnu")').first();
  if (await switchBtn.isVisible().catch(() => false)) {
    console.log('Clicking "Continue as Badiuzzaman Majnu"...');
    await switchBtn.click();
    console.log('Waiting 12s for Instagram redirect...');
    await page.waitForTimeout(12000);
  } else {
    console.log('Switch button not found, looking for any Continue button...');
    const anyCont = page.locator('button:has-text("Continue"), div[role="button"]:has-text("Continue")').first();
    if (await anyCont.isVisible().catch(() => false)) {
      await anyCont.click();
      await page.waitForTimeout(10000);
    }
  }

  console.log('Final URL:', page.url());
  await page.screenshot({ path: 'tools/ig_authorized_view.png' });

  const snippet = await page.evaluate(() => document.body.innerText.slice(0, 500)).catch(() => '');
  console.log('Snippet:\n', snippet.replace(/\n+/g, ' '));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
