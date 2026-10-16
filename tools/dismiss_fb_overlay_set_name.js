const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com'));
  if (!p) {
    console.log('No FB page');
    process.exit(1);
  }

  // Dismiss any overlays
  const dismissBtn = p.locator('div[aria-label="Close"], div[role="button"]:has-text("Not now"), div[role="button"]:has-text("OK"), button:has-text("Not now")').first();
  if (await dismissBtn.isVisible().catch(() => false)) {
    console.log('Dismissing overlay...');
    await dismissBtn.click({ force: true });
    await p.waitForTimeout(1000);
  }

  // Focus and type Page name
  console.log('Focusing Page name input via evaluate...');
  await p.evaluate(() => {
    // Find input near "Page name (required)"
    const labels = Array.from(document.querySelectorAll('label, span, div'));
    const nameLabel = labels.find(l => l.innerText?.includes('Page name (required)'));
    if (nameLabel) {
      const parent = nameLabel.closest('div[class*="x1n2onr6"]') || nameLabel.parentElement;
      const inp = parent?.querySelector('input') || document.querySelector('input[type="text"]');
      if (inp) {
        inp.focus();
        inp.value = 'Simple History Teller';
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });

  await p.waitForTimeout(1000);
  await p.screenshot({ path: 'tools/fb_name_focused.png' });
  console.log('Saved tools/fb_name_focused.png');

  process.exit(0);
})();
