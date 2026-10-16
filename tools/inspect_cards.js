const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const list = await page.evaluate(() => {
    const carousel = document.querySelector('ms-model-carousel');
    if (!carousel) return 'No carousel';
    const all = Array.from(carousel.querySelectorAll('*'));
    return all.filter(el => {
      const t = el.innerText || '';
      return (t.includes('Gemini Omni') || t.includes('Veo 3.1')) && el.children.length <= 3;
    }).map(el => ({
      tag: el.tagName,
      class: el.className,
      id: el.id,
      text: el.innerText.slice(0, 80).replace(/\n/g, ' ')
    }));
  });

  console.log('Result:', JSON.stringify(list, null, 2));
})();
