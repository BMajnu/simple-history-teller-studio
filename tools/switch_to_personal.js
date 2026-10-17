const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

(async () => {
  console.log('=== SWITCHING TO PERSONAL PROFILE ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Click top right avatar
  console.log('Clicking top right profile icon...');
  const avatar = page.locator('div[role="button"][aria-label*="Your profile"], div[role="button"][aria-label*="Account Controls"]').last();
  await avatar.click({ force: true });
  await page.waitForTimeout(2500);

  const menuShot = path.join(ARTIFACT_DIR, 'fb_switch_menu.png');
  await page.screenshot({ path: menuShot });
  console.log('Saved:', menuShot);

  // Check for "See all profiles" or "Switch to Badiuzzaman Majnu"
  const switchItem = page.locator('div[role="button"]:has-text("Switch to Badiuzzaman"), div[aria-label*="Switch to Badiuzzaman"], span:has-text("Badiuzzaman Majnu"), div[role="button"]:has-text("Badiuzzaman Majnu")').first();
  if (await switchItem.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Clicking Switch item...');
    await switchItem.click({ force: true });
    await page.waitForTimeout(7000);
  } else {
    const seeAllProfiles = page.locator('span:has-text("See all profiles"), div[role="button"]:has-text("See all profiles")').first();
    if (await seeAllProfiles.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Clicking See all profiles...');
      await seeAllProfiles.click({ force: true });
      await page.waitForTimeout(2000);

      const personalItem = page.locator('div[role="button"]:has-text("Badiuzzaman Majnu"), span:has-text("Badiuzzaman Majnu")').first();
      if (await personalItem.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('Clicking Badiuzzaman Majnu in list...');
        await personalItem.click({ force: true });
        await page.waitForTimeout(7000);
      }
    }
  }

  const afterSwitchShot = path.join(ARTIFACT_DIR, 'fb_after_switch_personal.png');
  await page.screenshot({ path: afterSwitchShot });
  console.log('Saved:', afterSwitchShot);

  await ctx.close();
  console.log('Switch complete.');
})().catch(console.error);
