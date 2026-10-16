const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function testMultiTab() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const pages = context.pages();
  console.log('Total open pages:', pages.length);
  for (let i = 0; i < pages.length; i++) {
    console.log(`Page ${i}: ${pages[i].url()} | Title: ${await pages[i].title()}`);
  }
  
  // Look at page 0
  const page0 = pages[0];
  const shot = await page0.screenshot({ type: 'png' });
  const shotPath = path.join(__dirname, 'page0_inspect.png');
  fs.writeFileSync(shotPath, shot);
  console.log('Saved page 0 screenshot to', shotPath);
}

testMultiTab().catch(console.error);
