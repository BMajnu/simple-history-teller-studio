const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const BANGLA_PAGE_ID = '61595477341365';
const TEST_VIDEO = 'd:\\Developing Projects\\Itihash Explainer Video\\projects\\sample_first_king\\renders\\shorts_full\\short_bn_full1.mp4';
const TEST_THUMB = 'd:\\Developing Projects\\Itihash Explainer Video\\projects\\sample_first_king\\renders\\shorts_full\\thumb_bn_full1.jpg';
const TEST_TITLE = 'মানুষের প্রথম রাজা? শিকারিকে উপহাস! 👑 [১ম পর্ব] | Simple History Teller Bangla';
const TEST_DESC = `আজ আমরা কোটি কোটি মানুষ রাষ্ট্রের আইন মানি, কর দিই এবং একজন নেতার শাসন মেনে নিই। কিন্তু হাজার হাজার বছর আগে যখন কোনো রাজা ছিল না, তখন কীভাবে জন্ম নিল পৃথিবীর প্রথম রাজা?

১ম পর্ব: শিকারিকে উপহাস করার প্রাচীন রীতি!
🔔 আমাদের ইউটিউব চ্যানেল সাবস্ক্রাইব করুন: https://www.youtube.com/@SimpleHistoryTellerBangla

#ইতিহাস #প্রথম_রাজা #সুমেরীয়_সভ্যতা #রাজতন্ত্র #মানব_ইতিহাস #SimpleHistoryTellerBangla`;

(async () => {
  console.log('--- STARTING SINGLE TEST UPLOAD & SCHEDULE ---');
  const browser = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = browser.pages()[0] || await browser.newPage();
  
  const targetUrl = `https://business.facebook.com/latest/composer?asset_id=${BANGLA_PAGE_ID}`;
  console.log(`Navigating to ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);

  let shotPath = path.join(ARTIFACTS_DIR, 'test_01_loaded_composer.png');
  await page.screenshot({ path: shotPath });
  console.log('Saved loaded state screenshot:', shotPath);

  // Check page title / name in composer
  const currentPostTo = await page.evaluate(() => {
    const postToBox = document.querySelector('[role="combobox"], [aria-haspopup="listbox"], div[role="button"]');
    return postToBox ? postToBox.innerText : 'not found';
  });
  console.log('Current Post To text:', currentPostTo);

  // 1. Upload video
  console.log('Attaching video file...');
  const addBtn = page.locator('text="Add photo/video"').first();
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 10000 }),
    addBtn.click()
  ]);
  await fileChooser.setFiles(TEST_VIDEO);
  console.log('Video file set:', TEST_VIDEO);

  // Wait for video upload processing in composer
  console.log('Waiting 10s for video processing UI to update...');
  await page.waitForTimeout(10000);

  shotPath = path.join(ARTIFACTS_DIR, 'test_02_after_video_attached.png');
  await page.screenshot({ path: shotPath });
  console.log('Saved video attached screenshot:', shotPath);

  // Inspect page elements now (text areas, title inputs, thumbnail options)
  const inputsInfo = await page.evaluate(() => {
    const textareas = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"], input[type="text"]')).map(el => ({
      tag: el.tagName,
      role: el.getAttribute('role'),
      placeholder: el.getAttribute('placeholder') || el.getAttribute('aria-label') || el.innerText.slice(0, 30),
      className: el.className
    }));
    const buttons = Array.from(document.querySelectorAll('button, div[role="button"]')).map(b => (b.innerText || '').trim().replace(/\n/g, ' ')).filter(t => t.length > 0 && t.length < 50);
    return { textareas, buttons: Array.from(new Set(buttons)) };
  });
  console.log('Composer inputs after video:', JSON.stringify(inputsInfo, null, 2));

  // Keep browser open for inspection or close
  await page.waitForTimeout(3000);
  await browser.close();
  console.log('Test completed successfully.');
  process.exit(0);
})().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
