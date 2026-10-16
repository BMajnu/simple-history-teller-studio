const { chromium } = require('playwright-core');

(async () => {
  console.log('=== TURNING ON INSTAGRAM -> FACEBOOK AUTO-SHARING ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://accountscenter.facebook.com/connected_experiences/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Click "Your stories, reels and posts"
  const contentOption = page.locator('text=Your stories, reels and posts').first();
  await contentOption.click();
  await page.waitForTimeout(2000);

  // Click simplehistorytellerofficial
  console.log('Clicking simplehistorytellerofficial...');
  const igRow = page.locator('text=simplehistorytellerofficial').first();
  await igRow.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'tools/meta_ig_sharing_toggles.png' });
  console.log('Saved tools/meta_ig_sharing_toggles.png. URL:', page.url());

  const text = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Toggles page text:\n', text);

  // Turn on all false switches
  const switches = page.locator('[role="switch"][aria-checked="false"]');
  const count = await switches.count();
  console.log('Switches to turn on:', count);
  for (let i = 0; i < count; i++) {
    await switches.nth(i).click();
    await page.waitForTimeout(1000);
  }

  // Also check if there's Set up / Turn on buttons
  const setupBtn = page.locator('div[role="button"]:has-text("Set up"), button:has-text("Set up"), div[role="button"]:has-text("Turn on")').first();
  if (await setupBtn.isVisible().catch(() => false)) {
    console.log('Clicking Set up/Turn on button...');
    await setupBtn.click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tools/meta_ig_sharing_turned_on.png' });
  console.log('Saved tools/meta_ig_sharing_turned_on.png');

  const fs = require('fs');
  fs.copyFileSync('tools/meta_ig_sharing_turned_on.png', 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/meta_crossposting_live.png');
  console.log('Copied to artifacts as meta_crossposting_live.png');

  await page.close();
  process.exit(0);
})();
