const { chromium } = require('playwright-core');

(async () => {
  console.log('=== COMPLETING INSTAGRAM LINKING TO META ACCOUNT ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://accountscenter.facebook.com/home/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // 1. Click profile row
  console.log('Clicking profile row...');
  const row = page.locator('div[role="button"]:has-text("profile")').first();
  await row.click();
  await page.waitForTimeout(2000);

  // 2. Click Add more
  console.log('Clicking Add more...');
  const addMore = page.locator('text=Add more').first();
  await addMore.click();
  await page.waitForTimeout(2000);

  // 3. Click Add Instagram
  console.log('Clicking Add Instagram...');
  const addIg = page.locator('text=Add Instagram').first();
  await addIg.click();
  await page.waitForTimeout(4000);

  // 4. Click Continue if prompted on Instagram auth screen
  console.log('Checking for Continue button...');
  const cont = page.locator('div[role="button"]:has-text("Continue"), button:has-text("Continue")').first();
  if (await cont.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking Continue on Instagram auth...');
    await cont.click();
    await page.waitForTimeout(4000);
  }

  await page.screenshot({ path: 'tools/meta_confirm_screen_ready.png' });
  console.log('Saved tools/meta_confirm_screen_ready.png');

  // 5. Click Confirm button on "Unlock cross-profile experiences" modal
  console.log('Looking for Confirm button...');
  const confirmBtn = page.locator('div[aria-label="Confirm"], div[role="button"]:has-text("Confirm"), button:has-text("Confirm")').first();
  if (await confirmBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
    console.log('Clicking Confirm button...');
    await confirmBtn.click({ force: true });
    await page.waitForTimeout(6000);
  } else {
    // Try evaluate click on any element containing Confirm
    console.log('Trying evaluate click on Confirm...');
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('[role="button"], button')).find(b => b.innerText && b.innerText.trim() === 'Confirm');
      if (el) el.click();
    });
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: 'tools/meta_profiles_after_confirm.png' });
  console.log('Saved tools/meta_profiles_after_confirm.png. URL:', page.url());

  const finalText = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Final text on screen:\n', finalText);

  // Copy to artifacts
  const fs = require('fs');
  fs.copyFileSync('tools/meta_profiles_after_confirm.png', 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/meta_linked_accounts_live.png');
  console.log('Copied to artifacts as meta_linked_accounts_live.png');

  await page.close();
  process.exit(0);
})();
