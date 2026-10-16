const { chromium } = require('playwright-core');

(async () => {
  console.log('=== ADDING INSTAGRAM VIA ACCOUNTS CENTER ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://accountscenter.facebook.com/home/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click the profile row
  console.log('Clicking bmajnu980@gmail.com profile row...');
  const row = page.locator('div:has-text("bmajnu980@gmail.com")').last();
  await row.click();
  await page.waitForTimeout(2500);

  // Click Add more
  console.log('Clicking Add more...');
  const addMore = page.locator('text=Add more').first();
  await addMore.click();
  await page.waitForTimeout(2500);

  // Click Add Instagram
  console.log('Clicking Add Instagram...');
  const addIg = page.locator('text=Add Instagram').first();
  await addIg.click();
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'tools/meta_after_add_ig_click.png' });
  console.log('Saved tools/meta_after_add_ig_click.png. URL:', page.url());

  const text = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Text on screen:\n', text);

  // Look for Continue, Confirm, or login buttons
  const btns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, div[role="button"]')).map(b => b.innerText ? b.innerText.trim() : '').filter(t => t.length > 0 && t.length < 50);
  });
  console.log('Buttons on screen:', btns);

  // If there's Continue, click it
  const cont = page.locator('div[role="button"]:has-text("Continue"), button:has-text("Continue")').first();
  if (await cont.isVisible().catch(() => false)) {
    console.log('Clicking Continue...');
    await cont.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'tools/meta_add_ig_after_continue.png' });
    console.log('Saved tools/meta_add_ig_after_continue.png');

    console.log('Clicking Confirm button...');
    const confirmBtn = page.locator('div[role="button"]:has-text("Confirm"), button:has-text("Confirm")').first();
    if (await confirmBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      await confirmBtn.click();
      console.log('Clicked Confirm successfully!');
      await page.waitForTimeout(6000);
    }

    await page.screenshot({ path: 'tools/meta_ig_linked_success.png' });
    console.log('Saved tools/meta_ig_linked_success.png. URL:', page.url());

    const fs = require('fs');
    fs.copyFileSync('tools/meta_ig_linked_success.png', 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/meta_linked_accounts_live.png');
    console.log('Updated artifact meta_linked_accounts_live.png');
  }

  await page.close();
  process.exit(0);
})();
