const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9225');
  const page = browser.contexts()[0].pages()[0];

  const modalSwitchBtn = page.locator('div[aria-label="Switch profiles"] div[role="button"]:has-text("Switch"), div[aria-label="Switch profiles"] button:has-text("Switch"), div[role="dialog"] div[role="button"]:has-text("Switch")').first();
  if (await modalSwitchBtn.isVisible().catch(() => false)) {
    console.log('Clicking modal Switch button...');
    await modalSwitchBtn.click();
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: 'tools/after_switch_state.png' });
  console.log('Saved tools/after_switch_state.png. Title:', await page.title());
  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
