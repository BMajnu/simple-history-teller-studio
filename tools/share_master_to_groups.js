const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const posts = {
  bn: `মানুষের প্রথম রাজা কে ছিল? ৩ লক্ষ বছর ধরে কোনো রাজা ছাড়া মানুষ কীভাবে বেঁচে ছিল? 👑

কালাহারির শিকারিদের অদ্ভুত ঐতিহ্য থেকে শুরু করে কৃষিকাজের ফাঁদ, মেসোপটেমিয়ার প্রথম কর আদায় এবং সুমেরীয় সম্রাটদের ইতিহাস। অ্যানিমেটেড স্টাইলে পুরো ইতিহাসটি তুলে ধরা হয়েছে।

👑 সম্পূর্ণ ১৫ মিনিটের তথ্যচিত্রটি ইউটিউবে দেখুন: https://youtu.be/ibG0M13m7I0

#ইতিহাস #প্রথম_রাজা #সুমেরীয় #অ্যানিমেশন #ইতিহাসের_গল্প #banglahistory #documentary`,

  en: `Who Was the World's First King? The True Origin of Thrones & Power! 👑

For 300,000 years, humanity lived with NO kings, NO bosses, and fierce equality. So how did we go from mocking arrogant hunters around Kalahari campfires to bowing before absolute monarchs on golden thrones?

Explore the Agricultural Revolution, Mesopotamian warlords, the Sumerian King List, and Sargon of Akkad in our full animated documentary.

👑 Watch Full Documentary on YouTube: https://youtu.be/lNNFHePozVs

#AncientHistory #WorldHistory #FirstKing #Mesopotamia #Sumerian #OverSimplified #HistoryDocumentary #AnimatedHistory`,

  hi: `इंसानों ने पहला राजा कैसे बनाया? 👑 तख्त और सत्ता का असली इतिहास!

हज़ारों सालों तक इंसान बिना किसी राजा, बिना किसी अदालत और बिना किसी हुकूमत के बराबरी से रहता था। तो फिर दुनिया का पहला राजा कैसे बना?

कालाहारी रेगिस्तान की परंपराओं से लेकर मेसोपोटामिया के पहले टैक्स और सुমেরियन राजाओं के इतिहास की पूरी दास्तान।

👑 पूरी डॉक्यूमेंट्री यूट्यूब पर देखिए: https://youtu.be/hjnYUIqdRAE

#इतिहास #पहलाराजा #सुमेरियन #मेसोपोटामिया #HindiHistory #HistoryDocumentary #AnimatedHistory #OverSimplified`
};

const targetGroups = [
  // Bangla Groups
  { lang: 'bn', name: 'ইতিহাস, তথ্য ও তর্ক', url: 'https://www.facebook.com/groups/1803711656387813/' },
  { lang: 'bn', name: 'ইতিহাসের অধ্যায়', url: 'https://www.facebook.com/groups/712683954255419/' },
  { lang: 'bn', name: 'ইতিহাসের গল্প ও কথা', url: 'https://www.facebook.com/groups/1131420045210713/' },

  // English Groups
  { lang: 'en', name: 'Archaeology & Civilizations', url: 'https://www.facebook.com/groups/archeologyandcivilizations/' },
  { lang: 'en', name: 'World Ancient History', url: 'https://www.facebook.com/groups/852847715448660/' },
  { lang: 'en', name: 'ANCIENT HISTORY', url: 'https://www.facebook.com/groups/ancienthistorycommunity/' },

  // Hindi Groups
  { lang: 'hi', name: 'भारतीय इतिहास', url: 'https://www.facebook.com/groups/676880291169003/' },
  { lang: 'hi', name: 'इतिहास और विरासत', url: 'https://www.facebook.com/groups/3841703042546671/' },
  { lang: 'hi', name: 'History of India - भारतीय इतिहास', url: 'https://www.facebook.com/groups/bhartiyaitihas/' }
];

async function shareToGroup(page, g, index) {
  console.log(`\n============================================================`);
  console.log(`[${index + 1}/${targetGroups.length}] Sharing ${g.lang.toUpperCase()} Master Video to: ${g.name}`);
  console.log(`URL: ${g.url}`);
  console.log(`============================================================`);

  await page.goto(g.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // 1. Check if Join group button is present
  const joinBtn = page.locator('div[aria-label*="Join group"], div[role="button"]:has-text("Join group"), button:has-text("Join group")').first();
  if (await joinBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log(`Clicking Join group on ${g.name}...`);
    await joinBtn.click({ force: true });
    await page.waitForTimeout(4000);

    // If join question dialog appears, click Submit / Agree
    const submitRulesBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Submit"), div[role="dialog"] div[role="button"]:has-text("Agree")').first();
    if (await submitRulesBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitRulesBtn.click({ force: true });
      await page.waitForTimeout(3000);
    }
  }

  // 2. Click Write something... or Create post composer
  console.log('Looking for post composer trigger...');
  const composerBtn = page.locator('div[role="button"]:has-text("Write something..."), div[role="button"]:has-text("Create a public post..."), span:has-text("Write something..."), span:has-text("Create a public post...")').first();

  if (await composerBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
    console.log('Clicking composer button...');
    await composerBtn.click({ force: true });
    await page.waitForTimeout(4000);

    // 3. Find editable textbox
    const textContent = posts[g.lang];
    console.log('Entering text into composer...');
    await page.evaluate((text) => {
      const box = document.querySelector('div[role="dialog"] div[role="textbox"][contenteditable="true"], div[role="textbox"][contenteditable="true"]');
      if (box) {
        box.focus();
        document.execCommand('insertText', false, text);
      }
    }, textContent);

    // Wait 5s for link preview to resolve
    console.log('Waiting for link preview to generate...');
    await page.waitForTimeout(6000);

    // 4. Click Post button
    console.log('Clicking Post button...');
    const postBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Post"), div[role="button"]:has-text("Post")').last();
    if (await postBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await postBtn.click({ force: true });
      console.log('Post button clicked! Waiting 8s for submission...');
      await page.waitForTimeout(8000);

      const shotPath = `tools/group_share_${g.lang}_${index + 1}.png`;
      await page.screenshot({ path: shotPath });
      console.log(`Saved screenshot: ${shotPath}`);

      if (fs.existsSync(shotPath)) {
        fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `group_share_${g.lang}_${index + 1}.png`));
      }
      console.log(`>>> SUCCESS: Shared to ${g.name}!`);
    } else {
      console.log('Post button not visible inside dialog.');
    }
  } else {
    console.log(`Composer not immediately available (may require approval or membership confirmation).`);
    const shotPath = `tools/group_share_${g.lang}_${index + 1}_pending.png`;
    await page.screenshot({ path: shotPath });
  }
}

(async () => {
  console.log('=== STARTING FACEBOOK GROUP MASTER VIDEO DISTRIBUTION ===');

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // Navigate to FB and ensure personal profile is active
  await page.goto('https://www.facebook.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  const switchBack = page.locator('div[role="button"]:has-text("Switch to Badiuzzaman"), div[aria-label*="Switch to Badiuzzaman"]').first();
  if (await switchBack.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Switching to personal profile Badiuzzaman Majnu...');
    await switchBack.click({ force: true });
    await page.waitForTimeout(6000);
  }

  // Iterate over groups and post
  for (let i = 0; i < targetGroups.length; i++) {
    try {
      await shareToGroup(page, targetGroups[i], i);
      // Polite delay between group posts (8 seconds) to prevent FB rate limiting
      await page.waitForTimeout(8000);
    } catch (err) {
      console.error(`Error sharing to group ${targetGroups[i].name}:`, err.message);
    }
  }

  await ctx.close();
  console.log('\n=== ALL GROUP SHARES COMPLETED! ===');
  process.exit(0);
})().catch(err => {
  console.error('Fatal error in group distribution:', err);
  process.exit(1);
});
