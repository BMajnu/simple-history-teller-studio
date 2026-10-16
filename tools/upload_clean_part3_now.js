const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const VIDEO_PATH = path.resolve('projects/sample_first_king/renders/shorts_full/short_bn_full3.mp4');

const TITLE = 'পৃথিবীর প্রথম চাঁদাবাজি ও ইতিহাসের প্রথম ডন! ⚔️ [৩য় পর্ব] #Shorts #ইতিহাস';
const DESC = `ফসলের ২০% কর দাও, নইলে...! মানব ইতিহাসের প্রথম চাঁদাবাজি আর প্রথম ডনের আসল ইতিহাস! ⚔️
সম্পূর্ণ ১৫ মিনিটের মূল তথ্যচিত্র দেখুন: https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation #প্রথম_চাঁদাবাজি`;

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Click Create button
  console.log('Clicking Create...');
  const createBtn = page.locator('#create-icon, button:has-text("Create"), ytcp-button:has-text("Create")').first();
  await createBtn.click();
  await page.waitForTimeout(1000);

  // Click Upload videos
  console.log('Clicking Upload videos...');
  const uploadItem = page.locator('paper-item:has-text("Upload videos"), ytcp-text-menu paper-item:first-child').first();
  await uploadItem.click();
  await page.waitForTimeout(3000);

  // Set file
  console.log('Setting video file...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(VIDEO_PATH);

  console.log('File attached. Waiting for upload wizard to load...');
  await page.waitForTimeout(6000);

  // Check if daily limit error banner appeared
  const bodyText = await page.innerText('body');
  const hasDailyLimit = bodyText.includes('Daily limit reached');
  console.log('Daily limit banner present:', hasDailyLimit);

  await page.screenshot({ path: 'tools/part3_upload_wizard.png' });
  console.log('Saved tools/part3_upload_wizard.png');

  if (hasDailyLimit) {
    console.log('DAILY LIMIT STILL RESTRICTING UPLOADS!');
  } else {
    console.log('No daily limit banner! Filling details...');

    // Fill Title
    await page.evaluate((t) => {
      const titleBox = document.querySelector('#title-textarea #textbox');
      if (titleBox) {
        titleBox.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, t);
        titleBox.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, TITLE);
    await page.waitForTimeout(1000);

    // Fill Description
    await page.evaluate((d) => {
      const descBox = document.querySelector('#description-textarea #textbox');
      if (descBox) {
        descBox.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, d);
        descBox.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, DESC);
    await page.waitForTimeout(1000);

    // Audience: Not made for kids
    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
    if (await notForKids.isVisible()) {
      await notForKids.click();
      await page.waitForTimeout(1000);
    }

    // Click Next 3 times
    for (let step = 1; step <= 3; step++) {
      console.log(`Clicking Next (step ${step})...`);
      const nextBtn = page.locator('#next-button').first();
      await nextBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }

    // Visibility: Public
    console.log('Selecting Public...');
    const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
    if (await publicRadio.isVisible()) {
      await publicRadio.click();
      await page.waitForTimeout(1000);
    }

    // Save/Publish
    console.log('Clicking Save / Publish...');
    const doneBtn = page.locator('#done-button').first();
    await doneBtn.click({ force: true });
    await page.waitForTimeout(5000);

    await page.screenshot({ path: 'tools/part3_upload_done.png' });
    console.log('Saved tools/part3_upload_done.png');
  }

  await ctx.close();
})();
