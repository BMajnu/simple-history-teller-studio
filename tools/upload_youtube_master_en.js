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

const TAGS = 'history, first king, ancient history, monarchy, sumerian, sargon of akkad, oversimplified, simplehistory, animation';

(async () => {
  console.log('=== UPLOADING MASTER ENGLISH VIDEO TO YOUTUBE ===');
  console.log('Video:', VIDEO_PATH, `(${Math.round(fs.statSync(VIDEO_PATH).size / (1024*1024))} MB)`);
  console.log('Thumbnail:', THUMB_PATH);

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // Navigate to English Channel Studio
  console.log('1. Navigating to English Channel YouTube Studio...');
  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Verify English Channel is active
  let currentTitle = await page.locator('#channel-title, ytcp-entity-page-header .title, #entity-name').first().textContent().catch(() => '');
  if (!currentTitle.includes('Simple History Teller') || currentTitle.includes('Bangla') || currentTitle.includes('Hindi')) {
    console.log('Switching to Simple History Teller (English)...');
    const avatar = page.locator('#avatar-btn, button#avatar-btn, ytcp-app-header #avatar-btn').first();
    await avatar.click();
    await page.waitForTimeout(1500);
    const switchItem = page.locator('tp-yt-paper-item:has-text("Switch account"), ytcp-text-menu-item:has-text("Switch account")').first();
    await switchItem.click();
    await page.waitForTimeout(2000);
    const targetChannel = page.locator('ytd-account-item-renderer:has-text("Simple History Teller")').filter({ hasNotText: 'Bangla' }).filter({ hasNotText: 'Hindi' }).first();
    await targetChannel.click();
    await page.waitForTimeout(8000);
  }

  console.log('2. Opening Upload dialog...');
  const createBtn = page.locator('#create-icon, button:has-text("Create"), ytcp-button:has-text("Create"), button:has-text("Upload videos"), ytcp-button:has-text("Upload videos")').first();
  await createBtn.click();
  await page.waitForTimeout(1000);

  const uploadOption = page.locator('tp-yt-paper-item:has-text("Upload videos"), ytd-compact-link-renderer:has-text("Upload videos")').first();
  if (await uploadOption.isVisible({ timeout: 2000 }).catch(() => false)) {
    await uploadOption.click();
    await page.waitForTimeout(2000);
  }

  console.log('3. Attaching video file via CDP session...');
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
    files: [VIDEO_PATH],
    nodeId: nodeIds[0]
  });

  console.log('Video attached! Waiting for metadata fields to load...');
  await page.waitForTimeout(10000);

  // Set Title
  console.log('4. Setting Title...');
  const titleBox = page.locator('#title-textarea #textbox').first();
  await titleBox.waitFor({ state: 'visible', timeout: 30000 });
  await titleBox.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(300);
  await page.evaluate((text) => {
    const el = document.querySelector('#title-textarea #textbox');
    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertText', false, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, TITLE);
  await page.waitForTimeout(1000);

  // Set Description
  console.log('5. Setting Description...');
  const descBox = page.locator('#description-textarea #textbox').first();
  await descBox.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(300);
  await page.evaluate((text) => {
    const el = document.querySelector('#description-textarea #textbox');
    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertText', false, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, DESCRIPTION);
  await page.waitForTimeout(1000);

  // Upload Thumbnail
  console.log('6. Uploading Thumbnail...');
  try {
    const thumbInput = page.locator('input#file-loader, ytcp-thumbnails-compact input[type="file"]').first();
    if (await thumbInput.count() > 0) {
      await thumbInput.setInputFiles(THUMB_PATH);
      console.log('Thumbnail attached via input!');
      await page.waitForTimeout(3000);
    } else {
      const customThumbBtn = page.locator('#select-button, ytcp-thumbnail-button, [aria-label*="Upload thumbnail"]').first();
      if (await customThumbBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        const [fileChooser] = await Promise.all([
          page.waitForEvent('filechooser', { timeout: 5000 }),
          customThumbBtn.click()
        ]);
        if (fileChooser) {
          await fileChooser.setFiles(THUMB_PATH);
          console.log('Thumbnail attached via file chooser!');
          await page.waitForTimeout(3000);
        }
      }
    }
  } catch (e) {
    console.warn('Thumbnail upload note:', e.message);
  }

  // Set Audience: Not Made For Kids
  console.log('7. Setting Audience: Not Made For Kids...');
  const notForKidsRadio = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKidsRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
    await notForKidsRadio.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // Expand Show More for Tags
  console.log('8. Adding Tags...');
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
    await tagsInput.fill(TAGS);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'tools/yt_en_details_filled.png' });

  // Next -> Video Elements
  console.log('9. Clicking Next (to Elements)...');
  const nextBtn = page.locator('#next-button').first();
  await nextBtn.click();
  await page.waitForTimeout(3000);

  // Next -> Checks
  console.log('10. Clicking Next (to Checks)...');
  await nextBtn.click();
  await page.waitForTimeout(3000);

  // Next -> Visibility
  console.log('11. Clicking Next (to Visibility)...');
  await nextBtn.click();
  await page.waitForTimeout(3000);

  // Select Public
  console.log('12. Selecting Public visibility...');
  const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
  if (await publicRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
    await publicRadio.click({ force: true });
    await page.waitForTimeout(1000);
  }

  const videoLink = await page.locator('a.ytcp-video-info, a[href*="youtu.be"]').first().getAttribute('href').catch(() => null);
  console.log('Uploaded Video Link:', videoLink);

  // Click Done/Publish
  console.log('13. Clicking Done / Publish button...');
  const doneBtn = page.locator('#done-button').first();
  await doneBtn.waitFor({ state: 'visible', timeout: 5000 });
  await doneBtn.click({ force: true });
  console.log('Publish button clicked! Waiting 12s for confirmation modal...');
  await page.waitForTimeout(12000);

  const shotPath = 'tools/yt_en_master_uploaded.png';
  await page.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);

  if (fs.existsSync(shotPath)) {
    fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, 'yt_en_master_uploaded.png'));
  }

  console.log('\n==================================================');
  console.log('ENGLISH MASTER VIDEO PUBLISHED TO YOUTUBE!');
  console.log('Link:', videoLink);
  console.log('==================================================\n');

  await page.waitForTimeout(3000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal error during English YouTube upload:', err);
  process.exit(1);
});
