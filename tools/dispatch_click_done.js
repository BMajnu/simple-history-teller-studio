const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('convert_to_professional_account'));
  if (!p) {
    console.log('No convert page found');
    process.exit(1);
  }

  // Get bounding rect of the Done button
  const rect = await p.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Done');
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height };
  });
  console.log('Done button rect:', rect);

  if (rect) {
    console.log(`Clicking at (${rect.x}, ${rect.y})...`);
    await p.mouse.move(rect.x, rect.y);
    await p.mouse.down();
    await p.waitForTimeout(100);
    await p.mouse.up();
  }

  // Also dispatch synthetic events
  await p.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Done');
    if (btn) {
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });

  await p.waitForTimeout(6000);
  console.log('URL now:', p.url());
  const bodyText = await p.evaluate(() => document.body.innerText.slice(0, 400));
  console.log('Body text now:', bodyText);

  process.exit(0);
})();
