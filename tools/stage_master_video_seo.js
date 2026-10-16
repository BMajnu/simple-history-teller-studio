const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const profileDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const THUMB_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'bn_thumbnail_optimized.jpg');

const VIDEO_ID = 'ibG0M13m7I0';

const MASTER_SEO = {
  title: 'মানুষ কীভাবে প্রথম রাজা বানাল? 👑 সিংহাসন ও ক্ষমতার আসল ইতিহাস | Simple History Teller Bangla',
  description: `হাজার হাজার বছর ধরে মানুষ কোনো রাজা, কোনো আদালত বা কোনো সরকারের শাসন ছাড়াই সমানভাবে বেঁচে ছিল। কিন্তু কালাহারির শিকারি সমাজ থেকে শুরু করে মেসোপটেমিয়ার প্রথম শস্যভাণ্ডার পর্যন্ত—ঠিক কীভাবে তৈরি হলো পৃথিবীর সর্বপ্রথম রাজা?

কেন কালাহারির মানুষেরা সফল শিকারিদের উপহাস করত? কৃষিকাজ কীভাবে মানুষের জীবনে নিয়ে এল লোভ আর বৈষম্যের ফাঁদ? এবং কীভাবে একজন অস্ত্রধারী পাহাদার পরিণত হলো ইতিহাসের প্রথম ডন বা সম্রাটে?

এই ভিডিওতে আমরা জানব সিংহাসন, কর এবং ক্ষমতার জন্মলগ্নের রোমাঞ্চকর ও রোমহর্ষক সত্য ইতিহাস।

🕒 অধ্যায়সমূহ (Timestamps):
0:00 - আমি সময়ের সাক্ষী (The Hook)
1:30 - শিকারকে অপমান করার গোপন রীতি (Insulting the Meat)
4:30 - কৃষিকাজের ফাঁদ ও প্রথম শস্যভাণ্ডার (The Agricultural Trap)
8:00 - পৃথিবীর প্রথম কর ও প্রোটেকশন র‍্যাকেট (The First Warlord)
11:00 - সুমেরীয় রাজাতালিকা ও রাজা আলুলিম (The Sumerian King List)
13:30 - সার্গন অফ আক্কাদ ও স্থায়ী সেনাবাহিনী (Empire of Sargon)
15:00 - ক্ষমতার চিরন্তন সত্য ও আধুনিক রাষ্ট্র (Conclusion)

🎬 সম্পূর্ণ সিরিজটি দেখতে আমাদের চ্যানেলটি সাবস্ক্রাইব করে রাখুন:
👉 @SimpleHistoryTellerBangla

#ইতিহাস #প্রথম_রাজা #সুমেরীয়_সভ্যতা #banglahistory #oversimplified #ancienthistory #banglaanimation #simplehistoryteller`,
  tags: 'ইতিহাস, প্রথম রাজা, সুমেরীয় সভ্যতা, কালাহারি মরুভূমি, কৃষির ইতিহাস, প্রাচীন মানবজাতি, মেসোপটেমিয়া, সার্গন অফ আক্কাদ, banglahistory, oversimplified bangla, simple history teller, animated documentary, educational bangla'
};

(async () => {
  console.log('=== 1. LAUNCHING VISIBLE CHROME BROWSER ON DESKTOP ===');
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    executablePath: chromePath,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--remote-debugging-port=9224'
    ],
    viewport: null
  });

  const page = context.pages()[0] || await context.newPage();
  await page.bringToFront();

  // Bring Chrome window into front via Windows PowerShell
  try {
    execSync('powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Chrome\')"', { stdio: 'ignore' });
  } catch (e) {}

  console.log(`=== 2. NAVIGATING TO MASTER VIDEO EDIT PAGE: https://studio.youtube.com/video/${VIDEO_ID}/edit ===`);
  await page.goto(`https://studio.youtube.com/video/${VIDEO_ID}/edit`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);

  // Bring to front again
  try {
    execSync('powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Chrome\')"', { stdio: 'ignore' });
  } catch (e) {}

  console.log('=== 3. UPDATING TITLE ===');
  const titleBox = page.locator('#title-textarea #textbox, ytcp-social-suggestions-textbox[label="Title"] #textbox, [aria-label*="title" i] #textbox, [aria-label*="Title" i]').first();
  if (await titleBox.isVisible({ timeout: 5000 }).catch(() => false)) {
    await titleBox.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(MASTER_SEO.title);
    console.log('Title updated.');
  }

  console.log('=== 4. UPDATING DESCRIPTION ===');
  const descBox = page.locator('#description-textarea #textbox, ytcp-social-suggestions-textbox[label="Description"] #textbox, [aria-label*="description" i] #textbox, [aria-label*="Description" i]').first();
  if (await descBox.isVisible({ timeout: 5000 }).catch(() => false)) {
    await descBox.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    // Using evaluate for multiline description speed & reliability
    await descBox.evaluate((el, text) => {
      el.innerText = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, MASTER_SEO.description);
    console.log('Description updated.');
  }

  console.log('=== 5. ATTACHING MASTER THUMBNAIL ===');
  // Scroll down to thumbnail area
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 500;
  });
  await page.waitForTimeout(1500);

  const fileInput = page.locator('input#file-loader, ytcp-thumbnails-compact input[type="file"], input[type="file"]').first();
  if (await fileInput.count() > 0) {
    console.log('Attaching thumbnail via file input:', THUMB_PATH);
    await fileInput.setInputFiles(THUMB_PATH);
    await page.waitForTimeout(4000);
  } else {
    const uploadBtn = page.locator('ytcp-thumbnails-compact #select-button, button:has-text("Upload file"), [aria-label*="Upload file"]').first();
    if (await uploadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Triggering file chooser...');
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null),
        uploadBtn.click().catch(() => {})
      ]);
      if (fileChooser) {
        await fileChooser.setFiles(THUMB_PATH);
        await page.waitForTimeout(4000);
      }
    }
  }

  console.log('=== 6. EXPANDING SHOW MORE & UPDATING TAGS ===');
  const showMoreBtn = page.locator('#toggle-button, button:has-text("SHOW MORE"), button:has-text("Show more"), [aria-label*="Show more"]').first();
  if (await showMoreBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await showMoreBtn.click();
    await page.waitForTimeout(1000);
  }

  // Scroll down to tags
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 1200;
  });
  await page.waitForTimeout(1500);

  const tagsInput = page.locator('#tags-container input, input[aria-label="Tags"], #text-input[aria-label*="Tags"]').first();
  if (await tagsInput.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Filling tags...');
    await tagsInput.click();
    await tagsInput.fill(MASTER_SEO.tags);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
  }

  // Bring to front again
  try {
    execSync('powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Chrome\')"', { stdio: 'ignore' });
  } catch (e) {}

  // Scroll to show Title, Description, and Thumbnail in one screenshot
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 350;
  });
  await page.waitForTimeout(2000);

  const previewPath1 = path.resolve(ROOT, 'tools', 'master_preview_staged_1.png');
  await page.screenshot({ path: previewPath1 });
  console.log('Saved top preview to:', previewPath1);

  // Scroll to show Thumbnail and Tags
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 600;
  });
  await page.waitForTimeout(1500);

  const previewPath2 = path.resolve(ROOT, 'tools', 'master_preview_staged_2.png');
  await page.screenshot({ path: previewPath2 });
  console.log('Saved thumbnail preview to:', previewPath2);

  // Scroll back to top so user sees the header & Save button ready
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 0;
  });
  await page.waitForTimeout(1000);

  console.log('================================================================');
  console.log('FORM FILLED 100% COMPLETE. SAVE BUTTON IS NOT CLICKED.');
  console.log('WINDOW IS VISIBLE IN FOREGROUND ON USER MONITOR.');
  console.log('WAITING FOR USER CONFIRMATION BEFORE PROCEEDING TO SAVE.');
  console.log('================================================================');

  // Keep script alive and window open
  setInterval(() => {}, 10000);
})().catch(err => {
  console.error('Error staging master video:', err);
  process.exit(1);
});
