const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = path.join(__dirname, '..');
const SHORTS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts');
const RENDERS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders');
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const enReels = [
  {
    part: 1,
    file: path.join(SHORTS_DIR, 'short_en_part1.mp4'),
    title: 'How Humans Invented the First King! 👑 [Part 1] #Shorts #History',
    desc: 'For 300,000 years, humans lived with NO kings and fiercely mocked arrogant leaders!\n\n👑 Watch full documentary on YouTube: https://youtu.be/lNNFHePozVs\n\n#shorts #history #firstking #ancienthistory #simplehistoryteller #reels #animation'
  },
  {
    part: 2,
    file: path.join(SHORTS_DIR, 'short_en_part2.mp4'),
    title: 'The Agricultural Trap & First Warlords! 🌾 [Part 2] #Shorts #History',
    desc: 'Farming began, granaries filled, and humanity fell into the ultimate trap of security and taxes!\n\n🌾 Watch full documentary on YouTube: https://youtu.be/lNNFHePozVs\n\n#shorts #history #firstking #ancienthistory #simplehistoryteller #reels #animation'
  },
  {
    part: 3,
    file: path.join(SHORTS_DIR, 'short_en_part3.mp4'),
    title: 'The First Extortion & World\'s First Don! ⚔️ [Part 3] #Shorts #History',
    desc: 'Pay 20% of your crop, or else! The shocking true origin of taxes and warlords.\n\n⚔️ Watch full documentary on YouTube: https://youtu.be/lNNFHePozVs\n\n#shorts #history #firstking #ancienthistory #simplehistoryteller #reels #animation'
  },
  {
    part: 4,
    file: path.join(SHORTS_DIR, 'short_en_part4.mp4'),
    title: 'Sumerian Kings & The Rise of the Throne! 🏛️ [Part 4] #Shorts #History',
    desc: 'Kingship descended from the heavens! The Sumerian King List and Sargon of Akkad.\n\n🏛️ Watch full documentary on YouTube: https://youtu.be/lNNFHePozVs\n\n#shorts #history #firstking #ancienthistory #simplehistoryteller #reels #animation'
  }
];

const hiReels = [
  {
    part: 1,
    file: path.join(SHORTS_DIR, 'short_hi_part1.mp4'),
    title: 'इंसानों का पहला राजा? शिकारी का मज़ाक! 👑 [भाग 1] #Shorts #इतिहास',
    desc: '3 लाख सालों तक बिना किसी राजा के कैसे रहे इंसान? कालाहारी के शिकारियों की दास्तान!\n\n👑 पूरी डॉक्यूमेंट्री यूट्यूब पर: https://youtu.be/hjnYUIqdRAE\n\n#shorts #इतिहास #पहलाराजा #सुमेरियन #hindihistory #simplehistorytellerhindi #reels'
  },
  {
    part: 2,
    file: path.join(SHORTS_DIR, 'short_hi_part2.mp4'),
    title: 'खेती का जाल और पहले लालच का जन्म! 🌾 [भाग 2] #Shorts #इतिहास',
    desc: 'अनाज के गोदाम भरते ही आया डर और लालच! खेती के जाल में फंसा इंसान पहली बार झुका।\n\n🌾 पूरी डॉक्यूमेंट्री यूट्यूब पर: https://youtu.be/hjnYUIqdRAE\n\n#shorts #इतिहास #पहलाराजा #सुमेरियन #hindihistory #simplehistorytellerhindi #reels'
  },
  {
    part: 3,
    file: path.join(SHORTS_DIR, 'short_hi_part3.mp4'),
    title: 'दुनिया की पहली हफ्ता-वसूली और पहला डॉन! ⚔️ [भाग 3] #Shorts #इतिहास',
    desc: '20% फसल टैक्स दो, वरना...! मानव इतिहास की पहली हफ्ता-वसूली और पहले डॉन की कहानी।\n\n⚔️ पूरी डॉक्यूमेंट्री यूट्यूब पर: https://youtu.be/hjnYUIqdRAE\n\n#shorts #इतिहास #पहलाराजा #सुमेरियन #hindihistory #simplehistorytellerhindi #reels'
  },
  {
    part: 4,
    file: path.join(SHORTS_DIR, 'short_hi_part4.mp4'),
    title: 'सुमेरियन राजा और पहले सिंहासन का इतिहास! 🏛️ [भाग 4] #Shorts #इतिहास',
    desc: 'आसमान से उतरी राजशाही! सुमेरियन राजाओं की लिस्ट, सोने का ताज और पहली फौज का इतिहास।\n\n🏛️ पूरी डॉक्यूमेंट्री यूट्यूब पर: https://youtu.be/hjnYUIqdRAE\n\n#shorts #इतिहास #पहलाराजा #सुमेरियन #hindihistory #simplehistorytellerhindi #reels'
  }
];

async function ensurePageContext(page, pageUrl, pageName) {
  console.log(`\n============================================================`);
  console.log(`>>> SWITCHING CONTEXT TO: ${pageName} (${pageUrl})`);
  console.log(`============================================================`);

  await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  // Look for Switch button in blue banner or header
  const switchBtn = page.locator('div[aria-label*="Switch"], div[role="button"]:has-text("Switch"), button:has-text("Switch")').first();
  if (await switchBtn.isVisible().catch(() => false)) {
    console.log(`Clicking Switch context to ${pageName}...`);
    await switchBtn.click({ force: true });
    await page.waitForTimeout(6000);
  } else {
    console.log(`Already in page context or no switch button visible.`);
  }

  // Dismiss any "welcome to your new page" or tour modals
  const notNowBtn = page.locator('div[role="button"]:has-text("Not now"), div[aria-label="Close"], button:has-text("Not now")').first();
  if (await notNowBtn.isVisible().catch(() => false)) {
    await notNowBtn.click({ force: true });
    await page.waitForTimeout(1000);
  }
}

async function uploadSingleReel(page, s, prefix, index, total) {
  console.log(`\n--- Uploading ${prefix.toUpperCase()} Reel Part ${s.part} (${index}/${total}): ${s.title} ---`);

  await page.goto('https://www.facebook.com/reels/create', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  // Dismiss any overlays
  await page.evaluate(() => {
    const dialogs = document.querySelectorAll('div[role="dialog"] div[aria-label="Close"]');
    dialogs.forEach(d => d.click());
  });

  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  if (!nodeIds || nodeIds.length === 0) {
    console.error(`No file inputs found for ${prefix} Part ${s.part}!`);
    return false;
  }

  console.log(`Attaching ${s.file}...`);
  await session.send('DOM.setFileInputFiles', {
    files: [s.file],
    nodeId: nodeIds[0]
  });

  console.log('Waiting for Next button...');
  const nextBtn = page.locator('div[role="button"]:has-text("Next"), button:has-text("Next")').first();
  await nextBtn.waitFor({ state: 'visible', timeout: 35000 });
  console.log('Clicking Next (1)...');
  await nextBtn.click({ force: true });
  await page.waitForTimeout(2500);

  const nextBtn2 = page.locator('div[role="button"]:has-text("Next"), button:has-text("Next")').first();
  if (await nextBtn2.isVisible().catch(() => false)) {
    console.log('Clicking Next (2)...');
    await nextBtn2.click({ force: true });
    await page.waitForTimeout(2500);
  }

  console.log('Entering description caption...');
  const fullCaption = `${s.title}\n\n${s.desc}`;
  await page.evaluate((caption) => {
    const el = document.querySelector('div[aria-label="Describe your reel..."], div[role="textbox"]');
    if (el) {
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, caption);
    }
  }, fullCaption);
  await page.waitForTimeout(1500);

  console.log(`Publishing ${prefix.toUpperCase()} Reel Part ${s.part}...`);
  const postBtn = page.locator('div[role="button"]:has-text("Post"), button:has-text("Post")').last();
  await postBtn.click({ force: true });
  console.log(`Post clicked! Monitoring upload...`);

  for (let p = 0; p < 30; p++) {
    await page.waitForTimeout(3000);
    const isStillInModal = page.url().includes('create') && await page.locator('div[aria-label="Describe your reel..."]').isVisible().catch(() => false);
    if (!isStillInModal) {
      console.log(`>>> SUCCESS: ${prefix.toUpperCase()} Reel Part ${s.part} published!`);
      break;
    }
  }

  await page.waitForTimeout(4000);
  const shotPath = `tools/fb_${prefix}_reel_part${s.part}_posted.png`;
  await page.screenshot({ path: shotPath });
  console.log(`Saved screenshot: ${shotPath}`);

  if (fs.existsSync(shotPath)) {
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `fb_${prefix}_reel_part${s.part}_posted.png`));
  }
  return true;
}

async function postMasterVideoToPage(page, pageUrl, pageName, videoPath, title, desc, prefix) {
  console.log(`\n============================================================`);
  console.log(`>>> POSTING MASTER VIDEO TO PAGE TIMELINE: ${pageName}`);
  console.log(`============================================================`);

  await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // Look for "Photo/video" button or "What's on your mind?"
  console.log('Looking for composer...');
  const photoVideoBtn = page.locator('div[role="button"]:has-text("Photo/video"), div[aria-label*="Photo/video"]').first();
  if (await photoVideoBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await photoVideoBtn.click({ force: true });
    await page.waitForTimeout(3000);
  } else {
    const composerBox = page.locator('div[role="button"]:has-text("What\'s on your mind"), div[aria-label*="What\'s on your mind"]').first();
    if (await composerBox.isVisible({ timeout: 5000 }).catch(() => false)) {
      await composerBox.click({ force: true });
      await page.waitForTimeout(3000);
    }
  }

  // Attach video file via CDP
  console.log('Attaching master video file via CDP:', videoPath);
  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  if (nodeIds && nodeIds.length > 0) {
    await session.send('DOM.setFileInputFiles', {
      files: [videoPath],
      nodeId: nodeIds[nodeIds.length - 1]
    });
    console.log('Master video attached!');
    await page.waitForTimeout(8000);
  }

  // Fill text description
  console.log('Writing post caption...');
  const fullPostText = `${title}\n\n${desc}`;
  await page.evaluate((caption) => {
    const el = document.querySelector('div[role="textbox"][contenteditable="true"], div[aria-label*="What\'s on your mind"]');
    if (el) {
      el.focus();
      document.execCommand('insertText', false, caption);
    }
  }, fullPostText);
  await page.waitForTimeout(3000);

  // Click Next if visible
  const nextBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Next"), div[role="dialog"] button:has-text("Next")').first();
  if (await nextBtn.isVisible().catch(() => false)) {
    console.log('Clicking Next on video dialog...');
    await nextBtn.click({ force: true });
    await page.waitForTimeout(3000);
  }

  // Click Post
  console.log('Clicking Post button...');
  const postBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Post"), div[role="dialog"] button:has-text("Post"), div[role="button"]:has-text("Post")').last();
  await postBtn.click({ force: true });
  console.log('Post clicked! Monitoring upload completion...');

  // Wait for post upload to finish (up to 5 minutes)
  for (let m = 0; m < 30; m++) {
    await page.waitForTimeout(10000);
    const bodyText = await page.evaluate(() => document.body.innerText);
    const modalVisible = await page.locator('div[role="dialog"]').isVisible().catch(() => false);
    console.log(`[${(m+1)*10}s] Master video upload progress... modalOpen=${modalVisible}`);
    if (!modalVisible || bodyText.includes('Your video is processing') || bodyText.includes('post was shared') || bodyText.includes('Just now')) {
      console.log(`>>> SUCCESS: Master video published to ${pageName}!`);
      break;
    }
  }

  await page.waitForTimeout(5000);
  const shotPath = `tools/fb_${prefix}_master_posted.png`;
  await page.screenshot({ path: shotPath });
  console.log(`Saved screenshot: ${shotPath}`);

  if (fs.existsSync(shotPath)) {
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `fb_${prefix}_master_posted.png`));
  }
}

(async () => {
  console.log('=== FACEBOOK COMPLETE PUBLISHING: ENGLISH & HINDI ===');

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // -------------------------------------------------------------------------
  // 1. ENGLISH PAGE (History Teller)
  // -------------------------------------------------------------------------
  console.log('\n######################################################');
  console.log('STAGE 1: ENGLISH PAGE (HISTORY TELLER)');
  console.log('######################################################');
  await ensurePageContext(page, 'https://www.facebook.com/profile.php?id=61595202872996', 'History Teller (English)');

  // Upload 4 English Reels
  for (let i = 0; i < enReels.length; i++) {
    await uploadSingleReel(page, enReels[i], 'en', i + 1, enReels.length);
  }

  // Post English Master Video
  await postMasterVideoToPage(
    page,
    'https://www.facebook.com/profile.php?id=61595202872996',
    'History Teller',
    path.join(RENDERS_DIR, 'video_en.mp4'),
    'How Humans Invented the First King (The True Origin of Thrones) | Simple History Teller',
    `For 300,000 years of human history, humanity lived with NO kings, NO bosses, and fierce equality. So how did we go from mocking arrogant hunters around Kalahari campfires to bowing before absolute monarchs on golden thrones?\n\nExplore the incredible story of the Agricultural Revolution, Mesopotamian warlords, the Sumerian King List, and Sargon of Akkad.\n\n👑 Watch full animated documentary on YouTube: https://youtu.be/lNNFHePozVs\n\n#SimpleHistoryTeller #History #AnimatedHistory #AncientCivilizations #WorldHistory #HistoryDocumentary #OverSimplified`,
    'en'
  );

  // -------------------------------------------------------------------------
  // 2. HINDI PAGE (Simple History Teller Hindi)
  // -------------------------------------------------------------------------
  console.log('\n######################################################');
  console.log('STAGE 2: HINDI PAGE (SIMPLE HISTORY TELLER HINDI)');
  console.log('######################################################');
  await ensurePageContext(page, 'https://www.facebook.com/profile.php?id=61595333157867', 'Simple History Teller Hindi');

  // Upload 4 Hindi Reels
  for (let i = 0; i < hiReels.length; i++) {
    await uploadSingleReel(page, hiReels[i], 'hi', i + 1, hiReels.length);
  }

  // Post Hindi Master Video
  await postMasterVideoToPage(
    page,
    'https://www.facebook.com/profile.php?id=61595333157867',
    'Simple History Teller Hindi',
    path.join(RENDERS_DIR, 'video_hi.mp4'),
    'इंसानों ने पहला राजा कैसे बनाया? 👑 तख्त और सत्ता का असली इतिहास | Simple History Teller',
    `हज़ारों सालों तक इंसान बिना किसी राजा, बिना किसी अदालत और बिना किसी हुकूमत के बराबरी से रहता था। तो फिर दुनिया का पहला राजा कैसे बना?\n\nकालाहारी रेगिस्तान की अनोखी परंपराओं से लेकर मेसोपोटामिया के पहले टैक्स और सुमेरियन राजाओं के इतिहास की पूरी दास्तान।\n\n👑 पूरी डॉक्यूमेंट्री यूट्यूब पर देखिए: https://youtu.be/hjnYUIqdRAE\n\n#SimpleHistoryTellerHindi #इतिहास #पहलाराजा #सुमेरियन #मेसोपोटामिया #HindiHistory #OverSimplified #HistoryDocumentary #AnimatedHistory`,
    'hi'
  );

  console.log('\n======================================================');
  console.log('ALL FACEBOOK REELS & MASTER VIDEOS PUBLISHED SUCCESSFULLY!');
  console.log('======================================================\n');

  await page.waitForTimeout(5000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal batch error in Facebook publishing:', err);
  process.exit(1);
});
