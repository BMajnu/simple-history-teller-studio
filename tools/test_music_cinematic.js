const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function testCinematicClick() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const pages = context.pages();
  const musicPage = pages.find(p => p.url().includes('new_music')) || pages[pages.length - 1];
  
  console.log('Clicking Cinematic Score on', musicPage.url());
  const cinematicCard = musicPage.locator('text="Cinematic Score"').first();
  await cinematicCard.click();
  await musicPage.waitForTimeout(3000);
  
  const shot = await musicPage.screenshot({ type: 'png' });
  const shotPath = path.join(__dirname, 'aistudio_music_cinematic_clicked.png');
  fs.writeFileSync(shotPath, shot);
  console.log('Saved screenshot after clicking Cinematic Score to', shotPath);
}

testCinematicClick().catch(console.error);
