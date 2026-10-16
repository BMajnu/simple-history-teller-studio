const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to Instagram Signup...');
  await page.goto('https://www.instagram.com/accounts/emailsignup/', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(4000);

  // Fill email
  const inputs = page.locator('input');
  console.log('Filling email: bmajnu980@gmail.com');
  await inputs.nth(0).fill('bmajnu980@gmail.com');
  await page.waitForTimeout(500);

  // Fill password
  console.log('Filling password...');
  await inputs.nth(1).fill('***REMOVED***');
  await page.waitForTimeout(500);

  // Select Birthday Month
  console.log('Selecting Month...');
  const monthBox = page.locator('[aria-label="Select Month"]');
  await monthBox.click();
  await page.waitForTimeout(500);
  await page.locator('[role="option"]:has-text("January"), li:has-text("January"), div:has-text("January")').last().click().catch(() => {});
  await page.waitForTimeout(500);

  // Select Day
  console.log('Selecting Day...');
  const dayBox = page.locator('[aria-label="Select Day"]');
  await dayBox.click();
  await page.waitForTimeout(500);
  await page.locator('[role="option"]:has-text("15"), li:has-text("15"), div:has-text("15")').last().click().catch(() => {});
  await page.waitForTimeout(500);

  // Select Year
  console.log('Selecting Year...');
  const yearBox = page.locator('[aria-label="Select Year"]');
  await yearBox.click();
  await page.waitForTimeout(500);
  await page.locator('[role="option"]:has-text("1995"), li:has-text("1995"), div:has-text("1995")').last().click().catch(() => {});
  await page.waitForTimeout(500);

  // Fill Name
  console.log('Filling Full Name...');
  await inputs.nth(2).fill('Simple History Teller');
  await page.waitForTimeout(500);

  // Fill Username
  console.log('Filling Username...');
  await inputs.nth(3).fill('simplehistorytellerofficial');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'tools/ig_form_filled.png' });
  console.log('Saved tools/ig_form_filled.png');

  // Click Submit
  const submitBtn = page.locator('div[role="button"]:has-text("Submit"), button:has-text("Submit"), button:has-text("Sign up")').first();
  console.log('Clicking Submit...');
  await submitBtn.click();
  await page.waitForTimeout(6000);

  console.log('After submit URL:', page.url());
  await page.screenshot({ path: 'tools/ig_after_submit.png' });
  console.log('Saved tools/ig_after_submit.png');

  await page.close();
  process.exit(0);
})();
