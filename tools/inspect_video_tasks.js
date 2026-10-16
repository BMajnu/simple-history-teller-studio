const { chromium } = require('playwright-core');

(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const p = b.contexts()[0].pages()[0];

  const taskSelect = p.locator('mat-select[aria-label="Video Task"]').first();
  if (await taskSelect.count() > 0) {
    await taskSelect.click();
    await p.waitForTimeout(500);
    const opts = await p.evaluate(() => Array.from(document.querySelectorAll('mat-option, [role="option"]')).map(o => o.innerText.trim()));
    console.log('Video Task options:', opts);
  } else {
    console.log('Video Task select not found.');
  }

  // Also check duration slider
  const durSlider = p.locator('mat-slider[aria-label*="duration"], [aria-label="Video duration in seconds"]').first();
  console.log('Duration slider count:', await durSlider.count());
})();
