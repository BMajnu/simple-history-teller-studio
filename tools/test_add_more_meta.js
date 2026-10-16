const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();
  await p.goto('https://accountscenter.instagram.com/home/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);

  const card = p.locator('div:has-text("bmajnu980@gmail.com")').last();
  await card.click();
  await p.waitForTimeout(2000);

  const addMoreBtn = p.locator('span:text-is("Add more"), div:has-text("Add more")').last();
  console.log('Clicking Add more...');
  await addMoreBtn.click();
  await p.waitForTimeout(3000);

  console.log('URL now:', p.url());
  await p.screenshot({ path: 'tools/meta_add_more_clicked.png' });
  const text = await p.evaluate(() => document.body.innerText.slice(0, 800));
  console.log('Text after Add more:', text);

  await p.close();
  process.exit(0);
})();
