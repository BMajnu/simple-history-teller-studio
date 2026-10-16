/**
 * publish_hi_master_fresh.js
 * Uploads video_hi.mp4 to Simple History Teller Hindi YouTube channel
 * with full title, description, tags, thumbnail, and Public visibility.
 */

const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const VIDEO_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'video_hi.mp4');
const THUMB_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'hi_thumbnail_optimized.jpg');
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const TITLE = 'इंसानों ने पहला राजा कैसे बनाया? 👑 तख्त और सत्ता का असली इतिहास | Simple History Teller';
const DESCRIPTION = `3 लाख सालों तक बिना किसी राजा के जीते थे इंसान — तो फिर राजशाही की शुरुआत कैसे हुई? कालाहारी के शिकारियों से लेकर सुमेर के सोने के तख्त तक — यह है सत्ता की असली कहानी।

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

#SimplyHistoryTellerHindi #इतिहास #AnimatedHistory #सुमेर #विश्वइतिहास #HistoryDocumentary #पहलाराजा #HistoryExplained #शिक्षा`;

const TAGS = 'इतिहास,पहला राजा,सुमेरियन,सरगोन,राजशाही,animation,hindi history,ancient history,world history';

// Hindi Channel ID
const HI_CHANNEL_ID = 'UCkG4y9NJQ5yCys3jxFDUOcg';

(async () => {
  console.log('=== FRESH UPLOAD: HINDI MASTER VIDEO ===');
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

  // Step 1: Navigate to Hindi channel studio
  console.log('Step 1: Navigating to Hindi Channel YouTube Studio...');
  await page.goto(`https://studio.youtube.com/channel/${HI_CHANNEL_ID}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'tools/hi_studio_verify.png' });
  const title = await page.locator('#channel-title, ytcp-entity-page-header .title, #entity-name').first().textContent().catch(() => '');
  console.log('Current channel:', title);

  if (!title.includes('Hindi')) {
    console.log('Need to switch to Hindi channel...');
    const avatar = page.locator('#avatar-btn').first();
    await avatar.click();
    await page.waitForTimeout(2000);

    const switchItem = page.locator('tp-yt-paper-item:has-text("Switch account"), ytcp-text-menu-item:has-text("Switch account")').first();
    await switchItem.click();
    await page.waitForTimeout(2000);

    const allRenderers = await page.locator('ytd-account-item-renderer').all();
    for (const r of allRenderers) {
      const t = await r.textContent().catch(() => '');
      if (t.includes('Hindi')) {
        console.log('Clicking Hindi channel:', t.trim().substring(0, 50));
        await r.click();
        break;
      }
    }
    await page.waitForTimeout(8000);
    await page.goto(`https://studio.youtube.com/channel/${HI_CHANNEL_ID}`, { waitUntil: 'domcontentloaded' });
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

  // Step 3: Attach video via CDP
  console.log('Step 3: Attaching video via CDP (bypassing 50MB WS limit)...');
  const cdp = await page.context().newCDPSession(page);
  const docResult = await cdp.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', {
    nodeId: docResult.root.nodeId,
    selector: 'input[type="file"]'
  });
  if (!nodeIds || nodeIds.length === 0) throw new Error('No file input found!');

  await cdp.send('DOM.setFileInputFiles', { files: [VIDEO_PATH], nodeId: nodeIds[0] });
  console.log('Video attached! Waiting 15s for upload to begin processing...');
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
    const thumbSection = page.locator('ytcp-thumbnail-selector, ytcp-thumbnails-compact').first();
    if (await thumbSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await thumbSection.scrollIntoViewIfNeeded();
    }
    const uploadThumbBtn = page.locator('#select-button, [aria-label*="Upload thumbnail"], [aria-label*="thumbnail"]').first();
    if (await uploadThumbBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const [fc] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 8000 }),
        uploadThumbBtn.click()
      ]);
      await fc.setFiles(THUMB_PATH);
      console.log('Thumbnail uploaded!');
      await page.waitForTimeout(3000);
    } else {
      const thumbInputs = await cdp.send('DOM.querySelectorAll', {
        nodeId: docResult.root.nodeId,
        selector: 'input[type="file"][accept*="image"]'
      });
      if (thumbInputs.nodeIds && thumbInputs.nodeIds.length > 0) {
        await cdp.send('DOM.setFileInputFiles', { files: [THUMB_PATH], nodeId: thumbInputs.nodeIds[0] });
        console.log('Thumbnail attached via CDP!');
        await page.waitForTimeout(3000);
      }
    }
  } catch (e) {
    console.warn('Thumbnail warning (continuing):', e.message);
  }

  // Step 7: Not for kids
  console.log('Step 7: Audience = Not for kids...');
  const notKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notKids.isVisible({ timeout: 3000 }).catch(() => false)) {
    await notKids.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // Step 8: Tags
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

  await page.screenshot({ path: 'tools/hi_details_step.png' });

  // Step 9: Next x3
  console.log('Step 9: Clicking Next (Details -> Elements -> Checks -> Visibility)...');
  const nextBtn = page.locator('#next-button').first();
  await nextBtn.click();
  await page.waitForTimeout(3000);
  await nextBtn.click();
  await page.waitForTimeout(3000);
  await nextBtn.click();
  await page.waitForTimeout(3000);

  // Step 10: Public
  console.log('Step 10: Setting Public visibility...');
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
  if (await pubRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
    await pubRadio.click({ force: true });
    await page.waitForTimeout(1500);
  }

  const videoHref = await page.locator('a.ytcp-video-info, a[href*="youtu.be"]').first().getAttribute('href').catch(() => null);
  console.log('Video link:', videoHref);

  await page.screenshot({ path: 'tools/hi_visibility_step.png' });

  // Step 11: Publish
  console.log('Step 11: Clicking Publish...');
  const doneBtn = page.locator('#done-button').first();
  await doneBtn.waitFor({ state: 'visible', timeout: 10000 });
  await doneBtn.click({ force: true });
  console.log('Published! Waiting 15s...');
  await page.waitForTimeout(15000);

  await page.screenshot({ path: 'tools/hi_published_final.png' });
  fs.copyFileSync('tools/hi_published_final.png', path.join(ARTIFACT_DIR, 'hi_published_final.png'));

  console.log('\n===========================================');
  console.log('HINDI MASTER VIDEO PUBLISHED!');
  console.log('Link:', videoHref);
  console.log('===========================================\n');

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
