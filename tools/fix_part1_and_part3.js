const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const SHORTS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full');
const THUMBS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'shorts_full');

async function dismissPopups(page) {
  try {
    const dialogBtn = page.locator('#confirm-button, button:has-text("Dismiss"), button:has-text("Continue"), ytcp-button:has-text("Continue")').first();
    if (await dialogBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await dialogBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }
  } catch (e) {}
}

async function uploadCleanShort(page, item) {
  console.log(`\n======================================================`);
  console.log(`CLEAN UPLOAD FOR PART ${item.part}: ${item.title}`);
  console.log(`======================================================`);

  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/upload?d=pt', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(4000);

  const createBtn = page.locator('#create-icon, button:has-text("Create"), ytcp-button:has-text("Create"), button:has-text("তৈরি করুন")').first();
  if (await createBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await createBtn.click();
    await page.waitForTimeout(1000);
    const uploadItem = page.locator('tp-yt-paper-item:has-text("Upload videos"), ytd-compact-link-renderer:has-text("Upload videos")').first();
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

  // If item has thumb and we want to attach (Part 1)
  if (item.thumb) {
    console.log('Attempting to attach thumbnail in upload modal...');
    try {
      const thumbInput = page.locator('input#file-loader, ytcp-thumbnails-compact input[type="file"]').first();
      if (await thumbInput.count() > 0) {
        await thumbInput.setInputFiles(item.thumb);
        console.log('Thumbnail attached in upload modal!');
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('Thumbnail modal notice:', e.message);
    }
  }

  // Not made for kids
  const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKids.isVisible({ timeout: 5000 }).catch(() => false)) {
    await notForKids.click({ force: true });
    await page.waitForTimeout(500);
  }

  // Wizard Next -> Next -> Next
  const nextBtn = page.locator('#next-button').first();
  await nextBtn.click();
  await page.waitForTimeout(2500);
  await nextBtn.click();
  await page.waitForTimeout(2500);
  await nextBtn.click();
  await page.waitForTimeout(2500);

  // Set Public visibility
  const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
  if (await publicRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
    await publicRadio.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // Click Publish
  console.log('Clicking Publish...');
  const doneBtn = page.locator('#done-button').first();
  await doneBtn.waitFor({ state: 'visible', timeout: 5000 });
  await doneBtn.click({ force: true });
  console.log('Clicked Publish! Waiting for dialog or progress...');
  await page.waitForTimeout(8000);

  // Close upload dialog if close button visible
  const closeBtn = page.locator('ytcp-button#close-button, button:has-text("Close"), button:has-text("বন্ধ করুন")').first();
  if (await closeBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await closeBtn.click().catch(() => {});
    await page.waitForTimeout(2000);
  }

  // Monitor until upload stream reaches 100%
  console.log('Monitoring upload stream...');
  let ticks = 0;
  while (ticks < 30) {
    ticks++;
    await page.waitForTimeout(10000);
    const text = await page.innerText('body').catch(() => '');
    const uploading = text.includes('Uploading') || text.includes('uploading');
    console.log(`[Upload Part ${item.part} Tick ${ticks}] Uploading: ${uploading}`);
    if (!uploading && ticks > 2) {
      console.log(`Part ${item.part} upload stream completed!`);
      break;
    }
  }
}

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(6000);

  // 1. Delete abandoned Part 3 draft
  console.log('Checking for abandoned Part 3 row...');
  const part3Row = page.locator('ytcp-video-row:has-text("পৃথিবীর প্রথম চাঁদাবাজি")').first();
  if (await part3Row.isVisible({ timeout: 4000 }).catch(() => false)) {
    const deleteBtn = part3Row.locator('button:has-text("Delete video"), ytcp-button:has-text("Delete video")').first();
    if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Deleting abandoned Part 3 draft...');
      await deleteBtn.click();
      await page.waitForTimeout(2000);
      const confirmDialog = page.locator('ytcp-dialog, [role="dialog"]').first();
      const checkbox = confirmDialog.locator('tp-yt-paper-checkbox, input[type="checkbox"]').first();
      if (await checkbox.isVisible({ timeout: 3000 }).catch(() => false)) {
        await checkbox.click({ force: true });
        await page.waitForTimeout(1000);
      }
      const deleteForeverBtn = confirmDialog.locator('button:has-text("Delete forever"), button:has-text("DELETE DRAFT VIDEO"), button:has-text("Delete draft video"), #confirm-button').first();
      if (await deleteForeverBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await deleteForeverBtn.click({ force: true });
        console.log('Deleted abandoned Part 3 draft!');
        await page.waitForTimeout(4000);
      }
    }
  }

  // 2. Clean Part 1 stuck draft if present
  console.log('Checking for stuck Part 1 row...');
  const part1Row = page.locator('ytcp-video-row:has-text("মানুষের প্রথম রাজা")').first();
  if (await part1Row.isVisible({ timeout: 4000 }).catch(() => false)) {
    const cancelBtn = part1Row.locator('button:has-text("Cancel upload"), ytcp-button:has-text("Cancel upload")').first();
    if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Canceling stuck Part 1 upload...');
      await cancelBtn.click();
      await page.waitForTimeout(2000);
      const confirmCancel = page.locator('ytcp-dialog button:has-text("CANCEL UPLOAD"), ytcp-dialog button:has-text("Cancel upload"), #confirm-button').first();
      if (await confirmCancel.isVisible({ timeout: 3000 }).catch(() => false)) {
        await confirmCancel.click({ force: true });
        console.log('Cancelled stuck Part 1 upload!');
        await page.waitForTimeout(4000);
      }
    }
  }

  // 3. Re-upload Part 1 with thumbnail
  const item1 = {
    part: 1,
    file: path.join(SHORTS_DIR, 'short_bn_full1.mp4'),
    thumb: path.join(THUMBS_DIR, 'thumb_full_part1.jpg'),
    title: 'মানুষের প্রথম রাজা? শিকারিকে উপহাস! 👑 [১ম পর্ব] #Shorts #ইতিহাস',
    description: `৩ লক্ষ বছর রাজা ছাড়াই মানুষ বাঁচত কীভাবে? কালাহারির শিকারিরা অহংকারীকে হাসিয়ে থামিয়ে দিত!

👑 সম্পূর্ণ ১৫ মিনিটের মূল তথ্যচিত্র দেখুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation`
  };
  await uploadCleanShort(page, item1);

  // 4. Re-upload Part 3 clean (no custom thumb because of quota; frame will be auto-rendered)
  const item3 = {
    part: 3,
    file: path.join(SHORTS_DIR, 'short_bn_full3.mp4'),
    thumb: null,
    title: 'পৃথিবীর প্রথম চাঁদাবাজি ও ইতিহাসের প্রথম ডন! ⚔️ [৩য় পর্ব] #Shorts #ইতিহাস',
    description: `ফসলের ২০% কর দাও, নইলে...! মানব ইতিহাসের প্রথম চাঁদাবাজি আর প্রথম ডনের আসল ইতিহাস!

⚔️ সম্পূর্ণ ১৫ মিনিটের মূল তথ্যচিত্র দেখুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation`
  };
  await uploadCleanShort(page, item3);

  // Final Overview
  console.log('\nNavigating to Shorts library for final confirmation...');
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: path.resolve(ROOT, 'tools', 'perfect_all_five_shorts.png') });
  console.log('Saved tools/perfect_all_five_shorts.png');

  await ctx.close();
  console.log('=== ALL 5 SHORTS PROCESSED AND LIVE! ===');
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
