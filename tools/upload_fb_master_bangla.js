const { chromium } = require('playwright-core');
const path = require('path');

const VIDEO_PATH = path.resolve('projects/sample_first_king/renders/video_bn.mp4');
const THUMB_PATH = path.resolve('projects/sample_first_king/metadata/bn_thumbnail_optimized.jpg');
const PAGE_URL = 'https://www.facebook.com/profile.php?id=61595162615338';

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

async function main() {
  console.log('Connecting to browser on port 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const pages = browser.contexts()[0].pages();
  const page = pages.find(p => p.url().includes('facebook.com')) || pages[0];
  await page.bringToFront();

  console.log('Navigating to Simple History Teller Bangla page...');
  await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Check if logged in or redirected to login
  if (page.url().includes('login')) {
    console.log('User is not yet logged into Facebook. Waiting for user login...');
    return { status: 'NEEDS_LOGIN', url: page.url() };
  }

  // Switch profile to page if prompted
  const switchBtn = page.locator('div[aria-label*="Switch"], div[role="button"]:has-text("Switch")').first();
  if (await switchBtn.isVisible().catch(() => false)) {
    console.log('Switching context to Page profile...');
    await switchBtn.click();
    await page.waitForTimeout(4000);
  }

  console.log('Opening Photo/video composer...');
  const photoVideoBtn = page.locator('div[role="button"]:has-text("Photo/video"), div[aria-label*="Photo/video"]').first();
  if (await photoVideoBtn.isVisible().catch(() => false)) {
    await photoVideoBtn.click();
    await page.waitForTimeout(2000);
  }

  // Attach video file
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    console.log('Attaching master video:', VIDEO_PATH);
    await fileInput.setInputFiles(VIDEO_PATH);
    await page.waitForTimeout(5000);
  }

  // Fill text / description
  const textBox = page.locator('div[role="textbox"], div[aria-label*="What\'s on your mind"]').first();
  if (await textBox.isVisible().catch(() => false)) {
    console.log('Filling post description...');
    await textBox.click();
    await page.keyboard.insertText(`${TITLE}\n\n${DESCRIPTION}`);
    await page.waitForTimeout(2000);
  }

  // Capture preview screenshot
  await page.screenshot({ path: 'tools/fb_master_preview_ready.png' });
  console.log('Preview saved: tools/fb_master_preview_ready.png');

  return { status: 'PREVIEW_READY' };
}

main().then(res => {
  console.log('Result:', JSON.stringify(res));
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
