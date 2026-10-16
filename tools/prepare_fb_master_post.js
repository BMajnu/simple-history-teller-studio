const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const VIDEO_PATH = path.resolve('projects/sample_first_king/renders/video_bn.mp4');
const THUMB_PATH = path.resolve('projects/sample_first_king/metadata/bn_thumbnail_optimized.jpg');

const TITLE = 'মানুষ কীভাবে প্রথম রাজা বানাল? 👑 সিংহাসন ও ক্ষমতার আসল ইতিহাস | Simple History Teller';
const DESCRIPTION = `আজ আমরা কোটি কোটি মানুষ রাষ্ট্রের আইন মানি, ট্যাক্স দিই এবং একজন নেতার শাসন মেনে নিই। কিন্তু হাজার হাজার বছর আগে যখন কোনো রাজা বা সিংহাসন ছিল না, তখন কীভাবে জন্ম নিল পৃথিবীর প্রথম রাজা? 

কালাহারি মরুভূমির সাম্যবাদী শিকারি সমাজ থেকে শুরু করে মেসোপটেমিয়ার শস্যভাণ্ডার এবং সুমেরীয় রাজাতালিকার রহস্য উন্মোচন।

🕒 অধ্যায়সমূহ (Chapters):
00:00 - আমি সময়ের সাক্ষী (The Hook)
01:41 - শিকারকে অপমান করার গোপন রীতি (Insulting the Meat)
03:14 - কৃষিকাজের মারণফাঁদ ও শস্যভাণ্ডার (The Agricultural Trap)
04:43 - পৃথিবীর প্রথম কর ও প্রোটেকশন র‍্যাকেট (The First Warlord)
05:59 - লুগাল ও ঐশ্বরিক রাজত্বের জন্ম (Birth of Divine Kingship)
07:24 - সুমেরীয় রাজাতালিকা ও প্রথম রাজা আলুলিম (The Sumerian King List)
08:53 - পিরামিড, ভয় ও বংশপরম্পরা (Pyramids & Dynasty)
10:40 - ক্ষমতার চিরন্তন সত্য ও আধুনিক রাষ্ট্র (Conclusion)

🔔 পেইজটি ফলো করুন এবং বন্ধুদের সাথে শেয়ার করুন!

#SimpleHistoryTellerBangla #সিম্পলইতিহাস #বাংলাডকুমেন্টারি #প্রথমরাজা #ইতিহাস #AnimatedHistory #OverSimplified #BanglaHistory`;

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9225');
  const page = browser.contexts()[0].pages()[0];
  await page.bringToFront();

  // Scroll down slightly so composer is fully in view
  await page.evaluate(() => window.scrollBy(0, 350));
  await page.waitForTimeout(1000);

  // Click "What's on your mind?"
  console.log('Opening Create Post modal...');
  const openComposer = page.locator('span:has-text("What\'s on your mind?"), div[role="button"]:has-text("What\'s on your mind?")').first();
  if (await openComposer.isVisible().catch(() => false)) {
    await openComposer.click();
    await page.waitForTimeout(3000);
  }

  // Look for Photo/video button or file input
  console.log('Checking for file inputs...');
  let fileInputs = page.locator('input[type="file"]');
  let count = await fileInputs.count();
  console.log('File inputs found before clicking photo/video:', count);

  if (count === 0) {
    const photoBtn = page.locator('div[aria-label="Photo/video"], div[aria-label="Photo/Video"]').first();
    if (await photoBtn.isVisible().catch(() => false)) {
      console.log('Clicking Photo/video icon...');
      await photoBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  fileInputs = page.locator('input[type="file"]');
  count = await fileInputs.count();
  console.log('File inputs found after:', count);

  if (count > 0) {
    console.log('Attaching video file:', VIDEO_PATH);
    await fileInputs.last().setInputFiles(VIDEO_PATH);
    console.log('Attached! Waiting 10 seconds for video processing/preview card...');
    await page.waitForTimeout(10000);
  } else {
    console.log('WARNING: No file input found');
  }

  // Insert description text
  console.log('Filling post text...');
  const textBox = page.locator('div[role="textbox"][contenteditable="true"]').first();
  if (await textBox.isVisible().catch(() => false)) {
    await textBox.click();
    await page.keyboard.insertText(`${TITLE}\n\n${DESCRIPTION}`);
    await page.waitForTimeout(2000);
  }

  // Check if "Video options" button exists
  const videoOptions = page.locator('div[role="button"]:has-text("Video options"), span:has-text("Video options")').first();
  const hasOptions = await videoOptions.isVisible().catch(() => false);
  console.log('Video options button visible:', hasOptions);

  if (hasOptions) {
    console.log('Clicking Video options...');
    await videoOptions.click();
    await page.waitForTimeout(3000);

    // In video options modal, fill video title
    const titleInput = page.locator('input[aria-label*="Video title"], input[placeholder*="title"], label:has-text("Video title") input').first();
    if (await titleInput.isVisible().catch(() => false)) {
      console.log('Filling Video title in options modal...');
      await titleInput.click();
      await titleInput.fill(TITLE);
      await page.waitForTimeout(1000);
    }

    // Check Change thumbnail / Custom thumbnail
    const changeThumb = page.locator('div[role="button"]:has-text("Change thumbnail"), div:has-text("Change thumbnail")').first();
    if (await changeThumb.isVisible().catch(() => false)) {
      console.log('Clicking Change thumbnail...');
      await changeThumb.click();
      await page.waitForTimeout(1500);

      const uploadImage = page.locator('div[role="button"]:has-text("Upload image"), span:has-text("Upload image")').first();
      if (await uploadImage.isVisible().catch(() => false)) {
        await uploadImage.click();
        await page.waitForTimeout(1000);
      }

      const thumbInput = page.locator('input[type="file"][accept*="image"], input[type="file"]').last();
      if (await thumbInput.count() > 0) {
        console.log('Attaching custom thumbnail:', THUMB_PATH);
        await thumbInput.setInputFiles(THUMB_PATH);
        await page.waitForTimeout(3000);
      }
    }

    // Save video options
    const saveBtn = page.locator('div[role="button"]:has-text("Save"), button:has-text("Save")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      console.log('Saving video options...');
      await saveBtn.click();
      await page.waitForTimeout(4000);
    }
  }

  // Take screenshot of filled composer
  await page.screenshot({ path: 'tools/fb_master_preview_ready.png' });
  console.log('Saved tools/fb_master_preview_ready.png');

  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
