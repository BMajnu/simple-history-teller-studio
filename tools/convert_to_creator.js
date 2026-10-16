const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();
  await p.goto('https://www.instagram.com/accounts/convert_to_professional_account/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);

  console.log('Selecting Creator...');
  const creatorBox = p.locator('div:has-text("Creator")').last();
  await creatorBox.click();
  await p.waitForTimeout(1000);

  console.log('Clicking Next...');
  const nextBtn = p.locator('button:has-text("Next"), div[role="button"]:has-text("Next")').first();
  await nextBtn.click();
  await p.waitForTimeout(4000);

  await p.screenshot({ path: 'tools/ig_pro_step2.png' });
  console.log('Saved tools/ig_pro_step2.png. URL:', p.url());

  const pageText = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('h2, h3, button, span, input')).map(el => el.innerText || el.placeholder || el.value).filter(Boolean);
  });
  console.log('Step 2 elements:', pageText);

  await p.close();
  process.exit(0);
})();
