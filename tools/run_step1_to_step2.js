const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.error('FB create page not found');
    process.exit(1);
  }

  // Remove toast
  await p.evaluate(() => {
    const toasts = Array.from(document.querySelectorAll('div')).filter(d => d.innerText && d.innerText.includes('was created'));
    toasts.forEach(t => t.remove());
  });
  await p.waitForTimeout(500);

  // Scroll left pane
  await p.evaluate(() => {
    const scrollables = Array.from(document.querySelectorAll('div')).filter(el => {
      const style = window.getComputedStyle(el);
      return (style.overflowY === 'auto' || style.overflowY === 'scroll') && el.getBoundingClientRect().left < 400;
    });
    scrollables.forEach(el => el.scrollTop = el.scrollHeight);
  });
  await p.waitForTimeout(1000);

  await p.screenshot({ path: 'tools/fb_scrolled_left_pane_now.png' });
  console.log('Scrolled screenshot saved.');

  // Check buttons
  const buttons = await p.$$eval('div[role="button"]', btns => btns.map(b => ({
    text: b.innerText,
    ariaLabel: b.getAttribute('aria-label'),
    rect: b.getBoundingClientRect()
  })));
  console.log('Buttons:', buttons.filter(b => (b.text && b.text.includes('Next')) || (b.ariaLabel && b.ariaLabel.includes('Next'))));

  const nextBtn = p.locator('div[aria-label="Next"][role="button"], div[role="button"]:has-text("Next")').first();
  if (await nextBtn.isVisible().catch(() => false)) {
    console.log('Next button visible! Clicking...');
    await nextBtn.click();
  } else {
    console.log('Clicking coordinate...');
    await p.mouse.click(265, 911);
  }

  await p.waitForTimeout(4000);
  await p.screenshot({ path: 'tools/fb_after_next_step1.png' });
  console.log('After click screenshot saved.');
  process.exit(0);
})();
