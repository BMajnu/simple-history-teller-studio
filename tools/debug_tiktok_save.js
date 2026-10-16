const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('tiktok.com'));

  p.on('response', async resp => {
    if (resp.url().includes('user/profile/update') || resp.url().includes('passport') || resp.url().includes('avatar')) {
      try {
        const text = await resp.text();
        console.log('Network API:', resp.status(), resp.url(), text.slice(0, 300));
      } catch (e) {}
    }
  });

  await p.goto('https://www.tiktok.com/@simplehistoryteller', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);

  const editBtn = p.locator('button:has-text("Edit profile")').first();
  await editBtn.click();
  await p.waitForTimeout(2000);

  // Upload photo
  const avatarPath = path.resolve('banner_assets/history_mascot_02_torch_stone_arch_ruins.jpg');
  await p.locator('input[type="file"]').first().setInputFiles(avatarPath);
  await p.waitForTimeout(2000);

  // Click Apply
  const applyBtn = p.locator('button:has-text("Apply")').first();
  if (await applyBtn.isVisible().catch(() => false)) {
    console.log('Clicking Apply...');
    await applyBtn.click();
    await p.waitForTimeout(3000);
  }

  // Type simple clean bio without complex characters first to test
  console.log('Typing bio...');
  const bioInput = p.locator('textarea').first();
  await bioInput.click();
  await p.keyboard.press('Control+A');
  await p.keyboard.press('Backspace');
  await p.keyboard.type('Unraveling history through animation! New episode every 2 days.', { delay: 15 });
  await p.waitForTimeout(1000);

  // Check Save button state
  const saveBtn = p.locator('button:has-text("Save")').first();
  console.log('Save button enabled:', await saveBtn.isEnabled());
  await saveBtn.click();
  await p.waitForTimeout(5000);

  // Check if error appeared
  const err = await p.evaluate(() => {
    const errEl = document.querySelector('div[class*="Error"], span[class*="Error"], [role="alert"]');
    return errEl ? errEl.innerText : null;
  });
  console.log('Error banner:', err);

  await p.screenshot({ path: 'tools/tiktok_save_debug.png' });
  await p.close();
  process.exit(0);
})();
