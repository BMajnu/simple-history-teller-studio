const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  await page.goto('https://www.facebook.com/groups/852847715448660/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  const ta = page.locator('div[role="dialog"] textarea, div[role="dialog"] input[type="text"]').first();
  if (await ta.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Answering participation question...');
    await ta.fill('Mesopotamia and Ancient Egypt');
    await page.waitForTimeout(1000);

    const agreeCheck = page.locator('div[role="dialog"] input[type="checkbox"]').first();
    if (await agreeCheck.isVisible({ timeout: 2000 }).catch(() => false)) {
      await agreeCheck.check({ force: true });
    }

    const subBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Submit"), div[role="dialog"] button:has-text("Submit")').first();
    if (await subBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await subBtn.click({ force: true });
      await page.waitForTimeout(4000);
    }
  }

  await page.screenshot({ path: 'tools/fb_group_share_en_5_final.png' });
  fs.copyFileSync('tools/fb_group_share_en_5_final.png', path.join(ARTIFACT_DIR, 'fb_group_share_en_5.png'));
  console.log('Submitted and updated fb_group_share_en_5.png!');

  await ctx.close();
  process.exit(0);
})().catch(console.error);
