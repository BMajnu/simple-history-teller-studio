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
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Click Create button
  console.log('Clicking Create button...');
  const createBtn = page.locator('button:has-text("Create")').first();
  await createBtn.click();
  await page.waitForTimeout(1500);

  // Click Upload videos (first item in menu)
  console.log('Clicking Upload videos menu item...');
  const uploadItem = page.locator('tp-yt-paper-item:has-text("Upload videos"), #text-item-0').first();
  await uploadItem.click();
  await page.waitForTimeout(3000);

  // Set file
  console.log('Setting file to short_bn_full3.mp4...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(VIDEO_PATH);

  console.log('Waiting 8 seconds for wizard to open and check for daily limit banner...');
  await page.waitForTimeout(8000);

  await page.screenshot({ path: 'tools/part3_wizard_loaded.png' });
  console.log('Saved tools/part3_wizard_loaded.png');

  const pageText = await page.innerText('body');
  const hasDailyLimit = pageText.includes('Daily limit reached');
  console.log('Daily limit reached detected:', hasDailyLimit);

  if (hasDailyLimit) {
    console.log('DAILY LIMIT BANNER IS PRESENT!');
  } else {
    console.log('NO DAILY LIMIT! Proceeding with upload form filling...');
    // Fill title
    await page.evaluate((t) => {
      const el = document.querySelector('#title-textarea #textbox');
      if (el) {
        el.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, t);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, TITLE);
    await page.waitForTimeout(1000);

    // Fill desc
    await page.evaluate((d) => {
      const el = document.querySelector('#description-textarea #textbox');
      if (el) {
        el.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, d);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, DESC);
    await page.waitForTimeout(1000);

    // Not made for kids
    const notKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
    if (await notKids.isVisible()) {
      await notKids.click();
      await page.waitForTimeout(1000);
    }

    // Step through next
    for (let i = 1; i <= 3; i++) {
      console.log(`Clicking next step ${i}...`);
      const next = page.locator('#next-button').first();
      await next.click({ force: true });
      await page.waitForTimeout(2500);
    }

    // Public
    const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
    if (await pubRadio.isVisible()) {
      await pubRadio.click();
      await page.waitForTimeout(1000);
    }

    // Publish
    const done = page.locator('#done-button').first();
    await done.click({ force: true });
    console.log('Clicked Done button! Waiting for publish dialog...');
    await page.waitForTimeout(6000);

    // Wait until upload percentage finishes or dialog appears
    await page.screenshot({ path: 'tools/part3_publish_finished.png' });
    console.log('Saved tools/part3_publish_finished.png');
  }

  await ctx.close();
})();
