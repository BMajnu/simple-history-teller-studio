const { chromium } = require('playwright-core');

(async () => {
  console.log('=== INSTAGRAM COMPLETE REGISTRATION FLOW FOR CHANNEL 1 ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const igPage = await ctx.newPage();

  console.log('Navigating to Instagram Signup...');
  await igPage.goto('https://www.instagram.com/accounts/emailsignup/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await igPage.waitForTimeout(4000);

  const inputs = igPage.locator('input');
  console.log('Filling email: bmajnu980@gmail.com');
  await inputs.nth(0).fill('bmajnu980@gmail.com');
  await igPage.waitForTimeout(500);

  console.log('Filling password...');
  await inputs.nth(1).fill('***REMOVED***');
  await igPage.waitForTimeout(500);

  // Birthday Month
  console.log('Selecting Month...');
  const monthBox = igPage.locator('[aria-label="Select Month"]');
  await monthBox.click();
  await igPage.waitForTimeout(500);
  await igPage.locator('[role="option"]:has-text("January"), li:has-text("January"), div:has-text("January")').last().click().catch(() => {});
  await igPage.waitForTimeout(500);

  // Day
  console.log('Selecting Day...');
  const dayBox = igPage.locator('[aria-label="Select Day"]');
  await dayBox.click();
  await igPage.waitForTimeout(500);
  await igPage.locator('[role="option"]:has-text("15"), li:has-text("15"), div:has-text("15")').last().click().catch(() => {});
  await igPage.waitForTimeout(500);

  // Year
  console.log('Selecting Year...');
  const yearBox = igPage.locator('[aria-label="Select Year"]');
  await yearBox.click();
  await igPage.waitForTimeout(500);
  await igPage.locator('[role="option"]:has-text("1995"), li:has-text("1995"), div:has-text("1995")').last().click().catch(() => {});
  await igPage.waitForTimeout(500);

  // Full Name
  console.log('Filling Full Name...');
  await inputs.nth(2).fill('Simple History Teller');
  await igPage.waitForTimeout(500);

  // Username
  console.log('Filling Username...');
  await inputs.nth(3).fill('simplehistorytellerofficial');
  await igPage.waitForTimeout(1000);

  // Submit
  const submitBtn = igPage.locator('div[role="button"]:has-text("Submit"), button:has-text("Submit"), button:has-text("Sign up")').first();
  console.log('Clicking Submit on Instagram signup form...');
  await submitBtn.click();
  await igPage.waitForTimeout(6000);

  await igPage.screenshot({ path: 'tools/ig_step2_screen.png' });
  console.log('Saved tools/ig_step2_screen.png');

  // Wait 10s for new email
  console.log('Waiting 10s for Instagram confirmation code in Gmail...');
  await igPage.waitForTimeout(10000);

  // Open Gmail tab in parallel
  console.log('Fetching latest OTP from Gmail u/1...');
  const mailPage = await ctx.newPage();
  await mailPage.goto('https://mail.google.com/mail/u/1/#inbox', { waitUntil: 'domcontentloaded' });
  await mailPage.waitForTimeout(4000);

  const emailText = await mailPage.evaluate(() => {
    const row = document.querySelector('tr[role="row"], .zA');
    return row ? row.innerText : '';
  });
  console.log('Latest email subject/snippet:', emailText.replace(/\n/g, ' '));
  await mailPage.close();

  // Extract 6 digit code
  const match = emailText.match(/\b\d{6}\b/);
  if (match) {
    const otp = match[0];
    console.log(`Found Instagram OTP: ${otp}! Entering into Instagram code input...`);

    const codeInput = igPage.locator('input').first();
    await codeInput.fill(otp);
    await igPage.waitForTimeout(1000);
    await igPage.screenshot({ path: 'tools/ig_otp_entered.png' });

    const continueBtn = igPage.locator('button:has-text("Continue"), div[role="button"]:has-text("Continue"), button:has-text("Next")').first();
    console.log('Clicking Continue after entering OTP...');
    await continueBtn.click();
    await igPage.waitForTimeout(10000);

    console.log('Post-verification URL:', igPage.url());
    await igPage.screenshot({ path: 'tools/ig_post_verification.png' });
    console.log('Saved tools/ig_post_verification.png');
  } else {
    console.log('No 6-digit OTP found in latest email text!');
  }

  await igPage.close();
  process.exit(0);
})();
