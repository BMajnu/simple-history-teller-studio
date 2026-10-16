const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('convert_to_professional_account'));
  if (!p) {
    console.log('No convert page found');
    process.exit(1);
  }

  console.log('Natively clicking Done button...');
  const clicked = await p.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Done');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Done clicked:', clicked);

  await p.waitForTimeout(5000);
  console.log('URL now:', p.url());
  const bodyText = await p.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('Body text now:', bodyText);

  process.exit(0);
})();
