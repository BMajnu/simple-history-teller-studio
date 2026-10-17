const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

(async () => {
  console.log('=== SAVING HINDI COVER & SWITCHING TO BADIUZZAMAN MAJNU ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://www.facebook.com/profile.php?id=61595609815699', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // 1. Save Cover changes if visible
  const saveBtn = page.locator('div[role="button"]:has-text("Save changes"), [aria-label="Save changes"]').first();
  if (await saveBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Clicking Save changes button...');
    await saveBtn.click({ force: true });
    await page.waitForTimeout(4000);
  }

  const shot = path.join(ARTIFACT_DIR, 'fb_hi_cover_saved_clean.png');
  await page.screenshot({ path: shot });
  console.log('Saved clean shot:', shot);

  // 2. Switch back to personal profile Badiuzzaman Majnu
  console.log('Switching back to Badiuzzaman Majnu...');
  const avatar = page.locator('div[role="button"][aria-label*="Your profile"], div[role="button"][aria-label*="Controls"]').last();
  await avatar.click({ force: true });
  await page.waitForTimeout(2000);

  const switchItem = page.locator('div[role="button"]:has-text("Switch to Badiuzzaman"), div[aria-label*="Switch to Badiuzzaman"], span:has-text("Badiuzzaman Majnu"), div[role="button"]:has-text("Badiuzzaman Majnu")').first();
  if (await switchItem.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Clicking Switch to Badiuzzaman Majnu...');
    await switchItem.click({ force: true });
    await page.waitForTimeout(6000);
  }

  // 3. Verify Pages list
  await page.goto('https://www.facebook.com/pages/?category=your_pages', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const allThreeShot = path.join(ARTIFACT_DIR, 'fb_all_three_pages_live.png');
  await page.screenshot({ path: allThreeShot });
  console.log('Saved all three pages shot:', allThreeShot);

  const pageNames = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('span')).map(s => s.innerText.trim()).filter(t => t.includes('Simple History'));
  });
  console.log('Verified Pages in dashboard:', [...new Set(pageNames)]);

  await ctx.close();
  console.log('Done!');
})().catch(console.error);
