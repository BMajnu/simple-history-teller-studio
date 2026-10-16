const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();
  await p.goto('https://www.facebook.com/login/?app_id=1217981644879628&next=https%3A%2F%2Fwww.facebook.com%2Ffxauth%2F', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);

  const createBtn = p.locator('a:has-text("Create new account"), button:has-text("Create new account")').first();
  console.log('Clicking Create new account...');
  await createBtn.click();
  await p.waitForTimeout(3000);

  await p.screenshot({ path: 'tools/fb_create_account_modal.png' });
  console.log('Saved tools/fb_create_account_modal.png. URL:', p.url());

  const fields = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select')).map(el => ({
      name: el.name,
      type: el.type,
      placeholder: el.placeholder,
      id: el.id
    }));
  });
  console.log('Fields in signup modal:', fields);

  await p.close();
  process.exit(0);
})();
