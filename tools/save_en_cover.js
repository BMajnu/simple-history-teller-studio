const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

(async () => {
  console.log('=== SAVING ENGLISH COVER PHOTO ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://www.facebook.com/profile.php?id=61595615845321', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const saveBtn = page.locator('div[role="button"]:has-text("Save changes"), [aria-label="Save changes"]').first();
  if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking Save changes button...');
    await saveBtn.click({ force: true });
    await page.waitForTimeout(5000);
  }

  const shot = path.join(ARTIFACT_DIR, 'fb_en_cover_saved_clean.png');
  await page.screenshot({ path: shot });
  console.log('Saved clean shot:', shot);

  await ctx.close();
  console.log('Done.');
})().catch(console.error);
