const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const page = browser.contexts()[0].pages()[0];
    console.log('Current URL before code entry:', page.url());

    // Enter code
    const input = await page.$('input[type="tel"], input[type="text"], input');
    if (input) {
      console.log('Found code input, filling 443689...');
      await input.click();
      await input.fill('443689');
      await page.waitForTimeout(500);
    } else {
      console.log('Input field not found!');
    }

    // Find Next button
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
    } else {
      console.log('Pressing Enter key on input...');
      await page.keyboard.press('Enter');
    }

    console.log('Waiting for response/navigation...');
    await page.waitForTimeout(6000);

    console.log('URL after submit:', page.url());
    console.log('Title:', await page.title());
    await page.screenshot({ path: 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/signin_after_code_submit.png' });
    const text = await page.evaluate(() => document.body.innerText);
    console.log('Page text snippet:\n', text.substring(0, 1000));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
