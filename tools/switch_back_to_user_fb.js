const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  console.log('=== CHECKING PROFILE SWITCHER ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com'));
  if (!p) {
    console.error('FB page not found');
    process.exit(1);
  }

  // Click top right profile icon (around x=1756, y=28 in standard full HD, let's locate aria-label="Your profile" or svg / image)
  const profileBtn = p.locator('div[aria-label="Your profile"][role="button"], div[role="button"]:has(image), div[role="button"]:has(svg[aria-label="Your profile"])').last();
  if (await profileBtn.isVisible().catch(() => false)) {
    console.log('Found profile button, clicking...');
    await profileBtn.click();
  } else {
    console.log('Locating top right avatar via DOM...');
    const topAvatars = await p.evaluate(() => {
      return Array.from(document.querySelectorAll('div[role="button"]'))
        .filter(el => {
          const r = el.getBoundingClientRect();
          return r.top < 60 && r.left > 1600;
        })
        .map(el => {
          const r = el.getBoundingClientRect();
          return { ariaLabel: el.getAttribute('aria-label'), x: r.x + r.width/2, y: r.y + r.height/2 };
        });
    });
    console.log('Top right buttons:', topAvatars);
    if (topAvatars.length > 0) {
      const target = topAvatars[topAvatars.length - 1];
      console.log('Clicking target:', target);
      await p.mouse.click(target.x, target.y);
    }
  }

  await p.waitForTimeout(3000);

  const client = await p.context().newCDPSession(p);
  const snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/fb_switch_menu.png', Buffer.from(snap.data, 'base64'));
  console.log('Menu snapshot saved.');

  // Find user switch button (Majnu Badiuzzaman or "See all profiles")
  const switchTarget = p.locator('div[role="button"]:has-text("Majnu"), div[role="button"]:has-text("See all profiles"), span:has-text("See all profiles")').first();
  if (await switchTarget.isVisible().catch(() => false)) {
    console.log('Found switch target, clicking...');
    await switchTarget.click();
    await p.waitForTimeout(4000);
  }

  const snap2 = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/fb_after_switch_click.png', Buffer.from(snap2.data, 'base64'));

  process.exit(0);
})();
