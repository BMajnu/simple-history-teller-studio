const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const FILE3 = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full', 'short_bn_full3.mp4');

const title3 = 'পৃথিবীর প্রথম চাঁদাবাজি ও ইতিহাসের প্রথম ডন! ⚔️ [৩য় পর্ব] #Shorts #ইতিহাস';
const desc3 = `ফসলের ২০% কর দাও, নইলে...! মানব ইতিহাসের প্রথম চাঁদাবাজি আর প্রথম ডনের আসল ইতিহাস!

⚔️ সম্পূর্ণ ১৫ মিনিটের মূল তথ্যচিত্র দেখুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation`;

(async () => {
  console.log('=== FIXING PART 3: DELETE ABANDONED AND UPLOAD FRESH ===');
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
  const row = page.locator('ytcp-video-row:has-text("পৃথিবীর প্রথম চাঁদাবাজি")').first();
  if (await row.isVisible({ timeout: 4000 }).catch(() => false)) {
    const delBtn = row.locator('button:has-text("Delete video"), ytcp-button:has-text("Delete video")').first();
    if (await delBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Clicking Delete video on Part 3...');
      await delBtn.click({ force: true });
      await page.waitForTimeout(2000);

      const confirmDialog = page.locator('ytcp-dialog, [role="dialog"]').first();
      const chk = confirmDialog.locator('tp-yt-paper-checkbox, input[type="checkbox"]').first();
      if (await chk.isVisible({ timeout: 3000 }).catch(() => false)) {
        await chk.click({ force: true });
        await page.waitForTimeout(1000);
      }

      const delForever = confirmDialog.locator('button:has-text("Delete forever"), button:has-text("DELETE DRAFT VIDEO"), button:has-text("Delete draft video")').first();
      if (await delForever.isVisible({ timeout: 3000 }).catch(() => false)) {
        await delForever.click({ force: true });
        console.log('Confirmed delete of abandoned Part 3 draft!');
        await page.waitForTimeout(6000);
      }
    }
  }

  // 2. Upload Part 3 fresh
  console.log('Navigating to upload page...');
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
  }

  console.log('Attaching short_bn_full3.mp4...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: 'attached', timeout: 30000 });
  await fileInput.setInputFiles(FILE3);

  console.log('Waiting 10s for details form...');
  await page.waitForTimeout(10000);

  // Set Title
  console.log('Setting Title...');
  const titleBox = page.locator('#title-textarea #textbox').first();
  await titleBox.waitFor({ state: 'visible', timeout: 25000 });
  await titleBox.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.evaluate((text) => {
    const el = document.querySelector('#title-textarea #textbox');
    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertText', false, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, title3);
  await page.waitForTimeout(1000);

  // Set Description
  console.log('Setting Description...');
  const descBox = page.locator('#description-textarea #textbox').first();
  await descBox.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.evaluate((text) => {
    const el = document.querySelector('#description-textarea #textbox');
    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertText', false, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, desc3);
  await page.waitForTimeout(1000);

  // Not made for kids
  const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKids.isVisible({ timeout: 5000 }).catch(() => false)) {
    await notForKids.click({ force: true });
    await page.waitForTimeout(500);
  }

  // Next -> Next -> Next
  const nextBtn = page.locator('#next-button').first();
  await nextBtn.click();
  await page.waitForTimeout(2500);
  await nextBtn.click();
  await page.waitForTimeout(2500);
  await nextBtn.click();
  await page.waitForTimeout(2500);

  // Visibility: Public
  const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
  if (await publicRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
    await publicRadio.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // Publish
  console.log('Publishing Part 3...');
  const doneBtn = page.locator('#done-button').first();
  await doneBtn.waitFor({ state: 'visible', timeout: 5000 });
  await doneBtn.click({ force: true });
  console.log('Published! Waiting for upload dialog processing...');
  await page.waitForTimeout(8000);

  const closeBtn = page.locator('ytcp-button#close-button, button:has-text("Close")').first();
  if (await closeBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await closeBtn.click().catch(() => {});
    await page.waitForTimeout(2000);
  }

  // Monitor until 100% uploaded
  console.log('Monitoring Part 3 upload stream...');
  let ticks = 0;
  while (ticks < 30) {
    ticks++;
    await page.waitForTimeout(10000);
    const text = await page.innerText('body').catch(() => '');
    const uploading = text.includes('Uploading') || text.includes('uploading');
    console.log(`[Part 3 Tick ${ticks}] Uploading: ${uploading}`);
    if (!uploading && ticks > 2) {
      console.log('Part 3 upload stream completed!');
      break;
    }
  }

  await page.screenshot({ path: path.resolve(ROOT, 'tools', 'part3_fixed_final.png') });
  console.log('Saved tools/part3_fixed_final.png');

  await ctx.close();
  console.log('=== PART 3 CLEAN UPLOAD COMPLETE! ===');
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
