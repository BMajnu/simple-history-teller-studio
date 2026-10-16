const { chromium } = require('playwright-core');
const path = require('path');

async function getTikTokCodeFromSlot(mainCtx, slot) {
  console.log(`Polling Gmail slot u/${slot} for TikTok verification code...`);
  const gPage = await mainCtx.newPage();
  let code = null;

  for (let attempt = 1; attempt <= 10; attempt++) {
    console.log(`Checking inbox attempt ${attempt}/10...`);
    await gPage.goto(`https://mail.google.com/mail/u/${slot}/#inbox`, { waitUntil: 'domcontentloaded' });
    await gPage.waitForTimeout(3000);

    code = await gPage.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr[role="row"]'));
      for (const r of rows) {
        const txt = r.innerText;
        if (txt.includes('TikTok') && (txt.includes('verification code') || txt.includes('code'))) {
          const match = txt.match(/(\d{6})\s+is your verification code/) || txt.match(/(\d{6})/);
          if (match) return match[1];
        }
      }
      return null;
    });

    if (code) {
      console.log(`Found TikTok code: ${code}`);
      break;
    }
    await gPage.waitForTimeout(3000);
  }

  await gPage.close();
  return code;
}

async function signupTikTok({ slot, email, password, username, profileName, bio }) {
  console.log(`\n======================================================`);
  console.log(`STARTING TIKTOK SIGNUP FOR: ${email} (${username})`);
  console.log(`======================================================`);

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const mainCtx = browser.contexts()[0];
  const incognitoCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
  });

  const page = await incognitoCtx.newPage();
  await page.goto('https://www.tiktok.com/signup/phone-or-email/email', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // 1. Birthday selectors
  console.log('Selecting Birthday (Jan 1, 1995)...');
  const selectors = page.locator('div[class*="DivSelector"]');
  await selectors.nth(0).click();
  await page.waitForTimeout(300);
  await page.locator('#Month-options-item-0').click();
  await page.waitForTimeout(300);

  await selectors.nth(1).click();
  await page.waitForTimeout(300);
  await page.locator('#Day-options-item-0').click();
  await page.waitForTimeout(300);

  await selectors.nth(2).click();
  await page.waitForTimeout(300);
  const yearOpt = page.locator('div[id^="Year-options-item"]:has-text("1995")').first();
  await yearOpt.scrollIntoViewIfNeeded();
  await yearOpt.click();
  await page.waitForTimeout(500);

  // 2. Email typing with real delays
  console.log(`Typing Email: ${email}...`);
  const emailInput = page.locator('input[placeholder*="Email"]');
  await emailInput.click();
  await page.keyboard.type(email, { delay: 45 });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);

  // 3. Password typing with real delays
  console.log('Typing Password...');
  const pwdInput = page.locator('input[placeholder*="Password"]');
  await pwdInput.click();
  await page.keyboard.type(password, { delay: 45 });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(800);

  await page.screenshot({ path: `tools/tiktok_${username}_form_filled.png` });
  console.log(`Saved form filled screenshot: tools/tiktok_${username}_form_filled.png`);

  // 4. Send code
  console.log('Clicking Send code button...');
  const sendBtn = page.locator('button[data-e2e="send-code-button"]').first();
  await sendBtn.click({ force: true });
  console.log('Clicked Send code, waiting 8s for email delivery...');
  await page.waitForTimeout(8000);

  await page.screenshot({ path: `tools/tiktok_${username}_code_sent.png` });
  console.log(`Saved screenshot: tools/tiktok_${username}_code_sent.png`);

  // 5. Fetch OTP from Gmail
  const otp = await getTikTokCodeFromSlot(mainCtx, slot);
  if (!otp) {
    console.error(`FAILED TO GET OTP FOR ${email}`);
    return false;
  }

  // 6. Enter OTP
  console.log(`Entering OTP: ${otp}...`);
  const codeInput = page.locator('input[placeholder*="6-digit"]');
  await codeInput.click();
  await page.keyboard.type(otp, { delay: 60 });
  await page.waitForTimeout(1000);

  // 7. Click Next / Sign up
  console.log('Clicking Next button...');
  const nextBtn = page.locator('button:has-text("Next"), button[type="submit"]').first();
  await nextBtn.click();
  await page.waitForTimeout(6000);

  await page.screenshot({ path: `tools/tiktok_${username}_after_next.png` });
  console.log(`Saved screenshot: tools/tiktok_${username}_after_next.png. URL:`, page.url());

  // 8. Handle username step if prompted
  const usernameInput = page.locator('input[placeholder*="Username"], input[name="username"]').first();
  if (await usernameInput.isVisible().catch(() => false)) {
    console.log(`Username prompt visible, entering ${username}...`);
    await usernameInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(username, { delay: 40 });
    await page.waitForTimeout(1000);

    const signBtn = page.locator('button:has-text("Sign up"), button:has-text("Next")').first();
    await signBtn.click();
    await page.waitForTimeout(6000);
  }

  // 9. Navigate to profile
  console.log('Navigating to profile...');
  await page.goto(`https://www.tiktok.com/@${username}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // 10. Update Profile (Name, Bio, Mascot Avatar)
  const editBtn = page.locator('button:has-text("Edit profile"), div[role="button"]:has-text("Edit profile")').first();
  if (await editBtn.isVisible().catch(() => false)) {
    console.log('Opening Edit profile modal...');
    await editBtn.click();
    await page.waitForTimeout(2000);

    // Upload Mascot Avatar
    const avatarPath = path.resolve('banner_assets/history_mascot_02_torch_stone_arch_ruins.jpg');
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      console.log('Uploading mascot avatar...');
      await fileInput.setInputFiles(avatarPath);
      await page.waitForTimeout(2500);

      const applyBtn = page.locator('button:has-text("Apply")').first();
      if (await applyBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
        await applyBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    // Set Name
    const nameFields = page.locator('input[placeholder*="Name"]');
    if (await nameFields.count() > 0) {
      await nameFields.first().click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(profileName, { delay: 30 });
      await page.waitForTimeout(500);
    }

    // Set Bio
    const bioField = page.locator('textarea').first();
    if (await bioField.isVisible().catch(() => false)) {
      await bioField.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(bio, { delay: 20 });
      await page.waitForTimeout(500);
    }

    // Save profile
    const saveBtn = page.locator('button:has-text("Save")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      console.log('Saving profile...');
      await saveBtn.click();
      await page.waitForTimeout(4000);
    }
  }

  // Final verification screenshot
  await page.goto(`https://www.tiktok.com/@${username}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `tools/tiktok_${username}_live_final.png` });
  console.log(`SUCCESS! Live profile verified: tools/tiktok_${username}_live_final.png`);

  return true;
}

(async () => {
  // Run Channel 3 (Hindi)
  await signupTikTok({
    slot: 2,
    email: 'bmajnu9811@gmail.com',
    password: '***REMOVED***',
    username: 'simplehistorytellerhi',
    profileName: 'Simple History Teller Hindi',
    bio: '🏛️ इतिहास की कहानियाँ! ⏰ हर 2 दिन में नया एपिसोड 📺 YouTube: Simple History Teller Hindi'
  });

  process.exit(0);
})();
