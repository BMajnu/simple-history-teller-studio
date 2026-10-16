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
  console.log('=== UPLOADING PART 3 STEP-BY-STEP WITH VISUAL LOGGING ===');
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

  // Click create/upload
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

  // Attach file
  console.log('Attaching file...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: 'attached', timeout: 30000 });
  await fileInput.setInputFiles(FILE3);

  console.log('Waiting 12s for details form...');
  await page.waitForTimeout(12000);

  // Fill title
  console.log('Filling title...');
  await page.evaluate((text) => {
    const el = document.querySelector('#title-textarea #textbox');
    if (el) {
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, title3);
  await page.waitForTimeout(1000);

  // Fill description
  console.log('Filling description...');
  await page.evaluate((text) => {
    const el = document.querySelector('#description-textarea #textbox');
    if (el) {
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, desc3);
  await page.waitForTimeout(1000);

  // Not made for kids
  console.log('Selecting not made for kids...');
  const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  await notForKids.click({ force: true });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'tools/part3_step1_details.png' });

  // Look for next button
  console.log('Locating Next button on dialog...');
  const nextBtn = page.locator('#next-button').filter({ hasText: 'Next' }).first();
  console.log('Next button visible:', await nextBtn.isVisible({ timeout: 4000 }).catch(() => false));
  await nextBtn.click({ force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tools/part3_step2_elements.png' });

  // Click Next again (Elements -> Checks)
  console.log('Clicking Next (to Checks)...');
  await nextBtn.click({ force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tools/part3_step3_checks.png' });

  // Click Next again (Checks -> Visibility)
  console.log('Clicking Next (to Visibility)...');
  await nextBtn.click({ force: true });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tools/part3_step4_visibility.png' });

  // Select Public
  console.log('Selecting Public visibility...');
  const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
  await publicRadio.click({ force: true });
  await page.waitForTimeout(1500);

  // Find Done/Publish button
  console.log('Finding Done/Publish button...');
  const doneBtn = page.locator('#done-button').first();
  console.log('Done button visible:', await doneBtn.isVisible({ timeout: 4000 }).catch(() => false));
  console.log('Done button aria-disabled:', await doneBtn.getAttribute('aria-disabled'));

  // Click Publish
  await doneBtn.click({ force: true });
  console.log('Clicked Publish button!');
  await page.waitForTimeout(10000);

  await page.screenshot({ path: 'tools/part3_after_publish_dialog.png' });

  // Close popup
  const closeBtn = page.locator('ytcp-button#close-button, button:has-text("Close")').first();
  if (await closeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await closeBtn.click().catch(() => {});
    await page.waitForTimeout(2000);
  }

  // Stay on page and wait for upload stream
  console.log('Waiting 30 seconds for upload chunks to send...');
  await page.waitForTimeout(30000);

  // Navigate to shorts list
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: path.resolve(ROOT, 'tools', 'final_all_5_shorts_verified.png') });
  console.log('Saved tools/final_all_5_shorts_verified.png');

  await ctx.close();
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
