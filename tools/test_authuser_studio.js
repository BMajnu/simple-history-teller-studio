const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();
  
  console.log('Navigating with authuser=bmajnu980@gmail.com...');
  await page.goto('https://studio.youtube.com/?authuser=bmajnu980@gmail.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  
  console.log('Final URL:', page.url());
  const title = await page.title();
  console.log('Page Title:', title);
  
  await page.screenshot({ path: 'tools/studio_authuser_980.png' });
  
  const textSample = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h1, h2, h3, button, ytcp-button, [role="heading"]'))
      .map(el => (el.innerText || '').trim())
      .filter(t => t.length > 0 && t.length < 50);
  });
  console.log('Text elements:', textSample);
  await page.close();
})();
