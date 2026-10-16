const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.log('No create page found');
    process.exit(1);
  }

  const btnInfo = await p.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('[role="button"], button')).map(b => ({
      text: b.innerText,
      ariaLabel: b.getAttribute('aria-label'),
      disabled: b.getAttribute('aria-disabled'),
      rect: b.getBoundingClientRect()
    })).filter(b => b.text && b.text.includes('Create Page'));
    return btns;
  });
  console.log('Create Page buttons:', JSON.stringify(btnInfo, null, 2));

  // Click the button using coordinates from rect or evaluate click
  const clicked = await p.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('[role="button"], button')).find(b => b.innerText && b.innerText.includes('Create Page'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Evaluate click result:', clicked);

  console.log('Waiting 8s for Facebook response...');
  await p.waitForTimeout(8000);

  await p.screenshot({ path: 'tools/fb_c2_after_direct_click.png' });
  console.log('Saved tools/fb_c2_after_direct_click.png. Current URL:', p.url());

  process.exit(0);
})();
