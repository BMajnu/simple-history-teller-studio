/**
 * publish_en_hi_master_final.js
 * Robust upload script for English and Hindi master videos.
 * Uses direct channel studio URL to avoid account switching issues.
 */

const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const VIDEOS = [
  {
    lang: 'en',
    channelId: 'UCvEQdVnctkuYZw3iNDo5krg',
    channelName: 'Simple History Teller',
    videoPath: path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'video_en.mp4'),
    thumbPath: path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'en_thumbnail_optimized.jpg'),
    title: 'How Humans Invented the First King (The True Origin of Thrones) | Simple History Teller',
    description: `For 300,000 years of human history, humanity lived with NO kings, NO bosses, and fierce equality. So how did we go from mocking arrogant hunters around Kalahari campfires to bowing before absolute monarchs on golden thrones?

Explore the incredible story of the Agricultural Revolution, Mesopotamian warlords, the Sumerian King List, and Sargon of Akkad.

🕒 Chapters:
00:00 - The Egalitarian Paradox (The Hook)
01:30 - Insulting the Meat (Kalahari Defense)
04:30 - The Agricultural Trap & Grain Hoarding
08:00 - The Warlord's Protection Racket (First Taxes)
11:00 - The Sumerian King List & King Alulim
13:30 - Sargon of Akkad & First Standing Army
15:00 - The Modern State & Final Verdict

🔔 Subscribe to Simple History Teller!

#SimpleHistoryTeller #History #AnimatedHistory #AncientCivilizations #WorldHistory #HistoryDocumentary #OverSimplified #HistoryExplained #EducationalAnimation`,
    tags: 'history,first king,ancient history,monarchy,sumerian,sargon of akkad,oversimplified,animation,world history'
  },
  {
    lang: 'hi',
    channelId: 'UCkG4y9NJQ5yCys3jxFDUOcg',
    channelName: 'Simple History Teller Hindi',
    videoPath: path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'video_hi.mp4'),
    thumbPath: path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'hi_thumbnail_optimized.jpg'),
    title: 'इंसानों ने पहला राजा कैसे बनाया? 👑 तख्त और सत्ता का असली इतिहास | Simple History Teller',
    description: `3 लाख सालों तक बिना किसी राजा के जीते थे इंसान — तो फिर राजशाही की शुरुआत कैसे हुई? कालाहारी के शिकारियों से लेकर सुमेर के सोने के तख्त तक — यह है सत्ता की असली कहानी।

खेती के आविष्कार, अनाज के गोदाम, पहले टैक्स, सुमेरियन राजा सूची और सरगोन ऑफ अक्काद की पूरी कहानी।

🕒 अध्याय:
00:00 - बराबरी का समाज (परिचय)
01:30 - मांस का अपमान (कालाहारी रक्षा)
04:30 - खेती का जाल और अनाज की जमाखोरी
08:00 - सरदार की सुरक्षा रैकेट (पहला टैक्स)
11:00 - सुमेरियन राजा सूची और राजा अलुलिम
13:30 - सरगोन ऑफ अक्काद और पहली स्थायी सेना
15:00 - आधुनिक राज्य और अंतिम निष्कर्ष

🔔 Simple History Teller Hindi को सब्सक्राइब करें!

#SimpleHistoryTellerHindi #इतिहास #AnimatedHistory #सुमेर #विश्वइतिहास #HistoryDocumentary #पहलाराजा #HistoryExplained #शिक्षा`,
    tags: 'इतिहास,पहला राजा,सुमेरियन,सरगोन,राजशाही,animation,hindi history,ancient history,world history'
  }
];

async function switchToChannel(page, channelId, channelName) {
  console.log(`\nSwitching to channel: ${channelName} (${channelId})...`);

  // Try direct navigation first
  await page.goto(`https://studio.youtube.com/channel/${channelId}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Take screenshot
  await page.screenshot({ path: `tools/${channelId}_verify.png` });

  // Check if we're on the right channel
  const channelTitle = await page.evaluate(() => {
    const el = document.querySelector('#channel-title, ytcp-entity-page-header .title, [id="entity-name"]');
    return el ? el.textContent.trim() : '';
  });
  console.log(`Detected channel title: "${channelTitle}"`);

  if (channelTitle.includes(channelName) ||
      (channelName.includes('Hindi') && channelTitle.includes('Hindi')) ||
      (!channelName.includes('Hindi') && !channelName.includes('Bangla') && channelTitle.includes('Simple History Teller') && !channelTitle.includes('Hindi') && !channelTitle.includes('Bangla'))) {
    console.log(`Already on correct channel!`);
    return true;
  }

  // Need to switch - look for switch account button using multiple selectors
  console.log('Need to switch account. Trying avatar approaches...');

  // Try clicking on the header avatar / channel switcher
  const avatarSelectors = [
    'ytcp-app-header button img',
    '#avatar-btn img',
    'ytcp-entity-page-header img.avatar',
    'img.ytcp-account-icon',
    '[aria-label="Account menu"]',
    'ytcp-icon-button[aria-label*="account"]',
    'button[aria-label*="account"]'
  ];

  let avatarClicked = false;
  for (const sel of avatarSelectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`Found avatar via: ${sel}`);
      await el.click();
      avatarClicked = true;
      await page.waitForTimeout(2000);
      break;
    }
  }

  if (!avatarClicked) {
    // Try JS click on any header icon
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('ytcp-icon-button, button, ytcp-button'));
      const avatarBtn = btns.find(b => {
        const label = b.getAttribute('aria-label') || b.textContent || '';
        return label.toLowerCase().includes('account') || label.toLowerCase().includes('avatar') || b.querySelector('img');
      });
      if (avatarBtn) { avatarBtn.click(); return true; }
      return false;
    });
    if (clicked) {
      console.log('Avatar clicked via JS fallback');
      await page.waitForTimeout(2000);
    }
  }

  // Look for Switch account option
  const switchSelectors = [
    'tp-yt-paper-item:has-text("Switch account")',
    'ytcp-text-menu-item:has-text("Switch account")',
    '[role="menuitem"]:has-text("Switch")',
    'yt-formatted-string:has-text("Switch account")'
  ];
  for (const sel of switchSelectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`Found Switch via: ${sel}`);
      await el.click();
      await page.waitForTimeout(3000);
      break;
    }
  }

  // Click on the target channel in the list
  const allItems = await page.locator('ytd-account-item-renderer, [role="listitem"], tp-yt-paper-item').all();
  console.log(`Found ${allItems.length} account items`);
  for (const item of allItems) {
    const text = await item.textContent().catch(() => '');
    console.log(`Account item: "${text.trim().substring(0, 60)}"`);
    if (channelName.includes('Hindi') && text.includes('Hindi')) {
      console.log('Clicking Hindi channel...');
      await item.click();
      await page.waitForTimeout(8000);
      return true;
    } else if (!channelName.includes('Hindi') && !channelName.includes('Bangla') &&
               text.includes('Simple History Teller') && !text.includes('Hindi') && !text.includes('Bangla')) {
      console.log('Clicking English channel...');
      await item.click();
      await page.waitForTimeout(8000);
      return true;
    }
  }

  return false;
}

async function uploadVideo(page, video) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`UPLOADING ${video.lang.toUpperCase()} MASTER VIDEO`);
  console.log(`Channel: ${video.channelName}`);
  console.log(`File: ${video.videoPath}`);
  console.log(`Size: ${Math.round(fs.statSync(video.videoPath).size / (1024*1024))} MB`);
  console.log(`${'='.repeat(60)}`);

  // Switch to the right channel
  await switchToChannel(page, video.channelId, video.channelName);

  // Navigate back to studio to ensure proper state
  await page.goto(`https://studio.youtube.com/channel/${video.channelId}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  // Open upload dialog
  console.log('Opening upload dialog...');

  // Try multiple upload button approaches
  let uploadOpened = false;
  const createSelectors = ['#create-icon', 'ytcp-button:has-text("Upload videos")', 'ytcp-button:has-text("Create")', '#upload-btn'];
  for (const sel of createSelectors) {
    const btn = page.locator(sel).first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1000);
      uploadOpened = true;
      break;
    }
  }

  if (uploadOpened) {
    const uploadItemSelectors = ['tp-yt-paper-item:has-text("Upload videos")', 'ytd-compact-link-renderer:has-text("Upload videos")', '[aria-label*="Upload"]'];
    for (const sel of uploadItemSelectors) {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
        await el.click();
        await page.waitForTimeout(2000);
        break;
      }
    }
  }

  // Wait for file input to appear
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: 'attached', timeout: 15000 });

  // Attach video via CDP (handles large files > 50MB)
  console.log('Attaching video file via CDP...');
  const cdp = await page.context().newCDPSession(page);
  const docResult = await cdp.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', {
    nodeId: docResult.root.nodeId,
    selector: 'input[type="file"]'
  });
  if (!nodeIds || nodeIds.length === 0) throw new Error('No file input found!');

  await cdp.send('DOM.setFileInputFiles', { files: [video.videoPath], nodeId: nodeIds[0] });
  console.log('Video attached! Waiting 15s for upload to start and form to populate...');
  await page.waitForTimeout(15000);

  // Fill Title
  console.log('Setting title...');
  const titleBox = page.locator('#title-textarea #textbox').first();
  await titleBox.waitFor({ state: 'visible', timeout: 30000 });
  await titleBox.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await page.evaluate((txt) => {
    const el = document.querySelector('#title-textarea #textbox');
    if (!el) return;
    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertText', false, txt);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, video.title);
  await page.waitForTimeout(1000);

  // Fill Description
  console.log('Setting description...');
  const descBox = page.locator('#description-textarea #textbox').first();
  await descBox.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await page.evaluate((txt) => {
    const el = document.querySelector('#description-textarea #textbox');
    if (!el) return;
    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertText', false, txt);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, video.description);
  await page.waitForTimeout(1000);

  // Upload thumbnail
  console.log('Uploading thumbnail...');
  try {
    const thumbSection = page.locator('ytcp-thumbnail-selector, ytcp-thumbnails-compact').first();
    if (await thumbSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await thumbSection.scrollIntoViewIfNeeded();
    }

    // Try file chooser approach
    const thumbBtnSelectors = ['#select-button', 'ytcp-thumbnail-button #select-button', '[aria-label*="Upload thumbnail"]', '[aria-label*="Custom thumbnail"]', '.ytcp-thumbnail-selector #select-button'];
    for (const sel of thumbBtnSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
        try {
          const [fc] = await Promise.all([
            page.waitForEvent('filechooser', { timeout: 5000 }),
            btn.click()
          ]);
          await fc.setFiles(video.thumbPath);
          console.log(`Thumbnail uploaded via: ${sel}`);
          await page.waitForTimeout(3000);
          break;
        } catch (e) {
          console.warn(`Thumbnail btn ${sel} failed:`, e.message);
        }
      }
    }
  } catch (e) {
    console.warn('Thumbnail upload warning:', e.message);
  }

  // Not for kids
  console.log('Setting audience (Not for kids)...');
  const notKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notKids.isVisible({ timeout: 3000 }).catch(() => false)) {
    await notKids.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // Tags
  console.log('Adding tags...');
  const showMoreBtn = page.locator('button:has-text("SHOW MORE"), button:has-text("Show more"), ytcp-button#toggle-button').first();
  if (await showMoreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await showMoreBtn.scrollIntoViewIfNeeded();
    await showMoreBtn.click({ force: true });
    await page.waitForTimeout(1500);
  }
  const tagsInput = page.locator('input[aria-label="Tags"], input[placeholder*="Add tag"]').first();
  if (await tagsInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await tagsInput.scrollIntoViewIfNeeded();
    await tagsInput.click();
    await tagsInput.fill(video.tags);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: `tools/${video.lang}_upload_details.png` });

  // Next x3
  console.log('Clicking Next (Details -> Elements -> Checks -> Visibility)...');
  const nextBtn = page.locator('#next-button').first();
  await nextBtn.click();
  await page.waitForTimeout(3000);
  await nextBtn.click();
  await page.waitForTimeout(3000);
  await nextBtn.click();
  await page.waitForTimeout(3000);

  // Public visibility
  console.log('Setting Public visibility...');
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
  if (await pubRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
    await pubRadio.click({ force: true });
    await page.waitForTimeout(1500);
  }

  const videoHref = await page.locator('a.ytcp-video-info, a[href*="youtu.be"]').first().getAttribute('href').catch(() => null);
  console.log('Video link:', videoHref);

  await page.screenshot({ path: `tools/${video.lang}_visibility.png` });

  // Publish
  console.log('Clicking Publish/Done...');
  const doneBtn = page.locator('#done-button').first();
  await doneBtn.waitFor({ state: 'visible', timeout: 10000 });
  await doneBtn.click({ force: true });
  console.log('Publish clicked! Waiting 15s...');
  await page.waitForTimeout(15000);

  await page.screenshot({ path: `tools/${video.lang}_master_final.png` });
  try {
    fs.copyFileSync(`tools/${video.lang}_master_final.png`, path.join(ARTIFACT_DIR, `${video.lang}_master_final.png`));
  } catch (e) {}

  console.log(`\n>>> ${video.lang.toUpperCase()} MASTER VIDEO PUBLISHED! URL: ${videoHref}`);
  return videoHref;
}

(async () => {
  console.log('=== MASTER VIDEO BATCH UPLOAD: EN + HI ===\n');

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  const results = [];

  for (const video of VIDEOS) {
    try {
      const link = await uploadVideo(page, video);
      results.push({ lang: video.lang, status: 'SUCCESS', link });
    } catch (err) {
      console.error(`ERROR uploading ${video.lang}:`, err.message);
      await page.screenshot({ path: `tools/${video.lang}_upload_error.png` }).catch(() => {});
      results.push({ lang: video.lang, status: 'ERROR', error: err.message });
    }
  }

  console.log('\n=== FINAL RESULTS ===');
  for (const r of results) {
    console.log(`${r.lang.toUpperCase()}: ${r.status} ${r.link || r.error || ''}`);
  }

  await page.waitForTimeout(3000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
