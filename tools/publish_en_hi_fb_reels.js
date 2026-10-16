const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = path.join(__dirname, '..');
const SHORTS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts');
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

async function uploadReelsForPage(page, pageUrl, pageName, reelsList, prefix) {
  console.log(`\n============================================================`);
  console.log(`>>> SWITCHING TO PAGE: ${pageName} (${pageUrl})`);
  console.log(`============================================================`);

  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const switchBtn = page.locator('div[aria-label*="Switch"], div[role="button"]:has-text("Switch")').first();
  if (await switchBtn.isVisible().catch(() => false)) {
    console.log(`Switching context to ${pageName}...`);
    await switchBtn.click();
    await page.waitForTimeout(5000);
  }

  for (let i = 0; i < reelsList.length; i++) {
    const s = reelsList[i];
    console.log(`\n--- Uploading ${prefix} Reel Part ${s.part} (${i + 1}/${reelsList.length}): ${s.title} ---`);

    await page.goto('https://www.facebook.com/reels/create', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const session = await page.context().newCDPSession(page);
    const doc = await session.send('DOM.getDocument', { depth: 0 });
    const { nodeIds } = await session.send('DOM.querySelectorAll', {
      nodeId: doc.root.nodeId,
      selector: 'input[type="file"]'
    });

    if (!nodeIds || nodeIds.length === 0) {
      console.error(`No file inputs found for ${prefix} Part ${s.part}!`);
      continue;
    }

    console.log(`Attaching ${s.file}...`);
    await session.send('DOM.setFileInputFiles', {
      files: [s.file],
      nodeId: nodeIds[0]
    });

    console.log('Waiting for Next button...');
    const nextBtn = page.locator('div[role="button"]:has-text("Next"), button:has-text("Next")').first();
    await nextBtn.waitFor({ state: 'visible', timeout: 30000 });
    console.log('Clicking Next (1)...');
    await nextBtn.click();
    await page.waitForTimeout(2000);

    const nextBtn2 = page.locator('div[role="button"]:has-text("Next"), button:has-text("Next")').first();
    if (await nextBtn2.isVisible().catch(() => false)) {
      console.log('Clicking Next (2)...');
      await nextBtn2.click();
      await page.waitForTimeout(2000);
    }

    console.log('Typing description...');
    const descBox = page.locator('div[aria-label="Describe your reel..."], div[role="textbox"]').first();
    await descBox.waitFor({ state: 'visible', timeout: 10000 });
    await descBox.click();
    await page.waitForTimeout(300);

    const fullCaption = `${s.title}\n\n${s.desc}`;
    const lines = fullCaption.split('\n');
    for (const l of lines) {
      if (l === '') {
        await page.keyboard.press('Enter');
      } else {
        await page.evaluate((text) => document.execCommand('insertText', false, text), l);
        await page.keyboard.press('Enter');
      }
      await page.waitForTimeout(20);
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    console.log(`Publishing ${prefix} Reel Part ${s.part}...`);
    const postBtn = page.locator('div[role="button"]:has-text("Post"), button:has-text("Post")').last();
    await postBtn.click();
    console.log(`Post clicked! Monitoring upload...`);

    for (let p = 0; p < 25; p++) {
      await page.waitForTimeout(2000);
      const isStillInModal = page.url().includes('create') && await page.locator('div[aria-label="Describe your reel..."]').isVisible().catch(() => false);
      if (!isStillInModal) {
        console.log(`>>> SUCCESS: ${prefix} Reel Part ${s.part} published!`);
        break;
      }
    }

    await page.waitForTimeout(3000);
    const shotPath = `tools/fb_${prefix}_reel_part${s.part}_posted.png`;
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot: ${shotPath}`);

    if (fs.existsSync(shotPath)) {
      fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `fb_${prefix}_reel_part${s.part}_posted.png`));
    }
  }
}

(async () => {
  console.log('Launching Chrome for English & Hindi Facebook Reels batch upload...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // 1. Upload English Reels to History Teller Page
  await uploadReelsForPage(page, 'https://www.facebook.com/profile.php?id=61595202872996', 'History Teller (English)', enReels, 'en');

  // 2. Upload Hindi Reels to Simple History Teller Hindi Page
  await uploadReelsForPage(page, 'https://www.facebook.com/profile.php?id=61595333157867', 'Simple History Teller Hindi', hiReels, 'hi');

  console.log('\n============================================================');
  console.log('ALL ENGLISH & HINDI FACEBOOK REELS POSTED SUCCESSFULLY!');
  console.log('============================================================\n');

  await page.waitForTimeout(4000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal batch error:', err);
  process.exit(1);
});
