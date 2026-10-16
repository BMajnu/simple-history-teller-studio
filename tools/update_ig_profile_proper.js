const { chromium } = require('playwright-core');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.join(ARTIFACTS_DIR, 'history_mascot_02_torch_stone_arch_ruins.jpg');

const SHORT_BIO = `🏛️ Unraveling history through animation!
⏰ New Episode every 2 days
📺 YouTube: @SimpleHistoryTellerOfficial`;

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://www.instagram.com/accounts/edit/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // 1. Upload photo via file chooser or file input
  console.log('Looking for file input for profile picture...');
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    console.log('Setting file on fileInput...');
    await fileInput.setInputFiles(LOGO_PATH);
    await page.waitForTimeout(4000);
  } else {
    console.log('Clicking Change photo button with fileChooser listener...');
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null),
      page.locator('button:has-text("Change photo")').click()
    ]);
    if (fileChooser) {
      await fileChooser.setFiles(LOGO_PATH);
      await page.waitForTimeout(4000);
    }
  }

  // 2. Focus Bio and type using keyboard so React enables Submit
  console.log('Focusing Bio and typing...');
  const bioArea = page.locator('textarea').first();
  await bioArea.click();
  await bioArea.fill('');
  await page.keyboard.type(SHORT_BIO, { delay: 30 });
  await page.waitForTimeout(1000);

  // 3. Check Submit button
  const submitBtn = page.locator('div[role="button"]:has-text("Submit"), button:has-text("Submit")').first();
  const isDisabled = await submitBtn.getAttribute('aria-disabled');
  console.log('Submit button aria-disabled:', isDisabled);

  if (isDisabled !== 'true') {
    console.log('Clicking Submit...');
    await submitBtn.click();
    await page.waitForTimeout(4000);
  }

  // Take screenshot of edit profile
  await page.screenshot({ path: 'tools/ig_edit_saved.png' });
  console.log('Saved tools/ig_edit_saved.png');

  // Go to profile view
  await page.goto('https://www.instagram.com/simplehistorytellerofficial/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tools/ig_profile_final_live.png' });
  console.log('Saved tools/ig_profile_final_live.png');

  await page.close();
  process.exit(0);
})();
