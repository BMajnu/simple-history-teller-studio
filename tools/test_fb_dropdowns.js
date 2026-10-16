const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();

  const regUrl = 'https://www.facebook.com/reg/?entry_point=login&next=https%3A%2F%2Fwww.facebook.com%2Fdialog%2Foauth%3Fapp_id%3D1217981644879628%26redirect_uri%3Dhttps%253A%252F%252Fwww.facebook.com%252Ffxauth%252F';
  await p.goto(regUrl, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);

  // 1. First name & Surname
  const textInputs = p.locator('input[type="text"]');
  await textInputs.nth(0).fill('Badiuzzaman');
  await textInputs.nth(1).fill('Majnu');

  // 2. Day -> select "1"
  console.log('Selecting Day...');
  await p.locator('div[aria-label="Select day"]').click();
  await p.waitForTimeout(400);
  await p.evaluate(() => {
    const opts = Array.from(document.querySelectorAll('[role="listbox"] [role="option"]'));
    const target = opts.find(o => o.innerText.trim() === '1');
    if (target) target.click();
  });
  await p.waitForTimeout(400);

  // 3. Month -> select "January"
  console.log('Selecting Month...');
  await p.locator('div[aria-label="Select month"]').click();
  await p.waitForTimeout(400);
  await p.evaluate(() => {
    const opts = Array.from(document.querySelectorAll('[role="listbox"] [role="option"]'));
    const target = opts.find(o => o.innerText.trim() === 'January' || o.innerText.trim().startsWith('Jan'));
    if (target) target.click();
  });
  await p.waitForTimeout(400);

  // 4. Year -> select "1995"
  console.log('Selecting Year...');
  await p.locator('div[aria-label="Select year"]').click();
  await p.waitForTimeout(400);
  await p.evaluate(() => {
    const opts = Array.from(document.querySelectorAll('[role="listbox"] [role="option"]'));
    const target = opts.find(o => o.innerText.trim() === '1995');
    if (target) {
      target.scrollIntoView();
      target.click();
    }
  });
  await p.waitForTimeout(400);

  // 5. Gender -> select "Male"
  console.log('Selecting Gender...');
  await p.locator('div[role="combobox"]:has-text("Select your gender")').click();
  await p.waitForTimeout(400);
  await p.evaluate(() => {
    const opts = Array.from(document.querySelectorAll('[role="listbox"] [role="option"]'));
    const target = opts.find(o => o.innerText.trim() === 'Male');
    if (target) target.click();
  });
  await p.waitForTimeout(400);

  // 6. Email
  console.log('Filling Email: bmajnu980@gmail.com...');
  await textInputs.nth(2).fill('bmajnu980@gmail.com');
  await p.waitForTimeout(300);

  // 7. Password
  console.log('Filling Password: ***REMOVED***...');
  await p.locator('input[type="password"]').first().fill('***REMOVED***');
  await p.waitForTimeout(500);

  await p.screenshot({ path: 'tools/fb_reg_ready.png' });
  console.log('Saved tools/fb_reg_ready.png');

  // 8. Submit
  console.log('Clicking Submit button...');
  const submitBtn = p.locator('div[role="button"]:has-text("Submit")').first();
  await submitBtn.click();
  await p.waitForTimeout(8000);

  await p.screenshot({ path: 'tools/fb_reg_submitted_screen.png' });
  console.log('Saved tools/fb_reg_submitted_screen.png. URL now:', p.url());

  const postText = await p.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('Post text:', postText);

  // Keep page open for OTP check
  process.exit(0);
})();
