/**
 * publish_en_master_fresh.js
 * Uploads video_en.mp4 to Simple History Teller (English) YouTube channel
 * with full title, description, tags, thumbnail, and Public visibility.
 */

const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const VIDEO_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'video_en.mp4');
const THUMB_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'en_thumbnail_optimized.jpg');
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const TITLE = 'How Humans Invented the First King (The True Origin of Thrones) | Simple History Teller';
const DESCRIPTION = `For 300,000 years of human history, humanity lived with NO kings, NO bosses, and fierce equality. So how did we go from mocking arrogant hunters around Kalahari campfires to bowing before absolute monarchs on golden thrones?

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

#SimpleHistoryTeller #History #AnimatedHistory #AncientCivilizations #WorldHistory #HistoryDocumentary #OverSimplified #HistoryExplained #EducationalAnimation`;

const TAGS = 'history,first king,ancient history,monarchy,sumerian,sargon of akkad,oversimplified,animation,world history';

// EN Channel ID
const EN_CHANNEL_ID = 'UCvEQdVnctkuYZw3iNDo5krg';

(async () => {
  console.log('=== FRESH UPLOAD: ENGLISH MASTER VIDEO ===');
  console.log('Video:', VIDEO_PATH);
  console.log('Size:', Math.round(fs.statSync(VIDEO_PATH).size / (1024*1024)), 'MB');

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // Step 1: Go to correct channel's studio
  console.log('Step 1: Navigating to YouTube Studio...');
  await page.goto(`https://studio.youtube.com/channel/${EN_CHANNEL_ID}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Take a screenshot to verify current channel
  await page.screenshot({ path: 'tools/en_studio_verify.png' });
  const title = await page.locator('#channel-title, ytcp-entity-page-header .title, #entity-name').first().textContent().catch(() => '');
  console.log('Current channel:', title);

  // If on wrong channel, switch
  if (!title.includes('Simple History Teller') || title.includes('Bangla') || title.includes('Hindi')) {
    console.log('Need to switch to English channel...');
    const avatar = page.locator('#avatar-btn').first();
    await avatar.click();
    await page.waitForTimeout(2000);

    const switchItem = page.locator('tp-yt-paper-item:has-text("Switch account"), ytcp-text-menu-item:has-text("Switch account")').first();
    await switchItem.click();
    await page.waitForTimeout(2000);

    // Pick the English (not Bangla, not Hindi)
    const allRenderers = await page.locator('ytd-account-item-renderer').all();
    for (const r of allRenderers) {
      const t = await r.textContent().catch(() => '');
      if (t.includes('Simple History Teller') && !t.includes('Bangla') && !t.includes('Hindi')) {
        console.log('Clicking English channel:', t.trim().substring(0, 50));
        await r.click();
        break;
      }
    }
    await page.waitForTimeout(8000);
    await page.goto(`https://studio.youtube.com/channel/${EN_CHANNEL_ID}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
  }

  // Step 2: Open Upload dialog
  console.log('Step 2: Opening upload dialog...');
  const createBtn = page.locator('#create-icon, ytcp-button:has-text("Upload videos"), button:has-text("Upload")').first();
  await createBtn.click();
  await page.waitForTimeout(1000);

  const uploadMenu = page.locator('tp-yt-paper-item:has-text("Upload videos"), ytd-compact-link-renderer:has-text("Upload videos")').first();
  if (await uploadMenu.isVisible({ timeout: 3000 }).catch(() => false)) {
    await uploadMenu.click();
    await page.waitForTimeout(2000);
  }

  // Step 3: Attach video via CDP (bypasses 50MB WS limit)
  console.log('Step 3: Attaching video via CDP...');
  const cdp = await page.context().newCDPSession(page);
  const docResult = await cdp.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', {
    nodeId: docResult.root.nodeId,
    selector: 'input[type="file"]'
  });
  if (!nodeIds || nodeIds.length === 0) throw new Error('No file input found!');

  await cdp.send('DOM.setFileInputFiles', { files: [VIDEO_PATH], nodeId: nodeIds[0] });
  console.log('Video file attached! Waiting 15s for upload to start...');
  await page.waitForTimeout(15000);

  // Step 4: Fill Title
  console.log('Step 4: Setting title...');
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
  }, TITLE);
  await page.waitForTimeout(1000);

  // Step 5: Fill Description
  console.log('Step 5: Setting description...');
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
  }, DESCRIPTION);
  await page.waitForTimeout(1000);

  // Step 6: Upload thumbnail
  console.log('Step 6: Uploading thumbnail...');
  try {
    // Scroll to thumbnail section
    const thumbSection = page.locator('ytcp-thumbnail-selector, ytcp-thumbnails-compact').first();
    if (await thumbSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await thumbSection.scrollIntoViewIfNeeded();
    }
    // Try upload custom thumbnail
    const uploadThumbBtn = page.locator('#select-button, ytcp-thumbnail-button #select-button, [aria-label*="Upload thumbnail"], [aria-label*="thumbnail"]').first();
    if (await uploadThumbBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const [fc] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 8000 }),
        uploadThumbBtn.click()
      ]);
      await fc.setFiles(THUMB_PATH);
      console.log('Thumbnail uploaded!');
      await page.waitForTimeout(3000);
    } else {
      // fallback: CDP on thumbnail input
      const thumbInputs = await cdp.send('DOM.querySelectorAll', {
        nodeId: docResult.root.nodeId,
        selector: 'input[type="file"][accept*="image"]'
      });
      if (thumbInputs.nodeIds && thumbInputs.nodeIds.length > 0) {
        await cdp.send('DOM.setFileInputFiles', { files: [THUMB_PATH], nodeId: thumbInputs.nodeIds[0] });
        console.log('Thumbnail attached via CDP fallback!');
        await page.waitForTimeout(3000);
      }
    }
  } catch (e) {
    console.warn('Thumbnail upload warning (will continue):', e.message);
  }

  // Step 7: Not for kids
  console.log('Step 7: Setting audience (Not for kids)...');
  const notKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notKids.isVisible({ timeout: 3000 }).catch(() => false)) {
    await notKids.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // Step 8: Tags (Show More)
  console.log('Step 8: Adding tags...');
  const showMore = page.locator('button:has-text("SHOW MORE"), button:has-text("Show more"), ytcp-button#toggle-button').first();
  if (await showMore.isVisible({ timeout: 3000 }).catch(() => false)) {
    await showMore.scrollIntoViewIfNeeded();
    await showMore.click({ force: true });
    await page.waitForTimeout(1500);
  }
  const tagsInput = page.locator('input[aria-label="Tags"], input[placeholder*="Add tag"]').first();
  if (await tagsInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await tagsInput.scrollIntoViewIfNeeded();
    await tagsInput.click();
    await tagsInput.fill(TAGS);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'tools/en_details_step.png' });

  // Step 9: Next x3
  console.log('Step 9: Clicking Next (Details -> Elements)...');
  const nextBtn = page.locator('#next-button').first();
  await nextBtn.click();
  await page.waitForTimeout(3000);

  console.log('Step 9b: Clicking Next (Elements -> Checks)...');
  await nextBtn.click();
  await page.waitForTimeout(3000);

  console.log('Step 9c: Clicking Next (Checks -> Visibility)...');
  await nextBtn.click();
  await page.waitForTimeout(3000);

  // Step 10: Set Public
  console.log('Step 10: Setting visibility to Public...');
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
  if (await pubRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
    await pubRadio.click({ force: true });
    await page.waitForTimeout(1500);
  }

  // Grab the video link
  const videoHref = await page.locator('a.ytcp-video-info, a[href*="youtu.be"]').first().getAttribute('href').catch(() => null);
  console.log('Video link:', videoHref);

  await page.screenshot({ path: 'tools/en_visibility_step.png' });

  // Step 11: Publish
  console.log('Step 11: Clicking Publish...');
  const doneBtn = page.locator('#done-button').first();
  await doneBtn.waitFor({ state: 'visible', timeout: 10000 });
  await doneBtn.click({ force: true });
  console.log('Published! Waiting 15s...');
  await page.waitForTimeout(15000);

  await page.screenshot({ path: 'tools/en_published_final.png' });
  fs.copyFileSync('tools/en_published_final.png', path.join(ARTIFACT_DIR, 'en_published_final.png'));

  console.log('\n===========================================');
  console.log('ENGLISH MASTER VIDEO PUBLISHED!');
  console.log('Link:', videoHref);
  console.log('===========================================\n');

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
