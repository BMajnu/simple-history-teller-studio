const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function doSignIn3() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  console.log('Navigating to AddSession for Account 3...');
  await page.goto('https://accounts.google.com/AddSession?continue=https://aistudio.google.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  console.log('Entering email badiuzzaman.majnu123@gmail.com...');
  const emailInput = page.locator('input[type="email"], input[name="identifier"]').first();
  await emailInput.fill('badiuzzaman.majnu123@gmail.com');
  await page.waitForTimeout(500);

  const nextBtn = page.locator('button:has-text("পরবর্তী"), button:has-text("Next"), #identifierNext').first();
  await nextBtn.click();
  await page.waitForTimeout(3500);

  // Password
  const passInput = page.locator('input[type="password"], input[name="Passwd"]').first();
  if (await passInput.isVisible().catch(() => false)) {
    console.log('Entering password...');
    await passInput.fill('***REMOVED***');
    await page.waitForTimeout(500);

    const passNext = page.locator('button:has-text("পরবর্তী"), button:has-text("Next"), #passwordNext').first();
    await passNext.click();
    await page.waitForTimeout(6000);
  }

  // Check if selfie verification or other prompt appears
  if (page.url().includes('selfie') || page.url().includes('verification')) {
    console.log('Handling verification skip...');
    const notNow = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('a, button, span')).find(e => e.innerText && e.innerText.trim() === 'এখন না');
      if (el) { el.click(); return true; }
      return false;
    });
    await page.waitForTimeout(3000);
  }

  const shot = await page.screenshot({ type: 'png' });
  const shotPath = path.join(__dirname, 'after_account3_signin.png');
  fs.writeFileSync(shotPath, shot);
  console.log('Saved after_account3_signin.png, current URL:', page.url());
}

doSignIn3().catch(console.error);
