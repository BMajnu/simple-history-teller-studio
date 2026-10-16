const { chromium } = require('playwright-core');

async function cleanupTabs() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const pages = context.pages();
  console.log('Total open pages:', pages.length);
  
  // Keep only the first page and close the rest
  for (let i = 1; i < pages.length; i++) {
    try {
      await pages[i].close();
      console.log(`Closed page ${i}`);
    } catch (e) {}
  }
  
  // On the remaining page, press Escape to clear any modal
  if (pages[0]) {
    await pages[0].keyboard.press('Escape');
    console.log('Pressed Escape on main page.');
  }
}

cleanupTabs().catch(console.error);
