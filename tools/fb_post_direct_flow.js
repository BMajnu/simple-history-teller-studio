const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const VIDEO_PATH = path.resolve('projects/sample_first_king/renders/video_bn.mp4');
const THUMB_PATH = path.resolve('projects/sample_first_king/metadata/bn_thumbnail_optimized.jpg');

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
  console.log('Starting Chrome...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  console.log('Navigating to Facebook Bangla page...');
  await page.goto('https://www.facebook.com/profile.php?id=61595162615338', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click Photo/video button to open composer dialog
  console.log('Clicking Photo/video button...');
  const photoBtn = page.locator('div[role="button"]:has-text("Photo/video"), div[aria-label*="Photo/video"]').first();
  if (await photoBtn.isVisible().catch(() => false)) {
    await photoBtn.click();
    await page.waitForTimeout(3000);
  }

  // Attach video via CDP
  console.log('Attaching master video file...');
  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  for (const id of nodeIds) {
    const { attributes } = await session.send('DOM.getAttributes', { nodeId: id });
    const attrStr = attributes.join(' ');
    if (attrStr.includes('video/mp4') || attrStr.includes('video/*')) {
      console.log('Attaching video to node:', id);
      await session.send('DOM.setFileInputFiles', { files: [VIDEO_PATH], nodeId: id });
      break;
    }
  }

  console.log('Waiting 10 seconds for video dialog...');
  await page.waitForTimeout(10000);

  // Attach thumbnail to image input
  const { nodeIds: imgInputs } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });
  for (const id of imgInputs) {
    const { attributes } = await session.send('DOM.getAttributes', { nodeId: id });
    const attrStr = attributes.join(' ');
    if (attrStr.includes('image/') && !attrStr.includes('video/')) {
      console.log('Attaching thumbnail to node:', id);
      await session.send('DOM.setFileInputFiles', { files: [THUMB_PATH], nodeId: id });
      break;
    }
  }
  await page.waitForTimeout(3000);

  // Focus and fill textbox inside dialog
  console.log('Filling text in dialog textbox...');
  const textBox = page.locator('div[role="dialog"] div[role="textbox"]').first();
  if (await textBox.isVisible().catch(() => false)) {
    await textBox.click();
    await page.waitForTimeout(300);

    // Insert title
    await page.evaluate((text) => {
      const el = document.querySelector('div[role="dialog"] div[role="textbox"]');
      if (el) {
        el.focus();
        document.execCommand('insertText', false, text);
      }
    }, TITLE);
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    // Insert description lines
    for (const line of DESCRIPTION_LINES) {
      if (line === '') {
        await page.keyboard.press('Enter');
      } else {
        await page.evaluate((text) => document.execCommand('insertText', false, text), line);
        await page.keyboard.press('Enter');
      }
      await page.waitForTimeout(30);
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tools/fb_master_filled_live.png' });
  console.log('Saved tools/fb_master_filled_live.png');

  // Click Next
  console.log('Clicking Next button...');
  const nextBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Next"), div[role="dialog"] button:has-text("Next")').first();
  if (await nextBtn.isVisible().catch(() => false)) {
    await nextBtn.click();
    await page.waitForTimeout(4000);
  }

  await page.screenshot({ path: 'tools/fb_master_step2_settings.png' });
  console.log('Saved tools/fb_master_step2_settings.png');

  // Click Post
  console.log('Clicking Post button...');
  const postBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Post"), div[role="button"]:has-text("Post"), button:has-text("Post")').first();
  if (await postBtn.isVisible().catch(() => false)) {
    await postBtn.click();
    console.log('Post button clicked! Upload in progress...');
  }

  // Monitor upload
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(3000);
    const dialogCount = await page.locator('div[role="dialog"]').count();
    const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
    const isUploading = bodyText.includes('Uploading') || bodyText.includes('Processing') || bodyText.includes('Posting');
    console.log(`Poll ${i + 1}: dialogs=${dialogCount}, isUploading=${isUploading}`);
    if (dialogCount === 0 && !isUploading) {
      console.log('Post modal closed! Master video successfully posted to Facebook!');
      break;
    }
  }

  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tools/fb_master_posted_final.png' });
  console.log('Saved tools/fb_master_posted_final.png');

  const artifactDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
  fs.copyFileSync('tools/fb_master_posted_final.png', path.join(artifactDir, 'fb_master_posted_final.png'));

  await page.waitForTimeout(5000);
  await ctx.close();
  console.log('Done master video post!');
  process.exit(0);
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
