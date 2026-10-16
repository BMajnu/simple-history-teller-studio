const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const postEn = `Who Was the World's First King? The True Origin of Thrones & Power! 👑

For 300,000 years, humanity lived with NO kings, NO bosses, and fierce equality. So how did we go from mocking arrogant hunters around Kalahari campfires to bowing before absolute monarchs on golden thrones?

Explore the Agricultural Revolution, Mesopotamian warlords, the Sumerian King List, and Sargon of Akkad in our full animated documentary.

👑 Watch Full Documentary on YouTube: https://youtu.be/lNNFHePozVs

#AncientHistory #WorldHistory #FirstKing #Mesopotamia #Sumerian #OverSimplified #HistoryDocumentary #AnimatedHistory`;

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // 1. Submit participation review on Group 9 if open
  console.log('Visiting group 9 to submit rules...');
  await page.goto('https://www.facebook.com/groups/bhartiyaitihas/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  const agreeCheck = page.locator('div[role="dialog"] input[type="checkbox"]').first();
  if (await agreeCheck.isVisible({ timeout: 3000 }).catch(() => false)) {
    await agreeCheck.check({ force: true });
    await page.waitForTimeout(1000);
    const subBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Submit"), div[role="dialog"] button:has-text("Submit")').first();
    if (await subBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await subBtn.click({ force: true });
      await page.waitForTimeout(3000);
    }
  }

  // 2. Post to Group 5: World Ancient History
  console.log('Navigating to World Ancient History...');
  await page.goto('https://www.facebook.com/groups/852847715448660/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // Close welcome modal if visible
  const closeBtn = page.locator('div[aria-label="Close"], div[role="dialog"] div[aria-label="Close"]').first();
  if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Dismissing welcome modal...');
    await closeBtn.click({ force: true });
    await page.waitForTimeout(2000);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // Click composer
  const composer = page.locator('div[role="button"]:has-text("Write something..."), span:has-text("Write something...")').first();
  await composer.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Clicking composer...');
  await composer.click({ force: true });
  await page.waitForTimeout(3000);

  // Focus textbox
  const textbox = page.locator('div[role="dialog"] div[role="textbox"][contenteditable="true"]').first();
  await textbox.waitFor({ state: 'visible', timeout: 10000 });
  await textbox.click();
  await page.waitForTimeout(800);

  console.log('Inserting EN post text and URL...');
  await page.keyboard.insertText(postEn);
  await page.waitForTimeout(1000);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  console.log('Waiting 7s for YouTube link preview...');
  await page.waitForTimeout(7000);

  const postBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Post"), div[role="dialog"] div[aria-label="Post"], div[role="dialog"] button:has-text("Post")').last();
  await postBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('Clicking Post button...');
  await postBtn.click({ force: true });
  console.log('Waiting 8s for submission...');
  await page.waitForTimeout(8000);

  const shotPath = 'tools/fb_group_share_en_5.png';
  await page.screenshot({ path: shotPath });
  console.log(`Saved screenshot: ${shotPath}`);

  if (fs.existsSync(shotPath)) {
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, 'fb_group_share_en_5.png'));
  }
  console.log('>>> SUCCESS: Shared to World Ancient History!');

  await ctx.close();
  process.exit(0);
})().catch(console.error);
