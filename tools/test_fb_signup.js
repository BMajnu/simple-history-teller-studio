const { chromium } = require('playwright-core');

(async () => {
  console.log('=== FACEBOOK SIGNUP FOR B MAJNU ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const createBtn = page.locator('a:has-text("Create new account"), button:has-text("Create new account")').first();
  await createBtn.click();
  await page.waitForTimeout(3000);

  // First name & Surname
  const inputs = page.locator('input');
  console.log('Filling Name: B Majnu...');
  const firstName = page.locator('input[placeholder*="First name"], [aria-label*="First name"]').first();
  const surname = page.locator('input[placeholder*="Surname"], [aria-label*="Surname"]').first();

  if (await firstName.count() > 0) {
    await firstName.fill('B');
    await surname.fill('Majnu');
  } else {
    await inputs.nth(0).fill('B');
    await inputs.nth(1).fill('Majnu');
  }
  await page.waitForTimeout(500);

  // Date of birth
  console.log('Selecting DOB...');
  const dayBox = page.locator('[aria-label*="Day"], select[name="birthday_day"]').first();
  const monthBox = page.locator('[aria-label*="Month"], select[name="birthday_month"]').first();
  const yearBox = page.locator('[aria-label*="Year"], select[name="birthday_year"]').first();

  if (await dayBox.count() > 0) {
    await dayBox.click();
    await page.locator('[role="option"]:has-text("15"), option:has-text("15")').first().click().catch(() => {});
  }
  if (await monthBox.count() > 0) {
    await monthBox.click();
    await page.locator('[role="option"]:has-text("Jan"), option:has-text("Jan")').first().click().catch(() => {});
  }
  if (await yearBox.count() > 0) {
    await yearBox.click();
    await page.locator('[role="option"]:has-text("1995"), option:has-text("1995")').first().click().catch(() => {});
  }

  // Gender
  console.log('Selecting Gender...');
  const genderBox = page.locator('[aria-label*="Gender"], select[name="sex"], div:has-text("Select your gender")').first();
  if (await genderBox.count() > 0) {
    await genderBox.click();
    await page.locator('[role="option"]:has-text("Male"), option:has-text("Male"), label:has-text("Male")').first().click().catch(() => {});
  }

  // Email
  console.log('Filling Email: bmajnu980@gmail.com...');
  const emailInput = page.locator('input[placeholder*="Mobile number or email"], [aria-label*="Mobile number or email"]').first();
  if (await emailInput.count() > 0) {
    await emailInput.fill('bmajnu980@gmail.com');
  }

  // Password
  console.log('Filling Password...');
  const passInput = page.locator('input[placeholder*="Password"], [aria-label*="Password"], input[type="password"]').first();
  if (await passInput.count() > 0) {
    await passInput.fill('***REMOVED***');
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'tools/fb_signup_filled.png' });
  console.log('Saved tools/fb_signup_filled.png');

  // Submit button
  const submitBtn = page.locator('button:has-text("Submit"), div[role="button"]:has-text("Submit"), button[name="websubmit"]').first();
  if (await submitBtn.isVisible().catch(() => false)) {
    console.log('Clicking Submit on Facebook signup...');
    await submitBtn.click();
    await page.waitForTimeout(6000);
  }

  console.log('URL after Facebook submit:', page.url());
  await page.screenshot({ path: 'tools/fb_after_signup_submit.png' });
  console.log('Saved tools/fb_after_signup_submit.png');

  await page.close();
  process.exit(0);
})();
