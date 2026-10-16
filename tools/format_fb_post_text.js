const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const TITLE = 'মানুষ কীভাবে প্রথম রাজা বানাল? 👑 সিংহাসন ও ক্ষমতার আসল ইতিহাস | Simple History Teller';
const DESCRIPTION_LINES = [
  'আজ আমরা কোটি কোটি মানুষ রাষ্ট্রের আইন মানি, ট্যাক্স দিই এবং একজন নেতার শাসন মেনে নিই। কিন্তু হাজার হাজার বছর আগে যখন কোনো রাজা বা সিংহাসন ছিল না, তখন কীভাবে জন্ম নিল পৃথিবীর প্রথম রাজা?',
  '',
  'কালাহারি মরুভূমির সাম্যবাদী শিকারি সমাজ থেকে শুরু করে মেসোপটেমিয়ার শস্যভাণ্ডার এবং সুমেরীয় রাজাতালিকার রহস্য উন্মোচন।',
  '',
  '🕒 অধ্যায়সমূহ (Chapters):',
  '00:00 - আমি সময়ের সাক্ষী (The Hook)',
  '01:41 - শিকারকে অপমান করার গোপন রীতি (Insulting the Meat)',
  '03:14 - কৃষিকাজের মারণফাঁদ ও শস্যভাণ্ডার (The Agricultural Trap)',
  '04:43 - পৃথিবীর প্রথম কর ও প্রোটেকশন র‍্যাকেট (The First Warlord)',
  '05:59 - লুগাল ও ঐশ্বরিক রাজত্বের জন্ম (Birth of Divine Kingship)',
  '07:24 - সুমেরীয় রাজাতালিকা ও প্রথম রাজা আলুলিম (The Sumerian King List)',
  '08:53 - পিরামিড, ভয় ও বংশপরম্পরা (Pyramids & Dynasty)',
  '10:40 - ক্ষমতার চিরন্তন সত্য ও আধুনিক রাষ্ট্র (Conclusion)',
  '',
  '🔔 পেইজটি ফলো করুন এবং বন্ধুদের সাথে শেয়ার করুন!',
  '',
  '#SimpleHistoryTellerBangla #সিম্পলইতিহাস #বাংলাডকুমেন্টারি #প্রথমরাজা #ইতিহাস #AnimatedHistory #OverSimplified #BanglaHistory'
];

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9225');
  const page = browser.contexts()[0].pages()[0];

  const textBox = page.locator('div[role="dialog"] div[role="textbox"]').first();
  await textBox.click();
  await page.waitForTimeout(300);

  // Clear current text
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(300);

  // Insert title
  await page.evaluate((text) => document.execCommand('insertText', false, text), TITLE);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');

  // Insert each description line
  for (const line of DESCRIPTION_LINES) {
    if (line === '') {
      await page.keyboard.press('Enter');
    } else {
      await page.evaluate((text) => document.execCommand('insertText', false, text), line);
      await page.keyboard.press('Enter');
    }
    await page.waitForTimeout(50);
  }

  // Dismiss any hashtag popup by pressing Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // Take high resolution preview screenshot
  const previewPath = 'tools/fb_master_preview_ready.png';
  await page.screenshot({ path: previewPath });
  console.log('Saved tools/fb_master_preview_ready.png');

  // Copy to artifacts directory
  const artifactDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
  fs.copyFileSync(previewPath, path.join(artifactDir, 'fb_master_preview_ready.png'));
  console.log('Copied to artifact dir!');

  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
