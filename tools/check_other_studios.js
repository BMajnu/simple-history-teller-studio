const { chromium } = require('playwright-core');

async function test(email, shotName) {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();
  console.log(`Checking ${email}...`);
  await page.goto(`https://studio.youtube.com/?authuser=${email}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  console.log(`${email} URL:`, page.url());
  const title = await page.title();
  console.log(`${email} Title:`, title);
  await page.screenshot({ path: `tools/${shotName}.png` });
  await page.close();
}

async function main() {
  await test('bmajnu981@gmail.com', 'studio_bmajnu981');
  await test('bmajnu9811@gmail.com', 'studio_bmajnu9811');
}

main().catch(console.error);
