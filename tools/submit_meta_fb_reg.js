const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();

  const regUrl = 'https://www.facebook.com/reg/?entry_point=login&next=https%3A%2F%2Fwww.facebook.com%2Fdialog%2Foauth%3Fapp_id%3D1217981644879628%26redirect_uri%3Dhttps%253A%252F%252Fwww.facebook.com%252Ffxauth%252F';
  await p.goto(regUrl, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);

  // 1. First name
  const textInputs = p.locator('input[type="text"]');
  await textInputs.nth(0).fill('Badiuzzaman');
  await p.waitForTimeout(300);

  // 2. Surname
  await textInputs.nth(1).fill('Majnu');
  await p.waitForTimeout(300);

  // 3. Day
  console.log('Selecting Day...');
  await p.locator('div[aria-label="Select day"]').click();
  await p.waitForTimeout(500);
  await p.locator('div[role="option"]:has-text("1"), span:text-is("1")').first().click();
  await p.waitForTimeout(500);

  // 4. Month
  console.log('Selecting Month...');
  await p.locator('div[aria-label="Select month"]').click();
  await p.waitForTimeout(500);
  await p.locator('div[role="option"]:has-text("Jan"), span:has-text("Jan")').first().click();
  await p.waitForTimeout(500);

  // 5. Year
  console.log('Selecting Year...');
  await p.locator('div[aria-label="Select year"]').click();
  await p.waitForTimeout(500);
  const yearOpt = p.locator('div[role="option"]:has-text("1995"), span:text-is("1995")').first();
  await yearOpt.scrollIntoViewIfNeeded();
  await yearOpt.click();
  await p.waitForTimeout(500);

  // 6. Gender
  console.log('Selecting Gender...');
  await p.locator('div[role="combobox"]:has-text("Select your gender")').click();
  await p.waitForTimeout(500);
  await p.locator('div[role="option"]:has-text("Male"), span:text-is("Male")').first().click();
  await p.waitForTimeout(500);

  // 7. Email
  console.log('Filling Email: bmajnu980@gmail.com...');
  await textInputs.nth(2).fill('bmajnu980@gmail.com');
  await p.waitForTimeout(300);

  // 8. Password
  console.log('Filling Password: ***REMOVED***...');
  await p.locator('input[type="password"]').first().fill('***REMOVED***');
  await p.waitForTimeout(500);

  await p.screenshot({ path: 'tools/fb_reg_filled.png' });
  console.log('Saved tools/fb_reg_filled.png');

  // 9. Click Submit
  console.log('Clicking Submit...');
  const submitBtn = p.locator('div[role="button"]:has-text("Submit")').first();
  await submitBtn.click();
  await p.waitForTimeout(8000);

  await p.screenshot({ path: 'tools/fb_reg_after_submit.png' });
  console.log('Saved tools/fb_reg_after_submit.png. URL now:', p.url());

  const afterText = await p.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('After submit text:', afterText);

  // keep page open
  process.exit(0);
})();
