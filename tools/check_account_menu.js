const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();
  await page.goto('https://aistudio.google.com/prompts/new_chat', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  const profileBtn = page.locator('button[aria-label*="account"], button:has-text("PRO"), button:has-text("badiuzzaman")').first();
  if (await profileBtn.count() > 0) {
    console.log('Clicking profile button:', await profileBtn.innerText());
    await profileBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tools/account_menu_open.png' });
    console.log('Saved tools/account_menu_open.png');
    
    const menuItems = await page.locator('[role="menuitem"], .mat-menu-item, button').allInnerTexts();
    console.log('Menu items:', menuItems.filter(t => t.includes('@')));
  }
  await page.close();
}

main().catch(console.error);
