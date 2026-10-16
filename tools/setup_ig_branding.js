const { chromium } = require('playwright-core');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.join(ARTIFACTS_DIR, 'history_mascot_02_torch_stone_arch_ruins.jpg');

const BIO = `🏛️ Unraveling the greatest stories of human history through animated storytelling!
⏰ New Episode every 2 days (3 weekly)
📺 Watch full animated episodes on YouTube!
📩 Business: bmajnu980@gmail.com`;

(async () => {
  console.log('=== BRANDING INSTAGRAM: simplehistorytellerofficial ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to Edit Profile...');
  await page.goto('https://www.instagram.com/accounts/edit/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('Edit profile URL:', page.url());
  await page.screenshot({ path: 'tools/ig_edit_profile_screen.png' });
  console.log('Saved tools/ig_edit_profile_screen.png');

  // 1. Upload Profile Photo
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    console.log('Attaching profile photo...');
    await fileInput.setInputFiles(LOGO_PATH);
    await page.waitForTimeout(4000);
  }

  // 2. Set Bio
  const bioInput = page.locator('textarea[placeholder*="Bio"], textarea#pepBio, textarea').first();
  if (await bioInput.count() > 0) {
    console.log('Setting Bio...');
    await bioInput.fill(BIO);
    await page.waitForTimeout(1000);
  }

  // 3. Submit / Save
  const submitBtn = page.locator('button:has-text("Submit"), div[role="button"]:has-text("Submit")').first();
  if (await submitBtn.isVisible().catch(() => false)) {
    console.log('Clicking Submit on Edit Profile...');
    await submitBtn.click();
    await page.waitForTimeout(5000);
  }

  // 4. Return to public profile
  console.log('Navigating to profile...');
  await page.goto('https://www.instagram.com/simplehistorytellerofficial/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'tools/ig_profile_branded_live.png' });
  console.log('Saved tools/ig_profile_branded_live.png');

  await page.close();
  process.exit(0);
})();
