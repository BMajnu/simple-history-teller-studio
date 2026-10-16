const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  console.log('=== LOGGING IN & BRANDING TIKTOK BANGLA ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const incognitoCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
  });

  const page = await incognitoCtx.newPage();
  await page.goto('https://www.tiktok.com/login/phone-or-email/email', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Fill Email & Password
  console.log('Typing login credentials for bmajnu981@gmail.com...');
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
  await page.waitForTimeout(6000);

  await page.screenshot({ path: 'tools/tiktok_bn_after_login.png' });
  console.log('Saved tools/tiktok_bn_after_login.png. URL:', page.url());

  // Go to profile
  await page.goto('https://www.tiktok.com/@simplehistorytellerbn', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'tools/tiktok_bn_profile_view.png' });
  console.log('Saved tools/tiktok_bn_profile_view.png');

  // Find Edit Profile button
  const editBtn = page.locator('button:has-text("Edit profile"), div[role="button"]:has-text("Edit profile")').first();
  if (await editBtn.isVisible().catch(() => false)) {
    console.log('Clicking Edit Profile...');
    await editBtn.click();
    await page.waitForTimeout(2000);

    // Mascot Avatar
    const avatarPath = path.resolve('banner_assets/history_mascot_02_torch_stone_arch_ruins.jpg');
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      console.log('Uploading mascot avatar...');
      await fileInput.setInputFiles(avatarPath);
      await page.waitForTimeout(3000);

      const applyBtn = page.locator('button:has-text("Apply")').first();
      if (await applyBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
        await applyBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    // Name input
    const inputs = await page.locator('input').all();
    for (const inp of inputs) {
      const val = await inp.inputValue().catch(() => '');
      if (val === 'simplehistorytellerbn') {
        console.log('Updating Name to Simple History Teller Bangla...');
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
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tools/tiktok_bn_profile_branded.png' });
  console.log('Saved tools/tiktok_bn_profile_branded.png');

  // Copy to artifacts
  const fs = require('fs');
  fs.copyFileSync('tools/tiktok_bn_profile_branded.png', 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/tiktok_profile_c2_live.png');
  console.log('Copied to artifacts as tiktok_profile_c2_live.png');

  process.exit(0);
})();
