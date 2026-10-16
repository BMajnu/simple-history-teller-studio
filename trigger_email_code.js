const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];
  console.log('Current URL:', page.url());

  const clickByText = async (text) => {
    return await page.evaluate((t) => {
      const all = Array.from(document.querySelectorAll('button, a, div[role="link"], div[role="button"], span, li'));
      const el = all.reverse().find(x => x.innerText && x.innerText.trim().includes(t));
      if (el) { el.click(); return true; }
      return false;
    }, text);
  };

  // If on accountchooser, click account
  if (page.url().includes('accountchooser')) {
    console.log('Clicking account on chooser...');
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('li, div')).find(x => x.innerText && x.innerText.includes('badiuzzaman.majnu@gmail.com'));
      if (el) el.click();
    });
    await page.waitForTimeout(4000);
  }

  console.log('Current URL after chooser:', page.url());

  // If on password page, click Try another way
  if (page.url().includes('challenge/pwd')) {
    console.log('On password page, clicking Try another way...');
    await clickByText('Try another way');
    await page.waitForTimeout(4000);
  }

  console.log('Current URL after pwd:', page.url());

  // If on selection, click Try another way or phone confirm
  if (page.url().includes('challenge/selection')) {
    console.log('On challenge/selection. Page text:');
    const txt = await page.evaluate(() => document.body.innerText);
    console.log(txt);

    // If options include bad@gmail.com, click it directly!
    const clickedEmail = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('li, div[role="link"], div[role="button"]')).find(x => x.innerText && x.innerText.includes('bad') && x.innerText.includes('@gmail.com'));
      if (el) { el.click(); return true; }
      return false;
    });

    if (clickedEmail) {
      console.log('Clicked bad@gmail.com option!');
      await page.waitForTimeout(4000);
    } else {
      console.log('bad@gmail.com not listed, clicking Try another way...');
      await clickByText('Try another way');
      await page.waitForTimeout(4000);
    }
  }

  // If on phone number confirm, enter 01796072129
  if (page.url().includes('challenge/kpp') || (await page.evaluate(() => document.body.innerText.includes('••••29')))) {
    console.log('Entering phone 01796072129...');
    await page.evaluate((num) => {
      const input = document.querySelector('input');
      if (input) {
        input.value = num;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, '01796072129');
    await page.waitForTimeout(500);
    await clickByText('Next') || await clickByText('Send');
    await page.waitForTimeout(5000);
  }

  console.log('URL at end:', page.url(), '| Title:', await page.title());
  await page.screenshot({ path: 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/signin_email_code_step.png' });
  const finalScreenText = await page.evaluate(() => document.body.innerText);
  console.log('FINAL SCREEN TEXT:\n', finalScreenText);
  process.exit(0);
})().catch(e => {
  console.error(e.stack || e.message);
  process.exit(1);
});
