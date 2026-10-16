const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('studio.youtube.com'));

  const info = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="file"]'));
    return inputs.map((input, idx) => {
      let cur = input;
      let sectionText = '';
      for (let i = 0; i < 5; i++) {
        if (cur.parentElement) {
          cur = cur.parentElement;
          if (cur.innerText && cur.innerText.length > sectionText.length) {
            sectionText = cur.innerText;
          }
        }
      }
      return {
        idx,
        sectionText: sectionText.slice(0, 150).replace(/\n/g, ' ')
      };
    });
  });

  console.log('File inputs context:', JSON.stringify(info, null, 2));
  process.exit(0);
})();
