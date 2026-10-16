const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  console.log('=== UPDATING TIKTOK PROFILE CLEAN ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const pages = ctx.pages();
  let ttPage = pages.find(p => p.url().includes('tiktok.com/@simplehistoryteller'));
  if (!ttPage) {
    ttPage = pages.find(p => p.url().includes('tiktok.com'));
  }
  if (!ttPage) {
    ttPage = await ctx.newPage();
    await ttPage.goto('https://www.tiktok.com/@simplehistoryteller', { waitUntil: 'domcontentloaded' });
    await ttPage.waitForTimeout(3000);
  }

  // Check if Edit profile modal is already open, if not click Edit profile
  const modalOpen = await ttPage.locator('div:has-text("Edit profile")').first().isVisible().catch(() => false);
  const editBtn = ttPage.locator('button:has-text("Edit profile"), div[role="button"]:has-text("Edit profile")').first();
  if (await editBtn.isVisible().catch(() => false)) {
    console.log('Clicking Edit profile button...');
    await editBtn.click();
    await ttPage.waitForTimeout(2000);
  }

  // Upload Avatar
  const avatarPath = path.resolve('d:/Developing Projects/Itihash Explainer Video/banner_assets/history_mascot_02_torch_stone_arch_ruins.jpg');
  console.log('Uploading avatar from:', avatarPath);
  
  const fileInput = ttPage.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles(avatarPath);
    await ttPage.waitForTimeout(2000);
    console.log('Avatar file set. Looking for crop/apply modal...');
    await ttPage.screenshot({ path: 'tools/tiktok_avatar_uploaded.png' });
    
    // In TikTok, after uploading avatar, an "Apply" button or slider usually shows
    const applyBtn = ttPage.locator('button:has-text("Apply")').first();
    if (await applyBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Clicking Apply for avatar...');
      await applyBtn.click();
      await ttPage.waitForTimeout(2000);
    }
  }

  // Set Name
  const nameInput = ttPage.locator('input[placeholder*="Name"], input[value="simplehistoryteller"]').nth(1);
  // Let's find specifically the input below 'Name' label
  const allInputs = await ttPage.locator('input').all();
  for (const input of allInputs) {
    const val = await input.inputValue().catch(() => '');
    if (val === 'simplehistoryteller') {
      // Check if it's the Name field (second one)
      const placeholder = await input.getAttribute('placeholder').catch(() => '');
      console.log('Found input with value simplehistoryteller, placeholder:', placeholder);
      if (placeholder.includes('Name') || !placeholder) {
        // We will update the name
      }
    }
  }

  // Target Name input by evaluating
  await ttPage.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    for (const inp of inputs) {
      if (inp.placeholder === 'Name' || inp.getAttribute('placeholder')?.includes('Name')) {
        inp.focus();
        inp.select();
      }
    }
  });
  await ttPage.keyboard.press('Control+A');
  await ttPage.keyboard.press('Backspace');
  await ttPage.keyboard.type('Simple History Teller', { delay: 30 });
  await ttPage.waitForTimeout(500);

  // Set Bio (max 80 chars)
  const bioText = '🏛️ History animated! ⏰ New ep every 2 days! 📺 YouTube: Simple History Teller';
  console.log('Bio length:', bioText.length);
  const bioTextarea = ttPage.locator('textarea').first();
  await bioTextarea.click();
  await ttPage.keyboard.press('Control+A');
  await ttPage.keyboard.press('Backspace');
  await ttPage.keyboard.type(bioText, { delay: 20 });
  await ttPage.waitForTimeout(500);

  await ttPage.screenshot({ path: 'tools/tiktok_edit_modal_filled.png' });
  console.log('Saved tools/tiktok_edit_modal_filled.png');

  // Click Save
  const saveBtn = ttPage.locator('button:has-text("Save")').first();
  if (await saveBtn.isEnabled().catch(() => false)) {
    console.log('Clicking Save button...');
    await saveBtn.click();
    await ttPage.waitForTimeout(4000);
  }

  await ttPage.screenshot({ path: 'tools/tiktok_profile_final.png' });
  console.log('Saved tools/tiktok_profile_final.png');

  process.exit(0);
})();
