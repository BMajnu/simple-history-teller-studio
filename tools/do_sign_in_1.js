const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function doSignIn() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  console.log('Entering email bmajnu980@gmail.com...');
  const emailInput = page.locator('input[type="email"], input[name="identifier"]').first();
  await emailInput.fill('bmajnu980@gmail.com');
  await page.waitForTimeout(500);

  const nextBtn = page.locator('button:has-text("পরবর্তী"), button:has-text("Next"), #identifierNext').first();
  await nextBtn.click();
  await page.waitForTimeout(3500);

  // Check for password
  const passInput = page.locator('input[type="password"], input[name="Passwd"]').first();
  if (await passInput.isVisible().catch(() => false)) {
    console.log('Entering password...');
    await passInput.fill('***REMOVED***');
    await page.waitForTimeout(500);

    const passNext = page.locator('button:has-text("পরবর্তী"), button:has-text("Next"), #passwordNext').first();
    await passNext.click();
    await page.waitForTimeout(6000);
  }

  const shot = await page.screenshot({ type: 'png' });
  const shotPath = path.join(__dirname, 'after_account1_signin.png');
  fs.writeFileSync(shotPath, shot);
  console.log('Saved after_account1_signin.png, current URL:', page.url());
}

doSignIn().catch(console.error);
