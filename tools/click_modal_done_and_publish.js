const { chromium } = require('playwright-core');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const BANNER_PATH = path.join(ARTIFACTS_DIR, 'banner_simple_history_teller_en.jpg');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('studio.youtube.com'));

  // 1. Click Done on current visible modal
  console.log('1. Checking for visible Done button on picture crop modal...');
  const doneBtns = page.locator('button:has-text("Done")');
  const count = await doneBtns.count();
  console.log('Found Done buttons:', count);
  for (let i = 0; i < count; i++) {
    if (await doneBtns.nth(i).isVisible()) {
      console.log(`Clicking visible Done button ${i}...`);
      await doneBtns.nth(i).click({ force: true });
      await page.waitForTimeout(3000);
      break;
    }
  }

  // 2. Now upload the Banner Image
  console.log('2. Uploading Banner Image...');
  const bannerInput = page.locator('ytcp-banner-upload input[type="file"]').first();
  await bannerInput.setInputFiles(BANNER_PATH);
  await page.waitForTimeout(4000);

  // Click Done on banner modal
  console.log('Checking for banner crop Done button...');
  const bDoneBtns = page.locator('button:has-text("Done")');
  const bCount = await bDoneBtns.count();
  for (let i = 0; i < bCount; i++) {
    if (await bDoneBtns.nth(i).isVisible()) {
      console.log(`Clicking visible Banner Done button ${i}...`);
      await bDoneBtns.nth(i).click({ force: true });
      await page.waitForTimeout(3000);
      break;
    }
  }

  // 3. Click Publish
  console.log('3. Clicking Publish button...');
  const pubBtn = page.locator('#publish-button button, #publish-button').first();
  if (await pubBtn.isEnabled()) {
    await pubBtn.click({ force: true });
    console.log('Clicked Publish! Waiting 6s for YouTube to save...');
    await page.waitForTimeout(6000);
  } else {
    console.log('Publish button not enabled yet!');
  }

  await page.screenshot({ path: 'tools/c1_final_applied_success.png' });
  console.log('Channel 1 update finished!');
  process.exit(0);
})();
