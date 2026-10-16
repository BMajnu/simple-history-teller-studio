const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();
  await p.goto('https://www.instagram.com/accounts/convert_to_professional_account/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);

  // If Creator selection needed
  const creatorBox = p.locator('div:has-text("Creator")').last();
  if (await creatorBox.isVisible().catch(() => false)) {
    await creatorBox.click();
    await p.waitForTimeout(500);
    const next1 = p.locator('button:has-text("Next"), div[role="button"]:has-text("Next")').first();
    await next1.click();
    await p.waitForTimeout(1500);
  }

  // If benefits page
  const next2 = p.locator('button:has-text("Next"), div[role="button"]:has-text("Next")').first();
  if (await next2.isVisible().catch(() => false)) {
    await next2.click();
    await p.waitForTimeout(2000);
  }

  // Search Digital creator
  const searchInput = p.locator('input[placeholder="Search"]').first();
  await searchInput.click();
  await p.keyboard.press('Control+A');
  await p.keyboard.press('Backspace');
  await p.keyboard.type('Digital', { delay: 100 });
  await p.waitForTimeout(1500);

  const digitalResults = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="button"], label, span')).map(el => el.innerText?.trim()).filter(Boolean).filter(t => t.toLowerCase().includes('digital'));
  });
  console.log('Results for "Digital":', digitalResults);

  // Search Education
  await searchInput.click();
  await p.keyboard.press('Control+A');
  await p.keyboard.press('Backspace');
  await p.keyboard.type('Education', { delay: 100 });
  await p.waitForTimeout(1500);

  const eduResults = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="button"], label, span')).map(el => el.innerText?.trim()).filter(Boolean).filter(t => t.toLowerCase().includes('education'));
  });
  console.log('Results for "Education":', eduResults);

  await p.screenshot({ path: 'tools/ig_category_test.png' });
  await p.close();
  process.exit(0);
})();
