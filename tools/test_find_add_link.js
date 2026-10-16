const { chromium } = require('playwright-core');

const CHANNEL_ID = 'UCvEQdVnctkuYZw3iNDo5krg';

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  
  await page.goto(`https://studio.youtube.com/channel/${CHANNEL_ID}/editing/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // dismiss dialogs
  for (let i = 0; i < 3; i++) {
    try {
      const continueBtn = page.locator('#confirm-button, button:has-text("Continue"), ytcp-button:has-text("Continue")').first();
      if (await continueBtn.isVisible()) await continueBtn.click();
    } catch (e) {}
    try {
      await page.keyboard.press('Escape');
    } catch (e) {}
    await page.waitForTimeout(500);
  }

  // Find Add link button
  const addLinkBtn = page.locator('button.YtcpChannelLinksAddLinkButton, button:has-text("Add link")').first();
  console.log('Add link count:', await addLinkBtn.count());
  if (await addLinkBtn.count() > 0) {
    await addLinkBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tools/c1_add_link_found.png' });
    console.log('Scrolled to Add link button!');
  } else {
    // Screenshot whole page
    await page.screenshot({ path: 'tools/c1_full_page.png' });
  }

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
