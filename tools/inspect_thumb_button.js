const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9225');
  const page = browser.contexts()[0].pages()[0];

  const info = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const matched = all.filter(e => e.innerText && e.innerText.trim() === 'Choose a thumbnail');
    return matched.map(e => {
      let cur = e;
      const hierarchy = [];
      while (cur && cur !== document.body) {
        hierarchy.push({
          tag: cur.tagName,
          role: cur.getAttribute('role'),
          ariaLabel: cur.getAttribute('aria-label'),
          rect: cur.getBoundingClientRect(),
          fileInput: cur.querySelector('input[type="file"]') ? true : false
        });
        cur = cur.parentElement;
      }
      return hierarchy;
    });
  });

  console.log('Hierarchy:', JSON.stringify(info, null, 2));
  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
