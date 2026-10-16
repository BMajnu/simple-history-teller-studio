const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];
  console.log('Current URL:', page.url());

  const getStarted = page.locator('button:has-text("Get started"), a:has-text("Get started")').first();
  if (await getStarted.count() > 0) {
    console.log('Clicking Get started...');
    await getStarted.click();
    await page.waitForTimeout(4000);
  }

  console.log('URL after Get started:', page.url());

  const acct = page.locator('text=badiuzzaman.majnu@gmail.com').first();
  if (await acct.count() > 0) {
    console.log('Clicking account by email...');
    await acct.click();
    await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(3000);
  }

  console.log('URL after account click:', page.url(), '| Title:', await page.title());
  await page.screenshot({ path: 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/signin_step_now.png' });
  const text = await page.evaluate(() => document.body.innerText);
  console.log('PAGE TEXT:\n', text);
  process.exit(0);
})().catch(e => {
  console.error(e.stack || e.message);
  process.exit(1);
});
