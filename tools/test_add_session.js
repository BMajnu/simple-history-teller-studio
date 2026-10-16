const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function testAddSession() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  console.log('Navigating to AddSession URL...');
  await page.goto('https://accounts.google.com/AddSession?continue=https://aistudio.google.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const shot = await page.screenshot({ type: 'png' });
  const shotPath = path.join(__dirname, 'add_session_landing.png');
  fs.writeFileSync(shotPath, shot);
  console.log('Saved add_session_landing.png, URL:', page.url());
}

testAddSession().catch(console.error);
