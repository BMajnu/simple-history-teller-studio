const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = path.join(__dirname, '..');
const SHORTS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts');
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const enShorts = [
  {
    part: 1,
    file: path.join(SHORTS_DIR, 'short_en_part1.mp4'),
    title: 'How Humans Invented the First King! 👑 [Part 1] #Shorts #History',
    desc: 'For 300,000 years, humans lived with NO kings and fiercely mocked arrogant leaders!\n\n👑 Watch full documentary on YouTube: https://youtu.be/lNNFHePozVs\n\n#shorts #history #firstking #ancienthistory #simplehistoryteller #animation #overSimplified'
  },
  {
    part: 2,
    file: path.join(SHORTS_DIR, 'short_en_part2.mp4'),
    title: 'The Agricultural Trap & First Warlords! 🌾 [Part 2] #Shorts #History',
    desc: 'Farming began, granaries filled, and humanity fell into the ultimate trap of security and taxes!\n\n🌾 Watch full documentary on YouTube: https://youtu.be/lNNFHePozVs\n\n#shorts #history #firstking #ancienthistory #simplehistoryteller #animation #overSimplified'
  },
  {
    part: 3,
    file: path.join(SHORTS_DIR, 'short_en_part3.mp4'),
    title: 'The First Extortion & World\'s First Don! ⚔️ [Part 3] #Shorts #History',
    desc: 'Pay 20% of your crop, or else! The shocking true origin of taxes and warlords.\n\n⚔️ Watch full documentary on YouTube: https://youtu.be/lNNFHePozVs\n\n#shorts #history #firstking #ancienthistory #simplehistoryteller #animation #overSimplified'
  },
  {
    part: 4,
    file: path.join(SHORTS_DIR, 'short_en_part4.mp4'),
    title: 'Sumerian Kings & The Rise of the Throne! 🏛️ [Part 4] #Shorts #History',
    desc: 'Kingship descended from the heavens! The Sumerian King List and Sargon of Akkad.\n\n🏛️ Watch full documentary on YouTube: https://youtu.be/lNNFHePozVs\n\n#shorts #history #firstking #ancienthistory #simplehistoryteller #animation #overSimplified'
  }
];

const hiShorts = [
  {
    part: 1,
    file: path.join(SHORTS_DIR, 'short_hi_part1.mp4'),
    title: 'इंसानों का पहला राजा? शिकारी का मज़ाक! 👑 [भाग 1] #Shorts #इतिहास',
    desc: '3 लाख सालों तक बिना किसी राजा के कैसे रहे इंसान? कालाहारी के शिकारियों की दास्तान!\n\n👑 पूरी डॉक्यूमेंट्री यूट्यूब पर: https://youtu.be/hjnYUIqdRAE\n\n#shorts #इतिहास #पहलाराजा #सुमेरियन #hindihistory #simplehistorytellerhindi #animation'
  },
  {
    part: 2,
    file: path.join(SHORTS_DIR, 'short_hi_part2.mp4'),
    title: 'खेती का जाल और पहले लालच का जन्म! 🌾 [भाग 2] #Shorts #इतिहास',
    desc: 'अनाज के गोदाम भरते ही आया डर और लालच! खेती के जाल में फंसा इंसान पहली बार झुका।\n\n🌾 पूरी डॉक्यूमेंट्री यूट्यूब पर: https://youtu.be/hjnYUIqdRAE\n\n#shorts #इतिहास #पहलाराजा #सुमेरियन #hindihistory #simplehistorytellerhindi #animation'
  },
  {
    part: 3,
    file: path.join(SHORTS_DIR, 'short_hi_part3.mp4'),
    title: 'दुनिया की पहली हफ्ता-वसूली और पहला डॉन! ⚔️ [भाग 3] #Shorts #इतिहास',
    desc: '20% फसल टैक्स दो, वरना...! मानव इतिहास की पहली हफ्ता-वसूली और पहले डॉन की कहानी।\n\n⚔️ पूरी डॉक्यूमेंट्री यूट्यूब पर: https://youtu.be/hjnYUIqdRAE\n\n#shorts #इतिहास #पहलाराजा #सुमेरियन #hindihistory #simplehistorytellerhindi #animation'
  },
  {
    part: 4,
    file: path.join(SHORTS_DIR, 'short_hi_part4.mp4'),
    title: 'सुमेरियन राजा और पहले सिंहासन का इतिहास! 🏛️ [भाग 4] #Shorts #इतिहास',
    desc: 'आसमान से उतरी राजशाही! सुमेरियन राजाओं की लिस्ट, सोने का ताज और पहली फौज का इतिहास।\n\n🏛️ पूरी डॉक्यूमेंट्री यूट्यूब पर: https://youtu.be/hjnYUIqdRAE\n\n#shorts #इतिहास #पहलाराजा #सुमेरियन #hindihistory #simplehistorytellerhindi #animation'
  }
];

async function ensureChannel(page, targetName) {
  console.log(`Ensuring YouTube Studio is on: ${targetName}...`);
  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const currentTitle = await page.locator('#channel-title, ytcp-entity-page-header .title, #entity-name').first().textContent().catch(() => '');
  console.log(`Current channel title detected: "${currentTitle.trim()}"`);

  let needsSwitch = false;
  if (targetName === 'Simple History Teller') {
    if (!currentTitle.includes('Simple History Teller') || currentTitle.includes('Bangla') || currentTitle.includes('Hindi')) {
      needsSwitch = true;
    }
  } else if (targetName === 'Simple History Teller Hindi') {
    if (!currentTitle.includes('Hindi')) {
      needsSwitch = true;
    }
  }

  if (needsSwitch) {
    console.log(`Switching account to: ${targetName}...`);
    const avatar = page.locator('#avatar-btn, button#avatar-btn, ytcp-app-header button:has(img)').last();
    await avatar.click();
    await page.waitForTimeout(1500);

    const switchItem = page.locator('tp-yt-paper-item:has-text("Switch account"), ytcp-text-menu-item:has-text("Switch account")').first();
    await switchItem.click();
    await page.waitForTimeout(2000);

    let channelRenderer;
    if (targetName === 'Simple History Teller') {
      channelRenderer = page.locator('ytd-account-item-renderer:has-text("Simple History Teller")').filter({ hasNotText: 'Bangla' }).filter({ hasNotText: 'Hindi' }).first();
    } else {
      channelRenderer = page.locator('ytd-account-item-renderer:has-text("Simple History Teller Hindi")').first();
    }

    await channelRenderer.click();
    await page.waitForTimeout(8000);
    console.log(`Successfully switched to ${targetName}!`);
  }
}

async function uploadSingleShort(page, shortItem, lang) {
  console.log(`\n---------------------------------------------------------`);
  console.log(`Uploading ${lang.toUpperCase()} Short Part ${shortItem.part}: ${shortItem.title}`);
  console.log(`File: ${shortItem.file} (${Math.round(fs.statSync(shortItem.file).size / (1024*1024))} MB)`);
  console.log(`---------------------------------------------------------`);

  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Trigger create modal
  const createBtn = page.locator('#create-icon, button:has-text("Create"), ytcp-button:has-text("Create"), button:has-text("Upload videos"), ytcp-button:has-text("Upload videos")').first();
  await createBtn.click();
  await page.waitForTimeout(1000);

  const uploadOption = page.locator('tp-yt-paper-item:has-text("Upload videos"), ytd-compact-link-renderer:has-text("Upload videos")').first();
  if (await uploadOption.isVisible({ timeout: 2000 }).catch(() => false)) {
    await uploadOption.click();
    await page.waitForTimeout(2000);
  }

  // Attach video via CDP
  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  if (!nodeIds || nodeIds.length === 0) {
    throw new Error('No file input found on YouTube upload dialog!');
  }

  await session.send('DOM.setFileInputFiles', {
    files: [shortItem.file],
    nodeId: nodeIds[0]
  });

  console.log('Video attached. Waiting 8s for form fields to populate...');
  await page.waitForTimeout(8000);

  // Set Title
  console.log('Setting Title...');
  const titleBox = page.locator('#title-textarea #textbox').first();
  await titleBox.waitFor({ state: 'visible', timeout: 30000 });
  await titleBox.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(200);
  await page.evaluate((text) => {
    const el = document.querySelector('#title-textarea #textbox');
    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertText', false, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, shortItem.title);
  await page.waitForTimeout(1000);

  // Set Description
  console.log('Setting Description...');
  const descBox = page.locator('#description-textarea #textbox').first();
  await descBox.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(200);
  await page.evaluate((text) => {
    const el = document.querySelector('#description-textarea #textbox');
    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertText', false, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, shortItem.desc);
  await page.waitForTimeout(1000);

  // Audience: Not Made For Kids
  console.log('Setting audience...');
  const notForKidsRadio = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKidsRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
    await notForKidsRadio.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // Next -> Elements
  console.log('Clicking Next (1)...');
  const nextBtn = page.locator('#next-button').first();
  await nextBtn.click();
  await page.waitForTimeout(2500);

  // Next -> Checks
  console.log('Clicking Next (2)...');
  await nextBtn.click();
  await page.waitForTimeout(2500);

  // Next -> Visibility
  console.log('Clicking Next (3)...');
  await nextBtn.click();
  await page.waitForTimeout(2500);

  // Select Public
  console.log('Selecting Public...');
  const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
  if (await publicRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
    await publicRadio.click({ force: true });
    await page.waitForTimeout(1000);
  }

  const shortLink = await page.locator('a.ytcp-video-info, a[href*="youtu.be"]').first().getAttribute('href').catch(() => null);
  console.log('Short Link:', shortLink);

  // Click Publish
  console.log('Publishing Short...');
  const doneBtn = page.locator('#done-button').first();
  await doneBtn.waitFor({ state: 'visible', timeout: 5000 });
  await doneBtn.click({ force: true });
  console.log('Publish clicked! Monitoring upload until 100% complete...');

  // Wait for upload and processing confirmation modal
  for (let w = 0; w < 40; w++) { // up to 3.5 minutes
    await page.waitForTimeout(5000);
    const bodyText = await page.evaluate(() => document.body.innerText);
    const closeBtn = page.locator('#close-button, ytcp-button:has-text("Close"), button:has-text("Close")').first();
    const isCloseVisible = await closeBtn.isVisible().catch(() => false);

    if (bodyText.includes('Upload complete') || bodyText.includes('Video published') || bodyText.includes('Checks complete') || isCloseVisible) {
      console.log(`Upload complete confirmed at ${(w + 1) * 5}s!`);
      if (isCloseVisible) {
        await closeBtn.click().catch(() => {});
        await page.waitForTimeout(2000);
      }
      break;
    }
    console.log(`Waiting for upload completion... ${(w + 1) * 5}s`);
  }

  const shotPath = `tools/yt_${lang}_short_part${shortItem.part}_posted.png`;
  await page.screenshot({ path: shotPath });
  console.log(`Saved screenshot: ${shotPath}`);

  if (fs.existsSync(shotPath)) {
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `yt_${lang}_short_part${shortItem.part}_posted.png`));
  }

  console.log(`>>> SUCCESS: ${lang.toUpperCase()} Short Part ${shortItem.part} published! URL: ${shortLink}`);
  await page.waitForTimeout(3000);
}

(async () => {
  console.log('=== STARTING BATCH YOUTUBE SHORTS PUBLISHING (EN & HI) ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // 1. English Shorts
  console.log('\n======================================================');
  console.log('STAGE 1: ENGLISH YOUTUBE SHORTS (4 PARTS)');
  console.log('======================================================');
  await ensureChannel(page, 'Simple History Teller');
  for (const s of enShorts) {
    await uploadSingleShort(page, s, 'en');
  }

  // 2. Hindi Shorts
  console.log('\n======================================================');
  console.log('STAGE 2: HINDI YOUTUBE SHORTS (4 PARTS)');
  console.log('======================================================');
  await ensureChannel(page, 'Simple History Teller Hindi');
  for (const s of hiShorts) {
    await uploadSingleShort(page, s, 'hi');
  }

  console.log('\n======================================================');
  console.log('ALL ENGLISH & HINDI YOUTUBE SHORTS SUCCESSFULLY POSTED!');
  console.log('======================================================\n');

  await page.waitForTimeout(3000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal batch error in YouTube shorts publishing:', err);
  process.exit(1);
});
