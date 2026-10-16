const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.log('No create page found');
    process.exit(1);
  }

  const btns = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('[role="button"], button')).map(b => ({
      text: b.innerText ? b.innerText.trim() : '',
      ariaLabel: b.getAttribute('aria-label'),
      rect: b.getBoundingClientRect()
    })).filter(b => b.text || b.ariaLabel);
  });
  console.log('Buttons:', JSON.stringify(btns, null, 2));

  // Find scrollable elements on the left side (x < 400)
  const scrollables = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width < 500 && rect.height > 400 && el.scrollHeight > el.clientHeight;
    }).map(el => ({
      tag: el.tagName,
      className: el.className,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight
    }));
  });
  console.log('Scrollable containers on left:', scrollables);

  // Scroll the left container to bottom
  await p.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*')).find(e => {
      const rect = e.getBoundingClientRect();
      return rect.width < 500 && rect.height > 400 && e.scrollHeight > e.clientHeight;
    });
    if (el) el.scrollTop = el.scrollHeight;
  });
  await p.waitForTimeout(1500);

  await p.screenshot({ path: 'tools/fb_scrolled_left_pane.png' });
  console.log('Saved tools/fb_scrolled_left_pane.png');

  process.exit(0);
})();
