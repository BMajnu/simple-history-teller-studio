const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function signInAccount(email, password, index) {
  console.log(`Attempting to sign in account: ${email}...`);
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  // Navigate to Google account chooser for AI Studio
  await page.goto('https://accounts.google.com/AccountChooser?continue=https://aistudio.google.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Check if "Use another account" / "অন্য একটি অ্যাকাউন্ট ব্যবহার করুন" is present
  const useOther = page.locator('text="অন্য একটি অ্যাকাউন্ট ব্যবহার করুন", text="Use another account"').first();
  if (await useOther.isVisible().catch(() => false)) {
    console.log('Clicking "Use another account"...');
    await useOther.click();
    await page.waitForTimeout(2000);
  }

  // Type email
  const emailInput = page.locator('input[type="email"], input[name="identifier"]').first();
  if (await emailInput.isVisible().catch(() => false)) {
    console.log('Entering email...');
    await emailInput.fill(email);
    await page.waitForTimeout(500);

    const nextBtn = page.locator('button:has-text("Next"), button:has-text("পরবর্তী"), #identifierNext').first();
    await nextBtn.click();
    await page.waitForTimeout(3000);
  }

  // Check password
  const passInput = page.locator('input[type="password"], input[name="Passwd"]').first();
  if (await passInput.isVisible().catch(() => false)) {
    console.log('Entering password...');
    await passInput.fill(password);
    await page.waitForTimeout(500);

    const passNext = page.locator('button:has-text("Next"), button:has-text("পরবর্তী"), #passwordNext').first();
    await passNext.click();
    await page.waitForTimeout(5000);
  }

  const shot = await page.screenshot({ type: 'png' });
  const shotPath = path.join(__dirname, `signin_account_${index}_result.png`);
  fs.writeFileSync(shotPath, shot);
  console.log(`Saved screenshot to: ${shotPath}`);
  console.log('Current URL:', page.url());
}

// Test with Account 1: bmajnu980@gmail.com
signInAccount('bmajnu980@gmail.com', '***REMOVED***', 1).catch(console.error);
