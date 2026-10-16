const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const posts = {
  en: `Who Was the World's First King? The True Origin of Thrones & Power! 👑

For 300,000 years, humanity lived with NO kings, NO bosses, and fierce equality. So how did we go from mocking arrogant hunters around Kalahari campfires to bowing before absolute monarchs on golden thrones?

Explore the Agricultural Revolution, Mesopotamian warlords, the Sumerian King List, and Sargon of Akkad in our full animated documentary.

👑 Watch Full Documentary on YouTube: https://youtu.be/lNNFHePozVs

#AncientHistory #WorldHistory #FirstKing #Mesopotamia #Sumerian #OverSimplified #HistoryDocumentary #AnimatedHistory`,

  hi: `इंसानों ने पहला राजा कैसे बनाया? 👑 तख्त और सत्ता का असली इतिहास!

हज़ारों सालों तक इंसान बिना किसी राजा, बिना किसी अदालत और बिना किसी हुकूमत के बराबरी से रहता था। तो फिर दुनिया का पहला राजा कैसे बना?

कालाहारी रेगिस्तान की परंपराओं से लेकर मेसोपोटामिया के पहले टैक्स और सुमेरियन राजाओं के इतिहास की पूरी दास्तान।

👑 पूरी डॉक्यूमेंट्री यूट्यूब पर देखिए: https://youtu.be/hjnYUIqdRAE

#इतिहास #पहलाराजा #सुमेरियन #मेसोपोटामिया #HindiHistory #HistoryDocumentary #AnimatedHistory #OverSimplified`
};

const remainingGroups = [
  { idx: 4, lang: 'en', name: 'World Ancient History', url: 'https://www.facebook.com/groups/852847715448660/' },
  { idx: 8, lang: 'hi', name: 'History of India - भारतीय इतिहास', url: 'https://www.facebook.com/groups/bhartiyaitihas/' }
];

async function postClean(page, g) {
  console.log(`\nNavigating to ${g.name} (${g.url})...`);
  await page.goto(g.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);

  // Scroll down slightly so composer is fully in view
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.waitForTimeout(1000);

  // Click composer: find the Write something button
  const composer = page.locator('div[role="button"]:has-text("Write something..."), div[role="button"]:has-text("Create a public post..."), span:has-text("Write something..."), span:has-text("Create a public post...")').first();
  await composer.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Clicking composer...');
  await composer.click({ force: true });
  await page.waitForTimeout(3000);

  // Focus textbox
  const textbox = page.locator('div[role="dialog"] div[role="textbox"][contenteditable="true"]').first();
  await textbox.waitFor({ state: 'visible', timeout: 10000 });
  await textbox.click();
  await page.waitForTimeout(800);

  console.log('Inserting text and master video URL...');
  await page.keyboard.insertText(posts[g.lang]);
  await page.waitForTimeout(1000);

  // Dismiss hashtag popup
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // Wait 7 seconds for link preview
  console.log('Waiting 7s for YouTube link preview...');
  await page.waitForTimeout(7000);

  // Click Post
  const postBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Post"), div[role="dialog"] div[aria-label="Post"], div[role="dialog"] button:has-text("Post")').last();
  await postBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('Clicking Post button...');
  await postBtn.click({ force: true });
  console.log('Waiting 8s for submission...');
  await page.waitForTimeout(8000);

  const shotPath = `tools/fb_group_share_${g.lang}_${g.idx + 1}.png`;
  await page.screenshot({ path: shotPath });
  console.log(`Saved screenshot: ${shotPath}`);

  if (fs.existsSync(shotPath)) {
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `fb_group_share_${g.lang}_${g.idx + 1}.png`));
  }
  console.log(`>>> SUCCESS: Shared to ${g.name}!`);
}

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  for (const g of remainingGroups) {
    try {
      await postClean(page, g);
      await page.waitForTimeout(8000);
    } catch (err) {
      console.error(`Error sharing to ${g.name}:`, err.message);
      await page.screenshot({ path: `tools/fb_group_retry_err_${g.lang}_${g.idx + 1}.png` }).catch(() => {});
    }
  }

  await ctx.close();
  process.exit(0);
})().catch(console.error);
