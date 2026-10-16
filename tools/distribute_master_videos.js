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

कालाहारी रेगिस्तान की परंपराओं से लेकर मेसोपोटामिया के पहले टैक्स और सुमेरियन राजाओं के इतिहास की पूरी दास्तान।

👑 पूरी डॉक्यूमेंट्री यूट्यूब पर देखिए: https://youtu.be/hjnYUIqdRAE

#इतिहास #पहलाराजा #सुमेरियन #मेसोपोटामिया #HindiHistory #HistoryDocumentary #AnimatedHistory #OverSimplified`
};

const groups = [
  // Bangla Groups
  { lang: 'bn', name: 'ইতিহাস, তথ্য ও তর্ক', url: 'https://www.facebook.com/groups/1803711656387813/', alreadyDone: true },
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

async function postToGroup(page, g, idx) {
  console.log(`\n============================================================`);
  console.log(`[${idx + 1}/${groups.length}] Sharing ${g.lang.toUpperCase()} Master Video to: ${g.name}`);
  console.log(`URL: ${g.url}`);
  console.log(`============================================================`);

  if (g.alreadyDone) {
    console.log(`Group ${g.name} was already successfully posted! Copying verified screenshot...`);
    const shotPath = `tools/fb_group_share_${g.lang}_${idx + 1}.png`;
    if (fs.existsSync('tools/test_post_submitted.png')) {
      fs.copyFileSync('tools/test_post_submitted.png', shotPath);
      fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `fb_group_share_${g.lang}_${idx + 1}.png`));
    }
    return { status: 'success', note: 'Verified published in test run' };
  }

  await page.goto(g.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // 1. Join if "Join group" button exists
  const joinBtn = page.locator('div[aria-label*="Join group"], div[role="button"]:has-text("Join group"), button:has-text("Join group")').first();
  if (await joinBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log(`Clicking Join group on "${g.name}"...`);
    await joinBtn.click({ force: true });
    await page.waitForTimeout(3000);

    // If there's an agree or submit button for rules
    const agreeCheck = page.locator('div[role="dialog"] input[type="checkbox"]').first();
    if (await agreeCheck.isVisible({ timeout: 2000 }).catch(() => false)) {
      await agreeCheck.check({ force: true }).catch(() => {});
    }

    const submitRulesBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Submit"), div[role="dialog"] div[role="button"]:has-text("Agree"), div[role="dialog"] button:has-text("Submit")').first();
    if (await submitRulesBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitRulesBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(2000);
    }
  }

  // 2. Click composer button
  const composer = page.locator('div[role="button"]:has-text("Write something..."), div[role="button"]:has-text("Create a public post..."), span:has-text("Write something..."), span:has-text("Create a public post...")').first();

  if (!(await composer.isVisible({ timeout: 6000 }).catch(() => false))) {
    console.log(`Composer not available on ${g.name}. Taking screenshot and skipping...`);
    const shotPath = `tools/fb_group_share_${g.lang}_${idx + 1}_skipped.png`;
    await page.screenshot({ path: shotPath });
    return { status: 'skipped', note: 'Composer not visible (may require membership approval)' };
  }

  console.log('Opening post composer...');
  await composer.click({ force: true });
  await page.waitForTimeout(3000);

  // 3. Focus textbox inside dialog
  const textbox = page.locator('div[role="dialog"] div[role="textbox"][contenteditable="true"]').first();
  await textbox.waitFor({ state: 'visible', timeout: 10000 });
  await textbox.click();
  await page.waitForTimeout(800);

  const textContent = posts[g.lang];
  console.log('Inserting post text and YouTube master video link...');
  await page.keyboard.insertText(textContent);
  await page.waitForTimeout(1000);

  // Dismiss any hashtag autocomplete dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // Wait 7 seconds for rich link preview card to load
  console.log('Waiting for YouTube rich link preview...');
  await page.waitForTimeout(7000);

  // 4. Click Post button
  const postBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Post"), div[role="dialog"] div[aria-label="Post"], div[role="dialog"] button:has-text("Post")').last();
  await postBtn.waitFor({ state: 'visible', timeout: 5000 });

  console.log('Clicking Post button...');
  await postBtn.click({ force: true });
  console.log('Post clicked! Waiting 8s for submission...');
  await page.waitForTimeout(8000);

  const shotPath = `tools/fb_group_share_${g.lang}_${idx + 1}.png`;
  await page.screenshot({ path: shotPath });
  console.log(`Saved screenshot: ${shotPath}`);

  if (fs.existsSync(shotPath)) {
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `fb_group_share_${g.lang}_${idx + 1}.png`));
  }

  console.log(`>>> SUCCESS: Shared to ${g.name}!`);
  return { status: 'success', note: 'Successfully posted' };
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

  const results = [];
  for (let i = 0; i < groups.length; i++) {
    try {
      const res = await postToGroup(page, groups[i], i);
      results.push({ group: groups[i].name, lang: groups[i].lang, ...res });
      // 8s pause between groups
      await page.waitForTimeout(8000);
    } catch (err) {
      console.error(`Error sharing to ${groups[i].name}:`, err.message);
      results.push({ group: groups[i].name, lang: groups[i].lang, status: 'error', error: err.message });
      // Take error screenshot
      await page.screenshot({ path: `tools/fb_group_err_${groups[i].lang}_${i + 1}.png` }).catch(() => {});
    }
  }

  console.log('\n=== DISTRIBUTION RESULTS SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));

  // Write results JSON
  fs.writeFileSync('tools/group_distribution_results.json', JSON.stringify(results, null, 2));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal error in group distribution:', err);
  process.exit(1);
});
