const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com'));
  if (!p) {
    console.log('No FB page found');
    process.exit(1);
  }

  // Look for the top-right profile button
  const buttons = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="button"], svg')).map(el => ({
      ariaLabel: el.getAttribute('aria-label'),
      text: el.innerText ? el.innerText.slice(0, 30) : ''
    })).filter(x => x.ariaLabel && (x.ariaLabel.includes('profile') || x.ariaLabel.includes('Account') || x.ariaLabel.includes('Your')));
  });
  console.log('Matching profile buttons:', buttons);

  const locs = p.locator('div[aria-label="Your profile"]');
  const count = await locs.count();
  console.log('Count:', count);
  for (let i = 0; i < count; i++) {
    const box = await locs.nth(i).boundingBox();
    console.log(i, box);
    if (box && box.y < 100 && box.x > 1000) {
      console.log('Clicking top-right profile button at index', i);
      await locs.nth(i).click();
      break;
    }
  }

  await p.waitForTimeout(2500);
  await p.screenshot({ path: 'tools/fb_profile_menu.png' });
  console.log('Saved tools/fb_profile_menu.png');
  process.exit(0);
})();
