const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];
  console.log('Clicking Get a verification code at bad...');
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('li, div[role="link"], div[role="button"], div'))
      .find(x => x.innerText && x.innerText.includes('bad') && x.innerText.includes('@gmail.com'));
    if (el) el.click();
    else {
      const all = Array.from(document.querySelectorAll('*')).filter(x => x.innerText?.includes('@gmail.com'));
      if (all.length > 0) all[0].click();
    }
  });
  await page.waitForTimeout(4000);
  console.log('Current URL:', page.url(), '| Title:', await page.title());
  await page.screenshot({ path: 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/signin_after_email_select.png' });
  const text = await page.evaluate(() => document.body.innerText);
  console.log('PAGE TEXT:\n', text);
  process.exit(0);
})().catch(e => {
  console.error(e.message);
  process.exit(1);
});
