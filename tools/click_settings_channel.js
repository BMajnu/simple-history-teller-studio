const { chromium } = require('playwright-core');

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('editing')) || context.pages()[0];
  
  const ch = page.locator('span.title-text:has-text("Channel"), ytcp-navigation span:has-text("Channel")').first();
  console.log('Channel count:', await ch.count());
  await ch.click();
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'tools/settings_channel_clicked.png' });
  console.log('Screenshot saved to tools/settings_channel_clicked.png');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
