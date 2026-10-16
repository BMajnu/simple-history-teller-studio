const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9225');
  const page = browser.contexts()[0].pages()[0];

  const clickInfo = await page.evaluate(() => {
    // Find dialog header containing "Create post"
    const dialogs = document.querySelectorAll('div[role="dialog"]');
    for (const d of dialogs) {
      if (d.innerText.includes('Create post')) {
        const closeBtn = d.querySelector('div[aria-label="Close"], [role="button"]');
        if (closeBtn) {
          const rect = closeBtn.getBoundingClientRect();
          return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, found: true };
        }
      }
    }
    // Fallback: look for the circle button at the top right of the modal
    // In screenshot, modal is approx x: 700 to 1200, y: 250 to 750
    // The X circle is at roughly x: 1180, y: 286
    const buttons = Array.from(document.querySelectorAll('div[role="button"]'));
    for (const b of buttons) {
      const rect = b.getBoundingClientRect();
      if (rect.x > 1150 && rect.x < 1220 && rect.y > 260 && rect.y < 310) {
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, found: true, direct: true };
      }
    }
    return { found: false };
  });

  console.log('Click info:', clickInfo);
  if (clickInfo.found) {
    console.log(`Clicking mouse at (${clickInfo.x}, ${clickInfo.y})...`);
    await page.mouse.click(clickInfo.x, clickInfo.y);
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tools/after_overlay_closed.png' });
  console.log('Saved tools/after_overlay_closed.png');

  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
