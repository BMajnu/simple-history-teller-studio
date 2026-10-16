const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();
  await p.goto('https://accountscenter.instagram.com/home/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);

  const card = p.locator('div:has-text("bmajnu980@gmail.com")').last();
  await card.click();
  await p.waitForTimeout(1500);

  const addMoreBtn = p.locator('span:text-is("Add more"), div:has-text("Add more")').last();
  await addMoreBtn.click();
  await p.waitForTimeout(1500);

  const addIgBtn = p.locator('div:has-text("Add Instagram"), span:text-is("Add Instagram")').last();
  console.log('Clicking Add Instagram...');
  await addIgBtn.click();
  await p.waitForTimeout(3000);

  console.log('URL now:', p.url());
  await p.screenshot({ path: 'tools/meta_add_ig_screen.png' });
  const text = await p.evaluate(() => document.body.innerText.slice(0, 800));
  console.log('Text now:', text);

  await p.close();
  process.exit(0);
})();
