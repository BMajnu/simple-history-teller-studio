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

  // Now on Select category page
  console.log('On Category page...');
  // Check "Show category on profile"
  const showCheckbox = p.locator('input[type="checkbox"]').first();
  if (await showCheckbox.isVisible().catch(() => false)) {
    const isChecked = await showCheckbox.isChecked();
    if (!isChecked) {
      console.log('Checking show category on profile...');
      await p.locator('label:has-text("Show category on profile"), span:has-text("Show category on profile")').first().click();
    }
  }

  // Type in Search
  const searchInput = p.locator('input[placeholder="Search"]').first();
  if (await searchInput.isVisible().catch(() => false)) {
    console.log('Searching Video Creator...');
    await searchInput.fill('Video Creator');
    await p.waitForTimeout(1500);
    await p.screenshot({ path: 'tools/ig_category_search_results.png' });

    // Pick first search result
    const firstOption = p.locator('div[role="button"]:has-text("Video"), label:has-text("Video Creator"), div:has-text("Video Creator")').last();
    if (await firstOption.isVisible().catch(() => false)) {
      console.log('Selecting Video Creator...');
      await firstOption.click();
      await p.waitForTimeout(1000);
    }
  }

  // Click Done
  const doneBtn = p.locator('button:has-text("Done"), div[role="button"]:has-text("Done")').first();
  console.log('Clicking Done button...');
  await doneBtn.click();
  await p.waitForTimeout(6000);

  await p.screenshot({ path: 'tools/ig_pro_after_done.png' });
  console.log('Saved tools/ig_pro_after_done.png. URL:', p.url());

  const dialogText = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('h2, h3, button, span')).map(el => el.innerText.trim()).filter(Boolean);
  });
  console.log('After done text:', dialogText.slice(0, 20));

  await p.close();
  process.exit(0);
})();
