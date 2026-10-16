const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('tiktok.com'));

  console.log('Navigating to profile...');
  await p.goto('https://www.tiktok.com/@simplehistoryteller', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);

  console.log('Clicking Edit profile...');
  const editBtn = p.locator('button:has-text("Edit profile")').first();
  await editBtn.click();
  await p.waitForTimeout(2000);

  // Upload photo
  const avatarPath = path.resolve('banner_assets/history_mascot_02_torch_stone_arch_ruins.jpg');
  console.log('Uploading avatar:', avatarPath);
  await p.locator('input[type="file"]').first().setInputFiles(avatarPath);
  await p.waitForTimeout(2000);

  // Click Apply
  const applyBtn = p.locator('button:has-text("Apply")').first();
  if (await applyBtn.isVisible().catch(() => false)) {
    console.log('Clicking Apply...');
    await applyBtn.click();
    await p.waitForTimeout(2000);
  }

  // Type bio
  console.log('Setting Bio...');
  const bioInput = p.locator('textarea').first();
  await bioInput.click();
  await p.keyboard.press('Control+A');
  await p.keyboard.press('Backspace');
  await p.keyboard.type('🏛️ History animated! ⏰ New ep every 2 days! 📺 YouTube: Simple History Teller', { delay: 10 });
  await p.waitForTimeout(1000);

  // Click Save
  console.log('Clicking Save...');
  const saveBtn = p.locator('button:has-text("Save")').first();
  await saveBtn.click();
  await p.waitForTimeout(5000);

  await p.screenshot({ path: 'tools/tiktok_saved_result.png' });
  console.log('Saved tools/tiktok_saved_result.png');

  // Reload and check
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: 'tools/tiktok_profile_live_final.png' });
  console.log('Saved tools/tiktok_profile_live_final.png');

  process.exit(0);
})();
