/**
 * upload_en_master_v2.js
 * Upload English master video - navigates directly to EN channel by channel ID
 */

const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const VIDEO_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'video_en.mp4');
const THUMB_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'en_thumbnail_optimized.jpg');
const EN_CHANNEL_ID = 'UCvEQdVnctkuYZw3iNDo5krg';

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

(async () => {
  console.log('=== UPLOADING ENGLISH MASTER VIDEO ===');
  console.log('Video:', VIDEO_PATH, `(${Math.round(fs.statSync(VIDEO_PATH).size/(1024*1024))} MB)`);

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // Navigate to English channel upload page directly
  console.log('Navigating to English channel Studio...');
  await page.goto(`https://studio.youtube.com/channel/${EN_CHANNEL_ID}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  const channelName = await page.locator('#entity-name').first().textContent().catch(() => 'unknown');
  console.log('On channel:', channelName);
  await page.screenshot({ path: 'tools/en_v2_channel_check.png' });

  // If on wrong channel, switch
  if (!channelName.includes('Simple History Teller') || channelName.includes('Hindi') || channelName.includes('Bangla')) {
    console.log('Wrong channel! Need to switch. Clicking channel avatar...');
    // Use page.evaluate to find and click avatar
    await page.evaluate(() => {
      const img = document.querySelector('ytcp-app-header img, #avatar-btn img, img.ytcp-account-icon');
      if (img) { img.closest('button, ytcp-icon-button')?.click() || img.click(); }
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tools/en_v2_avatar_menu.png' });

    const switchItem = page.locator('text=Switch account').first();
    if (await switchItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      await switchItem.click();
      await page.waitForTimeout(2000);
    }
    // Find and click the Simple History Teller (English) account
    const items = await page.locator('ytd-account-item-renderer').all();
    for (const item of items) {
      const t = await item.textContent().catch(() => '');
      if (t.includes('Simple History Teller') && !t.includes('Hindi') && !t.includes('Bangla')) {
        await item.click();
        await page.waitForTimeout(8000);
        break;
      }
    }
    await page.goto(`https://studio.youtube.com/channel/${EN_CHANNEL_ID}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
  }

  // Click Create button
  console.log('Clicking Create button...');
  const createBtn = page.locator('button[aria-label="Create"], #create-icon').first();
  await createBtn.waitFor({ state: 'visible', timeout: 15000 });
  await createBtn.click();
  await page.waitForTimeout(1000);

  // Click "Upload videos" from dropdown
  const uploadVideosItem = page.locator('tp-yt-paper-item:has-text("Upload videos")').first();
  if (await uploadVideosItem.isVisible({ timeout: 5000 }).catch(() => false)) {
    await uploadVideosItem.click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tools/en_v2_upload_dialog.png' });
  console.log('Upload dialog opened, screenshot saved');

  // Wait for file input
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: 'attached', timeout: 20000 });
  console.log('File input found! Attaching video via CDP...');

  // CDP for large file
  const cdp = await page.context().newCDPSession(page);
  const doc = await cdp.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });
  if (!nodeIds || nodeIds.length === 0) throw new Error('File input not found via CDP!');

  await cdp.send('DOM.setFileInputFiles', { files: [VIDEO_PATH], nodeId: nodeIds[0] });
  console.log('Video attached! Waiting 15s for form fields...');
  await page.waitForTimeout(15000);

  // Title
  console.log('Setting title...');
  const titleBox = page.locator('#title-textarea #textbox').first();
  await titleBox.waitFor({ state: 'visible', timeout: 30000 });
  await titleBox.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await page.evaluate((txt) => {
    const el = document.querySelector('#title-textarea #textbox');
    el?.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertText', false, txt);
    el?.dispatchEvent(new Event('input', { bubbles: true }));
  }, TITLE);
  await page.waitForTimeout(800);

  // Description
  console.log('Setting description...');
  const descBox = page.locator('#description-textarea #textbox').first();
  await descBox.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  await page.evaluate((txt) => {
    const el = document.querySelector('#description-textarea #textbox');
    el?.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertText', false, txt);
    el?.dispatchEvent(new Event('input', { bubbles: true }));
  }, DESCRIPTION);
  await page.waitForTimeout(800);

  // Thumbnail
  console.log('Uploading thumbnail...');
  try {
    const thumbBtns = page.locator('[aria-label*="thumbnail" i], #select-button').all();
    const btns = await thumbBtns;
    for (const btn of btns) {
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        const [fc] = await Promise.all([
          page.waitForEvent('filechooser', { timeout: 6000 }),
          btn.click()
        ]);
        await fc.setFiles(THUMB_PATH);
        console.log('Thumbnail uploaded!');
        await page.waitForTimeout(3000);
        break;
      }
    }
  } catch (e) {
    console.warn('Thumbnail warning:', e.message);
  }

  // Not for kids
  const notKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notKids.isVisible({ timeout: 3000 }).catch(() => false)) {
    await notKids.click({ force: true });
    await page.waitForTimeout(800);
  }

  // Show More > Tags
  const showMore = page.locator('button:has-text("Show more"), ytcp-button#toggle-button').first();
  if (await showMore.isVisible({ timeout: 3000 }).catch(() => false)) {
    await showMore.scrollIntoViewIfNeeded();
    await showMore.click({ force: true });
    await page.waitForTimeout(1200);
  }
  const tagsInput = page.locator('input[aria-label="Tags"]').first();
  if (await tagsInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await tagsInput.scrollIntoViewIfNeeded();
    await tagsInput.fill(TAGS);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
  }

  await page.screenshot({ path: 'tools/en_v2_details_filled.png' });

  // Next x3
  console.log('Next -> Next -> Next...');
  const nextBtn = page.locator('#next-button').first();
  await nextBtn.click(); await page.waitForTimeout(2500);
  await nextBtn.click(); await page.waitForTimeout(2500);
  await nextBtn.click(); await page.waitForTimeout(2500);

  // Public
  console.log('Setting Public...');
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
  if (await pubRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
    await pubRadio.click({ force: true });
    await page.waitForTimeout(1200);
  }

  const videoLink = await page.locator('a[href*="youtu.be"]').first().getAttribute('href').catch(() => null);
  console.log('Video link:', videoLink);
  await page.screenshot({ path: 'tools/en_v2_visibility.png' });

  // Publish
  console.log('Publishing...');
  const doneBtn = page.locator('#done-button').first();
  await doneBtn.waitFor({ state: 'visible', timeout: 10000 });
  await doneBtn.click({ force: true });
  await page.waitForTimeout(15000);

  await page.screenshot({ path: 'tools/en_v2_published.png' });
  fs.copyFileSync('tools/en_v2_published.png', path.join(ARTIFACT_DIR, 'en_v2_published.png'));

  console.log('\n============================================');
  console.log('ENGLISH MASTER VIDEO PUBLISHED!');
  console.log('Link:', videoLink);
  console.log('============================================\n');

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
