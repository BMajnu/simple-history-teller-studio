const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const page = browser.contexts()[0].pages()[0];
    console.log('Current URL:', page.url());

    // Fill phone number
    const input = await page.$('input[type="tel"], input');
    if (input) {
      console.log('Found input, filling 01796072129...');
      await input.click();
      await input.fill('01796072129');
      await page.waitForTimeout(500);
    } else {
      console.log('Input not found!');
    }

    // Find and click Next
    const nextBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, span')).filter(x => x.innerText && x.innerText.trim() === 'Next');
      if (btns.length > 0) {
        const target = btns[btns.length - 1];
        const r = target.getBoundingClientRect();
        return { x: r.x + r.width/2, y: r.y + r.height/2 };
      }
      return null;
    });

    if (nextBtn) {
      console.log('Clicking Next at:', nextBtn);
      await page.mouse.click(nextBtn.x, nextBtn.y);
      await page.waitForTimeout(5000);
    }

    console.log('New URL:', page.url());
    console.log('Title:', await page.title());
    const text = await page.evaluate(() => document.body.innerText);
    console.log('Screen text:\n', text);
    await page.screenshot({ path: 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/signin_after_phone_entered.png' });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
