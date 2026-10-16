const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const page = browser.contexts()[0].pages()[0];
    console.log('Current page URL:', page.url());
    
    // Check if voice chip exists
    const chip = page.locator('button.voice-chip, button.voice-playground-chip').first();
    console.log('Chip count:', await chip.count());
    if (await chip.count() > 0) {
      console.log('Current chip text:', await chip.innerText());
      await chip.click();
      await page.waitForTimeout(1000);

      const searchInput = page.locator('input[placeholder*="Search"], input[aria-label*="Search"]').first();
      console.log('Search input count:', await searchInput.count());
      if (await searchInput.count() > 0) {
        await searchInput.fill('Puck');
        await page.waitForTimeout(600);
      }

      // Find Puck button
      const puckBtn = page.locator('button:has-text("Puck"), [role="button"]:has-text("Puck")').first();
      console.log('Puck button count:', await puckBtn.count());
      if (await puckBtn.count() > 0) {
        await puckBtn.click();
        await page.waitForTimeout(500);
        console.log('Clicked Puck!');
      }

      // Close panel if needed
      const closeBtn = page.locator('button[aria-label="Close panel"], button:has-text("Done"), button.close-button').first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await page.waitForTimeout(500);
      }

      console.log('Voice chip after selection:', await chip.innerText());
      await page.screenshot({ path: 'tools/after_puck_select.png' });
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
