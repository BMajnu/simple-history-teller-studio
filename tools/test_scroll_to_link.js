const { chromium } = require('playwright-core');

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('editing')) || context.pages()[0];
  await page.bringToFront();

  const addLinkBtn = page.locator('button.YtcpChannelLinksAddLinkButton, button:has-text("Add link")').first();
  console.log('Add link btn count:', await addLinkBtn.count());
  if (await addLinkBtn.count() > 0) {
    await addLinkBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tools/c1_add_link_visible.png' });
    console.log('Scrolled to Add link button successfully!');
  }

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
