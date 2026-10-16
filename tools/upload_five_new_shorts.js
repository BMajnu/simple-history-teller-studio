const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const SHORTS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full');
const THUMBS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'shorts_full');
const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const shortsData = [
  {
    part: 1,
    file: path.join(SHORTS_DIR, 'short_bn_full1.mp4'),
    thumb: path.join(THUMBS_DIR, 'thumb_full_part1.jpg'),
    title: 'মানুষের প্রথম রাজা? শিকারিকে উপহাস! 👑 [১ম পর্ব] #Shorts #ইতিহাস',
    description: `৩ লক্ষ বছর রাজা ছাড়াই মানুষ বাঁচত কীভাবে? কালাহারির শিকারিরা অহংকারীকে হাসিয়ে থামিয়ে দিত!

👑 সম্পূর্ণ ১৫ মিনিটের মূল তথ্যচিত্র দেখুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation`
  },
  {
    part: 2,
    file: path.join(SHORTS_DIR, 'short_bn_full2.mp4'),
    thumb: path.join(THUMBS_DIR, 'thumb_full_part2.jpg'),
    title: 'কৃষির মারণফাঁদ ও লোভের জন্ম! 🌾 [২য় পর্ব] #Shorts #ইতিহাস',
    description: `শস্যভাণ্ডার ভরতেই এলো লোভ আর ভয়! কৃষিকাজের ফাঁদে আটকে যাওয়া মানুষ নিরাপত্তার জন্য প্রথম হাত পাতল।

🌾 সম্পূর্ণ ১৫ মিনিটের মূল তথ্যচিত্র দেখুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation`
  },
  {
    part: 3,
    file: path.join(SHORTS_DIR, 'short_bn_full3.mp4'),
    thumb: path.join(THUMBS_DIR, 'thumb_full_part3.jpg'),
    title: 'পৃথিবীর প্রথম চাঁদাবাজি ও ইতিহাসের প্রথম ডন! ⚔️ [৩য় পর্ব] #Shorts #ইতিহাস',
    description: `ফসলের ২০% কর দাও, নইলে...! মানব ইতিহাসের প্রথম চাঁদাবাজি আর প্রথম ডনের আসল ইতিহাস!

⚔️ সম্পূর্ণ ১৫ মিনিটের মূল তথ্যচিত্র দেখুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation`
  },
  {
    part: 4,
    file: path.join(SHORTS_DIR, 'short_bn_full4.mp4'),
    thumb: path.join(THUMBS_DIR, 'thumb_full_part4.jpg'),
    title: 'সুমেরীয় সম্রাট ও প্রথম সিংহাসন! 🏛️ [৪র্থ পর্ব] #Shorts #ইতিহাস',
    description: `আকাশ থেকে নামল রাজতন্ত্র! সুমেরীয় রাজাতালিকা, সোনার মুকুট আর প্রথম স্থায়ী সেনাবাহিনীর ইতিহাস!

🏛️ সম্পূর্ণ ১৫ মিনিটের মূল তথ্যচিত্র দেখুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation`
  },
  {
    part: 5,
    file: path.join(SHORTS_DIR, 'short_bn_full5.mp4'),
    thumb: path.join(THUMBS_DIR, 'thumb_full_part5.jpg'),
    title: 'রাজার পতন ও আধুনিক রাষ্ট্রের জন্ম! ⏳ [৫ম পর্ব] #Shorts #ইতিহাস',
    description: `সব রাজারই পতন ঘটে! জাদুঘরের শবাধার থেকে আধুনিক রাষ্ট্র — ক্ষমতার চিরন্তন সত্য ইতিহাস!

⏳ সম্পূর্ণ ১৫ মিনিটের মূল তথ্যচিত্র দেখুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation`
  }
];

function bringToFront() {
  try {
    execSync('powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Chrome\')"', { stdio: 'ignore' });
  } catch (e) {}
}

async function dismissPopups(page) {
  try {
    const dialogBtn = page.locator('#confirm-button, button:has-text("Dismiss"), button:has-text("Continue"), ytcp-button:has-text("Continue")').first();
    if (await dialogBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await dialogBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }
  } catch (e) {}
}

async function uploadSingleShort(ctx, item) {
  console.log(`\n======================================================`);
  console.log(`🚀 UPLOADING FULL SHORT PART ${item.part}: ${item.title}`);
  console.log(`Video File: ${item.file}`);
  console.log(`Thumbnail:  ${item.thumb}`);
  console.log(`======================================================`);

  const page = await ctx.newPage();
  await bringToFront();

  // Navigate to YouTube Studio upload
  console.log('Navigating to YouTube Studio channel videos...');
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/upload?d=pt', {
    waitUntil: 'domcontentloaded',
    timeout: 45000
  });
  await page.waitForTimeout(4000);
  await dismissPopups(page);
  await bringToFront();

  // Trigger Create / Upload Modal
  console.log('Triggering upload modal...');
  const createBtn = page.locator('#create-icon, button:has-text("Create"), ytcp-button:has-text("Create"), button:has-text("তৈরি করুন")').first();
  if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await createBtn.click();
    await page.waitForTimeout(1000);
    const uploadItem = page.locator('tp-yt-paper-item:has-text("Upload videos"), ytd-compact-link-renderer:has-text("Upload videos"), [aria-label*="Upload"]').first();
    if (await uploadItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadItem.click();
      await page.waitForTimeout(3000);
    }
  } else {
    const uploadBtn = page.locator('ytcp-button:has-text("Upload videos"), button:has-text("Upload videos"), #upload-button').first();
    if (await uploadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  // Attach video file
  console.log('Attaching video file...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: 'attached', timeout: 30000 });
  await fileInput.setInputFiles(item.file);

  console.log('Video attached! Waiting 10s for details form...');
  await page.waitForTimeout(10000);
  await bringToFront();

  // Fill Title
  console.log('Setting title...');
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
  }, item.title);
  await page.waitForTimeout(1000);

  // Fill Description
  console.log('Setting description...');
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
  }, item.description);
  await page.waitForTimeout(1000);

  // Attach Thumbnail in upload modal if available
  console.log('Attempting to attach thumbnail in upload modal...');
  try {
    const thumbInput = page.locator('input#file-loader, ytcp-thumbnails-compact input[type="file"]').first();
    if (await thumbInput.count() > 0) {
      await thumbInput.setInputFiles(item.thumb);
      console.log('Thumbnail attached in upload modal!');
      await page.waitForTimeout(3000);
    }
  } catch (e) {
    console.log('Thumbnail in modal note:', e.message);
  }

  // Set Audience: Not made for kids
  console.log('Setting Not made for kids...');
  const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKids.isVisible({ timeout: 5000 }).catch(() => false)) {
    await notForKids.click({ force: true });
    await page.waitForTimeout(500);
  }

  // Get Video URL / Video ID from dialog
  let videoUrl = await page.locator('a.ytcp-video-info, a[href*="youtu.be"], a[href*="/shorts/"]').first().getAttribute('href').catch(() => null);
  console.log('Video URL detected:', videoUrl);
  let videoId = null;
  if (videoUrl) {
    const match = videoUrl.match(/(?:youtu\.be\/|shorts\/|watch\?v=)([^/?&]+)/);
    if (match) videoId = match[1];
    else videoId = videoUrl.split('/').pop().split('?')[0];
  }
  console.log('Video ID extracted:', videoId);

  // Next -> Elements -> Next -> Checks -> Next -> Visibility
  const nextBtn = page.locator('#next-button').first();
  console.log('Proceeding through upload wizard...');
  await nextBtn.click();
  await page.waitForTimeout(2500);

  await nextBtn.click();
  await page.waitForTimeout(2500);

  await nextBtn.click();
  await page.waitForTimeout(2500);

  // Set Public visibility
  console.log('Selecting Public visibility...');
  const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
  if (await publicRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
    await publicRadio.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // Capture preview screenshot of staged upload
  const previewPath = path.resolve(ROOT, 'tools', `new_short_part${item.part}_staged.png`);
  await page.screenshot({ path: previewPath });
  console.log(`Saved staged preview to ${previewPath}`);

  // Click Publish (#done-button)
  console.log('Publishing Short...');
  const doneBtn = page.locator('#done-button').first();
  await doneBtn.waitFor({ state: 'visible', timeout: 5000 });
  await doneBtn.click({ force: true });
  console.log('Clicked Publish! Waiting 12s for upload dialog to process...');
  await page.waitForTimeout(12000);

  // Close close-button if present
  const closeBtn = page.locator('ytcp-button#close-button, button:has-text("Close"), button:has-text("বন্ধ করুন")').first();
  if (await closeBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await closeBtn.click().catch(() => {});
    await page.waitForTimeout(2000);
  }

  // Ensure custom thumbnail is properly set via edit page if videoId was captured
  if (videoId) {
    console.log(`Navigating to edit page to verify/set custom thumbnail: https://studio.youtube.com/video/${videoId}/edit`);
    await page.goto(`https://studio.youtube.com/video/${videoId}/edit`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    // Scroll to thumbnail
    await page.evaluate(() => {
      const m = document.querySelector('main#main');
      if (m) m.scrollTop = 500;
    });
    await page.waitForTimeout(1000);

    const editThumbInput = page.locator('input#file-loader, ytcp-thumbnails-compact input[type="file"], input[type="file"]').first();
    if (await editThumbInput.count() > 0) {
      console.log('Setting custom thumbnail on edit page...');
      await editThumbInput.setInputFiles(item.thumb);
      await page.waitForTimeout(4000);

      const saveBtn = page.locator('#save-button, ytcp-button#save-button, button:has-text("Save"), button:has-text("সংরক্ষণ করুন")').first();
      if (await saveBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
        const ariaDisabled = await saveBtn.getAttribute('aria-disabled');
        if (ariaDisabled !== 'true') {
          await saveBtn.click({ force: true });
          console.log('Saved custom thumbnail on edit page!');
          await page.waitForTimeout(4000);
        }
      }
    }
  }

  await page.screenshot({ path: path.resolve(ROOT, 'tools', `new_short_part${item.part}_final.png`) });
  await page.close();
  console.log(`=== FULL SHORT PART ${item.part} SUCCESSFULLY PROCESSED! ===\n`);
}

(async () => {
  let browser, ctx;
  try {
    console.log('Attempting connection to Chrome CDP at http://127.0.0.1:9224 ...');
    browser = await chromium.connectOverCDP('http://127.0.0.1:9224', { timeout: 3000 });
    ctx = browser.contexts()[0];
    console.log('Successfully connected to Chrome via CDP!');
  } catch (e) {
    console.log('CDP connection not available, launching persistent Chrome instance...');
    ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: false,
      executablePath: CHROME_PATH,
      args: [
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
        '--remote-debugging-port=9224'
      ],
      viewport: null
    });
    browser = ctx;
    console.log('Persistent Chrome instance launched successfully!');
  }

  bringToFront();

  for (const item of shortsData) {
    await uploadSingleShort(ctx, item);
  }

  // Final Overview
  console.log('Capturing final Shorts library overview...');
  const page = await ctx.newPage();
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: path.resolve(ROOT, 'tools', 'final_five_shorts_overview.png') });
  console.log('Saved tools/final_five_shorts_overview.png');
  await page.close();

  console.log('=== ALL 5 FULL SHORTS UPLOADED WITH HIGH-CTR CUSTOM THUMBNAILS! ===');
  process.exit(0);
})().catch(err => {
  console.error('Error during 5 shorts upload:', err);
  process.exit(1);
});
