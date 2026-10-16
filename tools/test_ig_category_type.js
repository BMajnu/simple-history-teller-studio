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

  // Check show category
  const showBox = p.locator('label:has-text("Show category on profile"), span:has-text("Show category on profile")').first();
  if (await showBox.isVisible().catch(() => false)) {
    await showBox.click();
    await p.waitForTimeout(500);
  }

  // Type Video Creator in Search
  const searchInput = p.locator('input[placeholder="Search"]').first();
  await searchInput.click();
  await p.keyboard.type('Video', { delay: 100 });
  await p.waitForTimeout(2000);

  await p.screenshot({ path: 'tools/ig_typed_video_results.png' });
  console.log('Saved tools/ig_typed_video_results.png');

  const visibleOptions = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('span, label, div')).filter(el => {
      const t = el.innerText?.trim();
      return t && (t.toLowerCase().includes('video') || t.toLowerCase().includes('creator'));
    }).map(el => el.innerText.trim()).slice(0, 10);
  });
  console.log('Visible options:', visibleOptions);

  await p.close();
  process.exit(0);
})();
