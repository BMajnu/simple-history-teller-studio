const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  console.log('=== UPDATING TIKTOK PROFILE ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const pages = ctx.pages();
  let ttPage = pages.find(p => p.url().includes('tiktok.com'));
  if (!ttPage) {
    ttPage = await ctx.newPage();
  }

  await ttPage.goto('https://www.tiktok.com/@simplehistoryteller', { waitUntil: 'domcontentloaded' });
  await ttPage.waitForTimeout(4000);

  await ttPage.screenshot({ path: 'tools/tiktok_profile_page.png' });
  console.log('Saved tools/tiktok_profile_page.png. URL:', ttPage.url());

  // Check for "Edit profile" button
  const editProfileBtn = ttPage.locator('button:has-text("Edit profile"), div[role="button"]:has-text("Edit profile")').first();
  const hasEditBtn = await editProfileBtn.isVisible().catch(() => false);
  console.log('Edit profile button visible:', hasEditBtn);

  if (hasEditBtn) {
    await editProfileBtn.click();
    await ttPage.waitForTimeout(2000);
    await ttPage.screenshot({ path: 'tools/tiktok_edit_profile_modal.png' });
    console.log('Saved tools/tiktok_edit_profile_modal.png');

    // Inspect inputs inside modal
    const modalInputs = await ttPage.evaluate(() => {
      return Array.from(document.querySelectorAll('input, textarea')).map(el => ({
        placeholder: el.placeholder,
        value: el.value,
        name: el.name
      }));
    });
    console.log('Modal inputs:', modalInputs);

    // Look for file input for avatar
    const avatarInput = ttPage.locator('input[type="file"]').first();
    const avatarPath = path.resolve('d:/Developing Projects/Itihash Explainer Video/banner_assets/history_mascot_02_torch_stone_arch_ruins.jpg');
    if (await avatarInput.count() > 0) {
      console.log('Setting avatar file...');
      await avatarInput.setInputFiles(avatarPath);
      await ttPage.waitForTimeout(2000);
      // Check if crop/apply button appears
      const applyBtn = ttPage.locator('button:has-text("Apply"), button:has-text("Save")').first();
      if (await applyBtn.isVisible().catch(() => false)) {
        await applyBtn.click();
        await ttPage.waitForTimeout(2000);
      }
    }

    // Set Name: Simple History Teller
    const nameInput = ttPage.locator('input[placeholder*="Name"]').first();
    if (await nameInput.isVisible().catch(() => false)) {
      console.log('Setting Name...');
      await nameInput.click();
      await ttPage.keyboard.press('Control+A');
      await ttPage.keyboard.press('Backspace');
      await ttPage.keyboard.type('Simple History Teller', { delay: 30 });
    }

    // Set Bio
    const bioInput = ttPage.locator('textarea[placeholder*="Bio"]').first();
    if (await bioInput.isVisible().catch(() => false)) {
      console.log('Setting Bio...');
      await bioInput.click();
      await ttPage.keyboard.press('Control+A');
      await ttPage.keyboard.press('Backspace');
      await ttPage.keyboard.type('🏛️ Unraveling history through animation!\n⏰ New Episode every 2 days\n📺 YouTube: @SimpleHistoryTellerOfficial', { delay: 20 });
    }

    // Save
    const saveBtn = ttPage.locator('button:has-text("Save")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      console.log('Clicking Save...');
      await saveBtn.click();
      await ttPage.waitForTimeout(4000);
    }

    await ttPage.screenshot({ path: 'tools/tiktok_profile_saved.png' });
    console.log('Saved tools/tiktok_profile_saved.png');
  }

  process.exit(0);
})();
