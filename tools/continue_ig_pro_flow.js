const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();
  await p.goto('https://www.instagram.com/accounts/convert_to_professional_account/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);

  // If on Creator overview or step 1
  const creatorBox = p.locator('div:has-text("Creator")').last();
  if (await creatorBox.isVisible().catch(() => false)) {
    await creatorBox.click();
    await p.waitForTimeout(1000);
  }

  // Click Next
  const nextBtn1 = p.locator('button:has-text("Next"), div[role="button"]:has-text("Next")').first();
  await nextBtn1.click();
  await p.waitForTimeout(2000);

  // If on Creator benefits page, click Next again
  const nextBtn2 = p.locator('button:has-text("Next"), div[role="button"]:has-text("Next")').first();
  if (await nextBtn2.isVisible().catch(() => false)) {
    console.log('Clicking Next on Creator benefits...');
    await nextBtn2.click();
    await p.waitForTimeout(3000);
  }

  await p.screenshot({ path: 'tools/ig_pro_step3_category.png' });
  console.log('Saved tools/ig_pro_step3_category.png. URL:', p.url());

  const inputsAndButtons = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('h2, h3, input, button, label')).map(el => el.innerText || el.placeholder || el.value).filter(Boolean);
  });
  console.log('Category step elements:', inputsAndButtons);

  await p.close();
  process.exit(0);
})();
