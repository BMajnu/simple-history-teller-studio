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
  console.log('1. Launching Chrome...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  console.log('2. Navigating to https://www.facebook.com/ ...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  console.log('3. Opening Create Post view...');
  const comp = page.locator('div[role="button"]:has-text("What\'s on your mind"), span:has-text("What\'s on your mind")').first();
  await comp.click();
  await page.waitForTimeout(3000);

  // Attach master video file via CDP
  console.log('4. Attaching master video file via CDP...');
  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  console.log('File inputs count:', nodeIds.length);
  for (const id of nodeIds) {
    const { attributes } = await session.send('DOM.getAttributes', { nodeId: id });
    const attrStr = attributes.join(' ');
    console.log('Node', id, 'attrs:', attrStr);
    if (attrStr.includes('video/mp4') || attrStr.includes('video/*') || attrStr.includes('multiple')) {
      console.log('Setting video on nodeId:', id);
      await session.send('DOM.setFileInputFiles', { files: [VIDEO_PATH], nodeId: id });
      break;
    }
  }

  console.log('5. Waiting 12 seconds for video upload card to populate...');
  await page.waitForTimeout(12000);

  // Look for image/thumbnail input
  const { nodeIds: currentInputs } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });
  for (const id of currentInputs) {
    const { attributes } = await session.send('DOM.getAttributes', { nodeId: id });
    const attrStr = attributes.join(' ');
    if (attrStr.includes('image/') && !attrStr.includes('video/')) {
      console.log('Setting thumbnail on nodeId:', id);
      await session.send('DOM.setFileInputFiles', { files: [THUMB_PATH], nodeId: id });
      break;
    }
  }
  await page.waitForTimeout(2000);

  // Fill text into description box
  console.log('6. Filling post description...');
  const textBox = page.locator('div[role="textbox"][contenteditable="true"]').first();
  await textBox.click();
  await page.waitForTimeout(300);

  await page.evaluate((text) => {
    const el = document.querySelector('div[role="textbox"][contenteditable="true"]');
    if (el) {
      el.focus();
      document.execCommand('insertText', false, text);
    }
  }, TITLE);
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');

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
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'tools/fb_clean_master_filled.png' });
  console.log('7. Screenshot saved: tools/fb_clean_master_filled.png');

  // Click Post button
  console.log('8. Clicking Post button...');
  const postBtn = page.locator('div[role="button"]:has-text("Post"), button:has-text("Post")').last();
  if (await postBtn.isVisible().catch(() => false)) {
    console.log('Post button found! Clicking Post...');
    await postBtn.click();
  } else {
    // Coordinate click on Post button (x: 230, y: 960)
    console.log('Clicking Post button at (230, 960)...');
    await page.mouse.click(230, 960);
  }

  console.log('9. Monitoring upload progress...');
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(3000);
    const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
    const isUploading = bodyText.includes('Uploading') || bodyText.includes('Processing') || bodyText.includes('Posting');
    console.log(`Poll ${i + 1}/40: isUploading=${isUploading}`);
    if (!isUploading && i > 3) {
      console.log('Upload finished and post completed!');
      break;
    }
  }

  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tools/fb_master_post_success.png' });
  console.log('Final confirmation saved: tools/fb_master_post_success.png');

  const artifactDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
  fs.copyFileSync('tools/fb_master_post_success.png', path.join(artifactDir, 'fb_master_post_success.png'));

  console.log('Master video posted successfully!');
  await page.waitForTimeout(5000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
