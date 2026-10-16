const { chromium } = require('playwright-core');

async function main() {
  console.log('--- SWITCHING TO bmajnu980@gmail.com ON YOUTUBE ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();
  
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  const avatar = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);
  
  // Click switch account
  const switchBtn = page.locator('ytd-compact-link-renderer').filter({ hasText: 'Account' }).or(page.locator('ytd-compact-link-renderer').filter({ hasText: 'অ্যাকাউন্ট' })).nth(1);
  await switchBtn.click();
  await page.waitForTimeout(2000);
  
  // Click bmajnu980@gmail.com
  console.log('Looking for bmajnu980@gmail.com item...');
  const targetAcc = page.locator('ytd-account-item-renderer, ytd-compact-link-renderer, #content').filter({ hasText: 'bmajnu980@gmail.com' }).first();
  await targetAcc.click();
  await page.waitForTimeout(4000);
  
  console.log('Switched! Current URL:', page.url());
  await page.screenshot({ path: 'tools/switched_bmajnu980.png' });
  
  // Now navigate to YouTube channel creation / studio
  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  console.log('Studio URL:', page.url());
  await page.screenshot({ path: 'tools/studio_bmajnu980.png' });
  
  await page.close();
}

main().catch(console.error);
