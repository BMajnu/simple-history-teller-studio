const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('tiktok.com'));

  // 1. Inspect file inputs
  const fileInputs = await p.locator('input[type="file"]').count();
  console.log('File inputs count:', fileInputs);

  const avatarPath = path.resolve('d:/Developing Projects/Itihash Explainer Video/banner_assets/history_mascot_02_torch_stone_arch_ruins.jpg');
  if (fileInputs > 0) {
    console.log('Setting file on input[type="file"]...');
    await p.locator('input[type="file"]').first().setInputFiles(avatarPath);
    await p.waitForTimeout(3000);
    await p.screenshot({ path: 'tools/tiktok_avatar_crop_step.png' });
    console.log('Saved tools/tiktok_avatar_crop_step.png');

    // Check if crop modal opened and has an Apply button
    const applyBtn = p.locator('button:has-text("Apply")').first();
    if (await applyBtn.isVisible().catch(() => false)) {
      console.log('Clicking Apply for avatar crop...');
      await applyBtn.click();
      await p.waitForTimeout(2000);
    }
  }

  // 2. Name input
  // Inside the modal, the input with value 'simplehistoryteller' under 'Name'
  console.log('Setting Name...');
  const nameInput = p.locator('div[class*="Modal"] input, div[id="tux-portal-container"] input').last();
  await nameInput.click();
  await p.keyboard.press('Control+A');
  await p.keyboard.press('Backspace');
  await p.keyboard.type('Simple History Teller', { delay: 30 });
  await p.waitForTimeout(500);

  // 3. Bio textarea
  console.log('Setting Bio...');
  const bioText = '🏛️ History animated! ⏰ New ep every 2 days! 📺 YouTube: Simple History Teller';
  const bioArea = p.locator('div[id="tux-portal-container"] textarea, div[class*="Modal"] textarea').first();
  await bioArea.click();
  await p.keyboard.press('Control+A');
  await p.keyboard.press('Backspace');
  await p.keyboard.type(bioText, { delay: 20 });
  await p.waitForTimeout(500);

  await p.screenshot({ path: 'tools/tiktok_modal_filled_ready.png' });
  console.log('Saved tools/tiktok_modal_filled_ready.png');

  // 4. Click Save
  const saveBtn = p.locator('div[id="tux-portal-container"] button:has-text("Save")').first();
  console.log('Save button visible:', await saveBtn.isVisible().catch(() => false));
  await saveBtn.click();
  await p.waitForTimeout(4000);

  await p.screenshot({ path: 'tools/tiktok_profile_after_save.png' });
  console.log('Saved tools/tiktok_profile_after_save.png');

  process.exit(0);
})();
