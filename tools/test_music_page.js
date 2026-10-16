const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function testMusicPage() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  console.log('Navigating to AI Studio Music...');
  await page.goto('https://aistudio.google.com/app/new_music?model=lyria-3.5', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  
  const shot = await page.screenshot({ type: 'png' });
  const shotPath = path.join(__dirname, 'aistudio_music_inspect.png');
  fs.writeFileSync(shotPath, shot);
  console.log('Saved music screenshot to', shotPath);
  console.log('Page title:', await page.title());
  console.log('Page URL:', page.url());
}

testMusicPage().catch(console.error);
