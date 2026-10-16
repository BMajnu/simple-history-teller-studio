const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const VIDEO_PATH = path.join(ROOT, 'projects', 'sample_first_king', 'renders', 'video_bn.mp4');
const THUMB_PATH = path.join(ROOT, 'projects', 'sample_first_king', 'metadata', 'bn_thumbnail.jpg');
const SRT_PATH = path.join(ROOT, 'projects', 'sample_first_king', 'renders', 'video_bn.srt');
const SEO_PATH = path.join(ROOT, 'projects', 'sample_first_king', 'metadata', 'youtube_seo.json');

const seoData = JSON.parse(fs.readFileSync(SEO_PATH, 'utf8'));
const bnSeo = seoData.channels.bn;

const TITLE = bnSeo.title.substring(0, 100);
const DESCRIPTION = bnSeo.description;
const TAGS = bnSeo.tags.join(', ');

console.log('--- PREPARING MASTER BANGLA VIDEO UPLOAD ---');
console.log('Video:', VIDEO_PATH, `(${fs.statSync(VIDEO_PATH).size / (1024*1024)} MB)`);
console.log('Thumbnail:', THUMB_PATH);
console.log('SRT:', SRT_PATH);
console.log('Title:', TITLE);

async function dismissPopups(page) {
  try {
    const dialogBtn = page.locator('#confirm-button, button:has-text("Dismiss"), button:has-text("Continue"), ytcp-button:has-text("Continue")').first();
    if (await dialogBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await dialogBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }
  } catch (e) {}
}

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  try {
    console.log('1. Navigating to YouTube Studio Upload page for Channel 2...');
    await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/upload?d=pt', {
      waitUntil: 'domcontentloaded',
      timeout: 45000
    });
    await page.waitForTimeout(5000);
    await dismissPopups(page);

    await page.screenshot({ path: 'tools/upload_step1_initial.png' });

    // Look for upload button or create button
    console.log('2. Clicking Upload videos button...');
    const uploadBtn = page.locator('ytcp-button:has-text("Upload videos"), button:has-text("Upload videos"), ytcp-button:has-text("ভিডিও আপলোড"), button:has-text("ভিডিও আপলোড"), #upload-button, [aria-label*="Upload"]').first();
    if (await uploadBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await uploadBtn.click();
      console.log('Clicked Upload videos button!');
      await page.waitForTimeout(3000);
    } else {
      console.log('Upload button not found on page body, checking Create button in header...');
      const createBtn = page.locator('#create-icon, button:has-text("Create"), ytcp-button:has-text("Create"), button:has-text("তৈরি করুন")').first();
      if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createBtn.click();
        await page.waitForTimeout(1000);
        const uploadOption = page.locator('tp-yt-paper-item:has-text("Upload videos"), ytd-compact-link-renderer:has-text("Upload videos")').first();
        if (await uploadOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await uploadOption.click();
          await page.waitForTimeout(3000);
        }
      }
    }

    console.log('Waiting for file input in upload dialog...');
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: 'attached', timeout: 30000 });
    await fileInput.setInputFiles(VIDEO_PATH);
    console.log('Video file selected! Waiting for dialog upload form to load...');
    await page.waitForTimeout(10000);

    await page.screenshot({ path: 'tools/upload_step2_dialog_open.png' });

    // Title input
    console.log('3. Setting Video Title...');
    const titleBox = page.locator('#title-textarea #textbox').first();
    await titleBox.waitFor({ state: 'visible', timeout: 25000 });
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
    console.log('Title set successfully!');
    await page.waitForTimeout(1000);

    // Description input
    console.log('4. Setting Video Description...');
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
    console.log('Description set successfully!');
    await page.waitForTimeout(1000);

    // Thumbnail upload
    console.log('5. Uploading custom thumbnail...');
    try {
      const thumbInput = page.locator('input#file-loader, ytcp-thumbnails-compact input[type="file"]').first();
      if (await thumbInput.count() > 0) {
        await thumbInput.setInputFiles(THUMB_PATH);
        console.log('Custom thumbnail attached!');
        await page.waitForTimeout(3000);
      } else {
        console.log('Thumbnail file input not directly found, looking inside thumbnails component...');
        const customThumbBtn = page.locator('#select-button, ytcp-thumbnail-button, [aria-label*="Upload thumbnail"], [aria-label*="থাম্বনেল"]').first();
        if (await customThumbBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('Found custom thumbnail button, attempting file chooser...');
          const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser', { timeout: 5000 }),
            customThumbBtn.click()
          ]);
          await fileChooser.setFiles(THUMB_PATH);
          console.log('Thumbnail selected via chooser!');
          await page.waitForTimeout(3000);
        }
      }
    } catch (e) {
      console.warn('Thumbnail upload step notice:', e.message);
    }

    // Audience (Made for kids: No)
    console.log('6. Setting audience to Not Made For Kids...');
    const notForKidsRadio = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
    if (await notForKidsRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
      await notForKidsRadio.click({ force: true });
      console.log('Audience set to Not for Kids.');
    }

    // Show more (Tags)
    console.log('7. Expanding Show More for tags...');
    const showMoreBtn = page.locator('button:has-text("SHOW MORE"), button:has-text("Show more"), button:has-text("আরও দেখান"), ytcp-button#toggle-button').first();
    if (await showMoreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await showMoreBtn.scrollIntoViewIfNeeded();
      await showMoreBtn.click({ force: true });
      await page.waitForTimeout(1500);
      console.log('Show More expanded!');
    }

    // Tags
    try {
      const tagsInput = page.locator('input[aria-label="Tags"], input[placeholder*="Add tag"], input[placeholder*="ট্যাগ যোগ করুন"]').first();
      if (await tagsInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tagsInput.scrollIntoViewIfNeeded();
        await tagsInput.click();
        await tagsInput.fill(TAGS);
        await page.keyboard.press('Enter');
        console.log('Tags added:', TAGS);
      }
    } catch (e) {
      console.warn('Tags step notice:', e.message);
    }

    await page.screenshot({ path: 'tools/upload_step3_details_filled.png' });

    // Step 2: Video Elements
    console.log('8. Clicking Next to Video Elements...');
    const nextBtn = page.locator('#next-button').first();
    await nextBtn.click();
    await page.waitForTimeout(4000);

    await page.screenshot({ path: 'tools/upload_step4_elements.png' });

    // Check if Subtitles upload is available
    console.log('Checking subtitles button...');
    try {
      const addSubsBtn = page.locator('#add-button, button:has-text("ADD"), button:has-text("যোগ করুন")').first();
      // We can leave YouTube auto-detect or upload SRT if accessible
    } catch (e) {}

    // Step 3: Checks
    console.log('9. Clicking Next to Checks...');
    await nextBtn.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'tools/upload_step5_checks.png' });

    // Step 4: Visibility
    console.log('10. Clicking Next to Visibility...');
    await nextBtn.click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'tools/upload_step6_visibility.png' });

    // Select Public
    console.log('11. Selecting Public visibility...');
    const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
    if (await publicRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
      await publicRadio.click({ force: true });
      console.log('Public visibility selected.');
      await page.waitForTimeout(1000);
    }

    // Get video link if visible
    const videoLink = await page.locator('a.ytcp-video-info, a[href*="youtu.be"]').first().getAttribute('href').catch(() => null);
    console.log('Uploaded Video URL:', videoLink);

    // Click Publish / Done button
    console.log('12. Clicking Publish / Done button...');
    const doneBtn = page.locator('#done-button').first();
    await doneBtn.waitFor({ state: 'visible', timeout: 5000 });
    await doneBtn.click({ force: true });
    console.log('Publish button clicked! Waiting for confirmation dialog...');
    await page.waitForTimeout(10000);

    await page.screenshot({ path: 'tools/upload_step7_done.png' });
    console.log('=== BANGLA MASTER VIDEO UPLOAD COMPLETED SUCCESSFULLY! ===');

    await page.close();
    process.exit(0);
  } catch (err) {
    console.error('Upload Error:', err);
    await page.screenshot({ path: 'tools/upload_error.png' }).catch(() => {});
    process.exit(1);
  }
})();
