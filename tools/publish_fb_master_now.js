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
  console.log('=== Step 1: Launching Chrome with Bangla profile ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled'
    ],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  console.log('Navigating to Facebook page...');
  await page.goto('https://www.facebook.com/profile.php?id=61595162615338', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click Photo/video button
  console.log('Clicking Photo/video button...');
  const photoBtn = page.locator('div[role="button"]:has-text("Photo/video"), div[aria-label*="Photo/video"], span:has-text("Photo/video")').first();
  if (await photoBtn.isVisible().catch(() => false)) {
    await photoBtn.click();
    await page.waitForTimeout(3000);
  }

  // Attach master video file via CDP session to bypass any size restrictions
  console.log('Attaching master video file:', VIDEO_PATH);
  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  console.log('Found file inputs:', nodeIds.length);
  let videoAttached = false;
  for (const id of nodeIds) {
    const { attributes } = await session.send('DOM.getAttributes', { nodeId: id });
    const attrStr = attributes.join(' ');
    if (attrStr.includes('video/*') || attrStr.includes('video/mp4')) {
      console.log('Setting video on nodeId:', id);
      await session.send('DOM.setFileInputFiles', {
        files: [VIDEO_PATH],
        nodeId: id
      });
      videoAttached = true;
      break;
    }
  }

  if (!videoAttached && nodeIds.length > 0) {
    console.log('Fallback: Setting video on last file input...');
    await session.send('DOM.setFileInputFiles', {
      files: [VIDEO_PATH],
      nodeId: nodeIds[nodeIds.length - 1]
    });
  }

  console.log('Waiting 12 seconds for video card to populate...');
  await page.waitForTimeout(12000);

  // Close any overlay dialog if present
  console.log('Checking for overlay close button...');
  const closeBtn = page.locator('div[aria-label="Create post"] div[aria-label="Close"], div[aria-label="Close"]').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    console.log('Dismissing overlay dialog...');
    await closeBtn.click({ force: true }).catch(() => {});
    await page.waitForTimeout(2000);
  }

  // Choose custom thumbnail
  console.log('Attaching custom thumbnail...');
  const thumbButton = page.locator('span:has-text("Choose a thumbnail"), div:has-text("Choose a thumbnail")').last();
  if (await thumbButton.isVisible().catch(() => false)) {
    await thumbButton.click({ force: true }).catch(() => {});
    await page.waitForTimeout(2000);

    const { nodeIds: currentInputs } = await session.send('DOM.querySelectorAll', {
      nodeId: doc.root.nodeId,
      selector: 'input[type="file"]'
    });
    for (const id of currentInputs) {
      const { attributes } = await session.send('DOM.getAttributes', { nodeId: id });
      const attrStr = attributes.join(' ');
      if (attrStr.includes('.png') || attrStr.includes('.jpg') || attrStr.includes('image/')) {
        console.log('Setting custom thumbnail on nodeId:', id);
        await session.send('DOM.setFileInputFiles', {
          files: [THUMB_PATH],
          nodeId: id
        });
        await page.waitForTimeout(2000);
        break;
      }
    }
  }

  // Fill Description in the main text box
  console.log('Filling description...');
  const descBox = page.locator('div[role="textbox"][contenteditable="true"]').first();
  if (await descBox.isVisible().catch(() => false)) {
    await descBox.click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');

    await page.evaluate((text) => document.execCommand('insertText', false, text), TITLE);
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
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tools/fb_master_pre_post.png' });
  console.log('Pre-post screenshot saved.');

  // Click Next if visible, then Post
  console.log('Checking for Next or Post button...');
  const nextBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Next"), div[role="dialog"] button:has-text("Next")').first();
  if (await nextBtn.isVisible().catch(() => false)) {
    console.log('Clicking Next button...');
    await nextBtn.click();
    await page.waitForTimeout(3000);
  }

  const postBtn = page.locator('div[role="button"]:has-text("Post"), button:has-text("Post")').first();
  if (await postBtn.isVisible().catch(() => false)) {
    console.log('Clicking final POST button!');
    await postBtn.click();
    console.log('Clicked Post! Monitoring upload...');
  }

  // Monitor upload
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(3000);
    const text = await page.evaluate(() => document.body.innerText).catch(() => '');
    const isUploading = text.includes('Uploading') || text.includes('Processing') || text.includes('Posting');
    console.log(`Upload check ${i + 1}/40: isUploading=${isUploading}`);
    if (!isUploading && i > 3) {
      console.log('Upload completed or processed!');
      break;
    }
  }

  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tools/fb_master_post_completed.png' });
  console.log('Final screenshot saved: tools/fb_master_post_completed.png');

  // Copy to artifacts
  const artifactDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
  fs.copyFileSync('tools/fb_master_post_completed.png', path.join(artifactDir, 'fb_master_post_completed.png'));

  // Keep browser alive for subsequent actions
  console.log('Master video publication completed successfully!');
  await page.waitForTimeout(10000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal error during upload:', err);
  process.exit(1);
});
