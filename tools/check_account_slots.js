const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const slots = ['u/0', 'u/1', 'u/2', 'u/3', 'u/4', 'u/5', 'u/6'];
  for (const s of slots) {
    try {
      await page.goto(`https://aistudio.google.com/${s}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      const email = await page.evaluate(() => {
        const text = document.body.innerText;
        const m = text.match(/[\w.-]+@gmail\.com/);
        return m ? m[0] : 'no email';
      });
      console.log(`Slot ${s}: ${email}`);
    } catch (e) {
      console.log(`Slot ${s}: Error ${e.message}`);
    }
  }
})();
