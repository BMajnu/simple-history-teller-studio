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

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const mainCtx = browser.contexts()[0];
  const incognitoCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
  });

  const page = await incognitoCtx.newPage();
  await page.goto('https://www.tiktok.com/login/phone-or-email/email', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Fill Email & Password
  console.log('Filling credentials...');
  const userField = page.locator('input[placeholder*="Email or username"], input[name="username"]').first();
  await userField.click();
  await page.keyboard.type('bmajnu981@gmail.com', { delay: 40 });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(300);

  const pwdField = page.locator('input[placeholder*="Password"], input[type="password"]').first();
  await pwdField.click();
  await page.keyboard.type('***REMOVED***', { delay: 40 });
  await page.waitForTimeout(500);

  // Click Log in
  console.log('Clicking Log in...');
  const loginBtn = page.locator('button:has-text("Log in"), button[type="submit"]').first();
  await loginBtn.click();
  await page.waitForTimeout(4000);

  // Click Email verification option if modal appears
  const emailVerifyOption = page.locator('div:has-text("b***1@gmail.com"), div[class*="Verify"]:has-text("Email")').last();
  if (await emailVerifyOption.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking Email verify option...');
    await emailVerifyOption.click();
    await page.waitForTimeout(5000);

    // Fetch code from Gmail slot 4
    const code = await getTikTokCodeFromSlot(mainCtx, 4);
    if (code) {
      console.log(`Entering code ${code}...`);
      const codeInput = page.locator('input[placeholder*="6-digit"], input[type="text"]').last();
      await codeInput.click();
      await page.keyboard.type(code, { delay: 50 });
      await page.waitForTimeout(2000);

      const submitBtn = page.locator('button:has-text("Verify"), button:has-text("Next"), button[type="submit"]').first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        await page.waitForTimeout(5000);
      }
    }
  }

  await page.screenshot({ path: 'tools/tiktok_bn_after_verify.png' });
  console.log('Saved tools/tiktok_bn_after_verify.png. URL:', page.url());

  // Navigate to profile
  console.log('Navigating to profile...');
  await page.goto('https://www.tiktok.com/@simplehistorytellerbn', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click Edit profile
  const editBtn = page.locator('button:has-text("Edit profile"), div[role="button"]:has-text("Edit profile")').first();
  if (await editBtn.isVisible().catch(() => false)) {
    console.log('Clicking Edit profile...');
    await editBtn.click();
    await page.waitForTimeout(2000);

    // Avatar
    const avatarPath = path.resolve('banner_assets/history_mascot_02_torch_stone_arch_ruins.jpg');
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      console.log('Uploading avatar...');
      await fileInput.setInputFiles(avatarPath);
      await page.waitForTimeout(3000);

      const applyBtn = page.locator('button:has-text("Apply")').first();
      if (await applyBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
        await applyBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    // Name
    const inputs = await page.locator('input').all();
    for (const inp of inputs) {
      const val = await inp.inputValue().catch(() => '');
      if (val === 'simplehistorytellerbn') {
        console.log('Setting Name...');
        await inp.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.type('Simple History Teller Bangla', { delay: 30 });
        break;
      }
    }

    // Bio
    const bioField = page.locator('textarea').first();
    if (await bioField.isVisible().catch(() => false)) {
      console.log('Setting Bio...');
      await bioField.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('🏛️ অ্যানিমেটেড ইতিহাস! ⏰ প্রতি ২ দিনে পর্ব 📺 YouTube: Simple History Teller Bangla', { delay: 20 });
      await page.waitForTimeout(500);
    }

    // Save
    const saveBtn = page.locator('button:has-text("Save")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      console.log('Saving profile...');
      await saveBtn.click();
      await page.waitForTimeout(4000);
    }
  }

  await page.goto('https://www.tiktok.com/@simplehistorytellerbn', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'tools/tiktok_bn_profile_final_live.png' });
  console.log('Saved tools/tiktok_bn_profile_final_live.png');

  const fs = require('fs');
  fs.copyFileSync('tools/tiktok_bn_profile_final_live.png', 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/tiktok_profile_c2_live.png');
  console.log('Artifact updated: tiktok_profile_c2_live.png');

  process.exit(0);
})();
