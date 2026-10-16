const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const SHORTS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full');
const THUMBS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'shorts_full');

(async () => {
  console.log('=== UPLOADING PART 1 CLEAN & WAITING FOR 100% COMPLETION ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/upload?d=pt', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(4000);

  // Trigger create modal
  const createBtn = page.locator('#create-icon, button:has-text("Create"), ytcp-button:has-text("Create")').first();
  if (await createBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await createBtn.click();
    await page.waitForTimeout(1000);
    const uploadItem = page.locator('tp-yt-paper-item:has-text("Upload videos"), ytd-compact-link-renderer:has-text("Upload videos")').first();
    if (await uploadItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadItem.click();
      await page.waitForTimeout(3000);
    }
  }

  // Attach short_bn_full1.mp4
  console.log('Attaching short_bn_full1.mp4...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: 'attached', timeout: 30000 });
  await fileInput.setInputFiles(path.join(SHORTS_DIR, 'short_bn_full1.mp4'));

  console.log('File attached! Waiting 10s for details form...');
  await page.waitForTimeout(10000);

  // Set Title using evaluate
  console.log('Setting Title...');
  await page.evaluate(() => {
    const el = document.querySelector('#title-textarea #textbox');
    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertText', false, 'মানুষের প্রথম রাজা? শিকারিকে উপহাস! 👑 [১ম পর্ব] #Shorts #ইতিহাস');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(1000);

  // Set Description
  console.log('Setting Description...');
  const desc = `৩ লক্ষ বছর রাজা ছাড়াই মানুষ বাঁচত কীভাবে? কালাহারির শিকারিরা অহংকারীকে হাসিয়ে থামিয়ে দিত!

👑 সম্পূর্ণ ১৫ মিনিটের মূল তথ্যচিত্র দেখুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation`;
  await page.evaluate((text) => {
    const el = document.querySelector('#description-textarea #textbox');
    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertText', false, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, desc);
  await page.waitForTimeout(1000);

  // Attach Thumbnail (thumb_full_part1.jpg)
  console.log('Attaching thumbnail...');
  try {
    const thumbInput = page.locator('input#file-loader, ytcp-thumbnails-compact input[type="file"]').first();
    if (await thumbInput.count() > 0) {
      await thumbInput.setInputFiles(path.join(THUMBS_DIR, 'thumb_full_part1.jpg'));
      console.log('Thumbnail attached!');
      await page.waitForTimeout(3000);
    }
  } catch (e) {
    console.log('Thumbnail attach notice:', e.message);
  }

  // Audience: Not made for kids
  const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKids.isVisible({ timeout: 5000 }).catch(() => false)) {
    await notForKids.click({ force: true });
    await page.waitForTimeout(500);
  }

  // Wizard Next x 3
  const nextBtn = page.locator('#next-button').first();
  await nextBtn.click({ force: true });
  await page.waitForTimeout(2500);
  await nextBtn.click({ force: true });
  await page.waitForTimeout(2500);
  await nextBtn.click({ force: true });
  await page.waitForTimeout(2500);

  // Visibility: Public
  const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
  if (await publicRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
    await publicRadio.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // Publish
  console.log('Publishing Part 1...');
  const doneBtn = page.locator('#done-button').first();
  await doneBtn.waitFor({ state: 'visible', timeout: 5000 });
  await doneBtn.click({ force: true });
  console.log('Published! Waiting for dialog...');
  await page.waitForTimeout(8000);

  const closeBtn = page.locator('ytcp-button#close-button, button:has-text("Close")').first();
  if (await closeBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await closeBtn.click().catch(() => {});
    await page.waitForTimeout(2000);
  }

  // STAY OPEN AND MONITOR UNTIL UPLOAD COMPLETES
  console.log('Waiting for Part 1 upload stream to reach 100%...');
  let ticks = 0;
  while (ticks < 30) {
    ticks++;
    await page.waitForTimeout(10000);
    const text = await page.innerText('body').catch(() => '');
    const uploading = text.includes('Uploading') || text.includes('uploading');
    console.log(`[Part 1 Tick ${ticks}] Uploading: ${uploading}`);
    if (!uploading && ticks > 2) {
      console.log('Part 1 upload stream completed!');
      break;
    }
  }

  await page.screenshot({ path: path.resolve(ROOT, 'tools', 'part1_clean_live.png') });
  console.log('Saved tools/part1_clean_live.png');

  await ctx.close();
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
