const { chromium } = require('playwright-core');

async function main() {
  console.log('--- COMPLETING LOGIN FOR bmajnu981@gmail.com ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();
  
  await page.goto('https://accounts.google.com/AddSession?service=youtube&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  // Check if already prompted for password or email
  const passInput = page.locator('input[type="password"], input[name="Passwd"]').first();
  const emailInput = page.locator('input#identifierId, input[name="identifier"], input[type="email"]').first();
  
  if (await emailInput.count() > 0 && await emailInput.isVisible()) {
    console.log('Filling email...');
    await emailInput.fill('bmajnu981@gmail.com');
    await page.waitForTimeout(500);
    const nextBtn = page.locator('#identifierNext button, button:has-text("পরবর্তী"), button:has-text("Next")').first();
    await nextBtn.click();
    await page.waitForTimeout(3000);
  }
  
  if (await passInput.count() > 0 && await passInput.isVisible()) {
    console.log('Filling password...');
    await passInput.fill('***REMOVED***');
    await page.waitForTimeout(500);
    const passNext = page.locator('#passwordNext button, button:has-text("পরবর্তী"), button:has-text("Next")').first();
    await passNext.click();
    await page.waitForTimeout(5000);
  }
  
  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'tools/post_login_check.png' });
  
  // Check for "এখন না" (Not now)
  const notNowBtn = page.locator('button:has-text("এখন না"), a:has-text("এখন না"), button:has-text("Not now")').first();
  if (await notNowBtn.count() > 0 && await notNowBtn.isVisible()) {
    console.log('Found "এখন না" button, clicking...');
    await notNowBtn.click();
    await page.waitForTimeout(5000);
  }
  
  console.log('Final URL after handling prompt:', page.url());
  await page.screenshot({ path: 'tools/final_login_check.png' });
  await page.close();
}

main().catch(console.error);
