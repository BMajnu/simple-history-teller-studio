const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const igPage = ctx.pages().find(p => p.url().includes('instagram.com'));
  if (igPage) {
    console.log('IG page URL:', igPage.url());
    await igPage.screenshot({ path: 'tools/ig_current_dom_screen.png' });
    const elements = await igPage.evaluate(() => {
      return Array.from(document.querySelectorAll('input, button, [role="button"], img')).map(el => ({
        tag: el.tagName,
        type: el.getAttribute('type'),
        placeholder: el.getAttribute('placeholder'),
        ariaLabel: el.getAttribute('aria-label'),
        name: el.getAttribute('name'),
        src: el.getAttribute('src')?.slice(0, 50),
        id: el.id,
        text: el.innerText
      }));
    });
    console.log('Elements on page:', JSON.stringify(elements, null, 2));
  } else {
    console.log('No IG page found');
  }
  process.exit(0);
})();
