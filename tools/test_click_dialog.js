const { chromium } = require('playwright-core');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const page = browser.contexts()[0].pages()[0];

    // Click "Create new dialog"
    const clicked = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('div, button')).find(el => el.innerText && el.innerText.trim().includes('Create new dialog'));
      if (card) {
        card.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Create new dialog:', clicked);
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'tools/after_create_dialog.png' });
    console.log('Saved tools/after_create_dialog.png');
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
