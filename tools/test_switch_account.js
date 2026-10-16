const { chromium } = require('playwright-core');

async function switchAccount(page, targetEmail) {
  console.log(`\n=== SWITCHING TO ACCOUNT: ${targetEmail} ===`);
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const avatar = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);

  // Click Switch account
  const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("অ্যাকাউন্ট")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  // Click target account
  console.log(`Clicking account containing: ${targetEmail}...`);
  const targetItem = page.locator('ytd-account-item-renderer').filter({ hasText: targetEmail }).first();
  if (await targetItem.count() > 0) {
    await targetItem.click();
    console.log(`Clicked target item for ${targetEmail}`);
    await page.waitForTimeout(4000);
  } else {
    // Try any element containing the email
    const fallback = page.locator('#items, ytd-account-section-list-renderer').locator(`text=${targetEmail}`).first();
    await fallback.click();
    await page.waitForTimeout(4000);
  }

  console.log('Switched! Current URL:', page.url());
}

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  // Test switching to bmajnu9811@gmail.com
  await switchAccount(page, 'bmajnu9811@gmail.com');
  await page.screenshot({ path: 'tools/switched_to_9811.png' });

  // Now click avatar to see active account info
  const avatar = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'tools/active_account_menu_9811.png' });

  await page.close();
}

main().catch(console.error);
