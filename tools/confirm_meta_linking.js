const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  let p = ctx.pages().find(page => page.url().includes('accountscenter.facebook.com'));
  if (!p) {
    console.log('Page not currently open, reopening...');
    p = await ctx.newPage();
    await p.goto('https://accountscenter.facebook.com/home/', { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(3000);
    // Click profile row
    const row = p.locator('div:has-text("bmajnu980@gmail.com")').last();
    await row.click();
    await p.waitForTimeout(2000);
    // Click Add more
    const addMore = p.locator('text=Add more').first();
    await addMore.click();
    await p.waitForTimeout(2000);
    // Click Add Instagram
    const addIg = p.locator('text=Add Instagram').first();
    await addIg.click();
    await p.waitForTimeout(4000);
    // Click Continue
    const cont = p.locator('text=Continue').first();
    if (await cont.isVisible().catch(() => false)) {
      await cont.click();
      await p.waitForTimeout(4000);
    }
  }

  console.log('Looking for Confirm button...');
  const confirmBtn = p.locator('div[role="button"]:has-text("Confirm"), button:has-text("Confirm")').first();
  if (await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking Confirm button...');
    await confirmBtn.click();
    await p.waitForTimeout(8000);
  }

  await p.screenshot({ path: 'tools/meta_after_confirm_linked.png' });
  console.log('Saved tools/meta_after_confirm_linked.png. URL:', p.url());

  const text = await p.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Final screen text:\n', text);

  // Copy to artifacts
  const fs = require('fs');
  fs.copyFileSync('tools/meta_after_confirm_linked.png', 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/meta_linked_accounts_live.png');
  console.log('Copied to artifacts as meta_linked_accounts_live.png');

  process.exit(0);
})();
