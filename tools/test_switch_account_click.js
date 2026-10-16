const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();
  await page.goto('https://aistudio.google.com/prompts/new_chat', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  const profileBtn = page.locator('button[aria-label*="account"], button:has-text("PRO")').first();
  await profileBtn.click();
  await page.waitForTimeout(1000);

  const switchBtn = page.locator('button:has-text("Switch account")').first();
  if (await switchBtn.count() > 0) {
    console.log('Clicking Switch account...');
    await switchBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tools/after_switch_click.png' });
    console.log('Saved tools/after_switch_click.png');
    console.log('Current URL:', page.url());
  }
  await page.close();
}

main().catch(console.error);
