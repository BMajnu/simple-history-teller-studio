const { chromium } = require('playwright-core');

(async () => {
  console.log('=== RUNNING CONFIRM FLOW ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://accountscenter.facebook.com/home/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // 1. Click profile row
  console.log('Clicking profile row...');
  const row = page.locator('div:has-text("bmajnu980@gmail.com")').last();
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

  // 4. Click Continue if on Instagram auth
  const cont = page.locator('div[role="button"]:has-text("Continue"), button:has-text("Continue")').first();
  if (await cont.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Clicking Continue on Instagram auth...');
    await cont.click();
    await page.waitForTimeout(4000);
  }

  // 5. Look for blue Confirm button
  console.log('Finding buttons in the modal...');
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="button"], button')).map(b => ({
      text: b.innerText ? b.innerText.trim() : '',
      rect: b.getBoundingClientRect()
    }));
  });
  console.log('Buttons:', buttons);

  const confirmBtn = buttons.find(b => b.text === 'Confirm' || b.text.includes('Confirm'));
  if (confirmBtn) {
    console.log('Found Confirm button at:', confirmBtn.rect);
    await page.mouse.click(confirmBtn.rect.x + confirmBtn.rect.width/2, confirmBtn.rect.y + confirmBtn.rect.height/2);
    console.log('Clicked Confirm via mouse coords!');
    await page.waitForTimeout(8000);
  } else {
    // Click blue button directly
    const blueBtn = page.locator('div[role="button"][style*="background-color"], button[style*="background-color"], div[role="button"]:has-text("Confirm")').last();
    if (await blueBtn.isVisible().catch(() => false)) {
      console.log('Clicking blue button locator...');
      await blueBtn.click({ force: true });
      await page.waitForTimeout(8000);
    }
  }

  await page.screenshot({ path: 'tools/meta_final_linked_result.png' });
  console.log('Saved tools/meta_final_linked_result.png. URL:', page.url());

  const fs = require('fs');
  fs.copyFileSync('tools/meta_final_linked_result.png', 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/meta_linked_accounts_live.png');
  console.log('Updated artifact meta_linked_accounts_live.png');

  process.exit(0);
})();
