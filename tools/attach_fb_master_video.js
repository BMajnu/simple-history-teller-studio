const { chromium } = require('playwright-core');
const path = require('path');

const VIDEO_PATH = path.resolve('projects/sample_first_king/renders/video_bn.mp4');
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
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('facebook.com'));

  // Dismiss black tooltip if present
  const closeTooltip = page.locator('div[aria-label="Close"], i[data-visualcompletion]').first();
  if (await closeTooltip.isVisible().catch(() => false)) {
    await closeTooltip.click().catch(() => {});
    await page.waitForTimeout(500);
  }

  // Click green Photo/video icon under Add to your post if needed
  const photoIcon = page.locator('div[aria-label="Photo/video"], div[aria-label="Photo/Video"]').first();
  if (await photoIcon.isVisible().catch(() => false)) {
    console.log('Clicking Photo/video icon...');
    await photoIcon.click();
    await page.waitForTimeout(2000);
  }

  // Look for file input
  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();
  console.log('File inputs count:', count);

  if (count > 0) {
    console.log('Attaching video file:', VIDEO_PATH);
    await fileInputs.last().setInputFiles(VIDEO_PATH);
    console.log('Video file attached! Waiting 8 seconds for video card to populate...');
    await page.waitForTimeout(8000);
  }

  // Fill text in "What's on your mind?" textbox
  const textBox = page.locator('div[role="textbox"][contenteditable="true"], div[aria-label*="What\'s on your mind"]').first();
  if (await textBox.isVisible().catch(() => false)) {
    console.log('Focusing textbox and typing content...');
    await textBox.click();
    await page.keyboard.insertText(`${TITLE}\n\n${DESCRIPTION}`);
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tools/fb_master_attached_preview.png' });
  console.log('Saved tools/fb_master_attached_preview.png');

  // Check if "Video options" button exists to add custom thumbnail
  const videoOptions = page.locator('div[role="button"]:has-text("Video options"), span:has-text("Video options"), div[aria-label*="Video options"]').first();
  console.log('Video options button visible:', await videoOptions.isVisible().catch(() => false));

  process.exit(0);
})();
