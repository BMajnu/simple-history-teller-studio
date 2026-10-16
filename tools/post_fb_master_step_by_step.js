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

  console.log('2. Navigating to Facebook...');
  await page.goto('https://www.facebook.com/profile.php?id=61595162615338', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  console.log('3. Scrolling to composer...');
  await page.evaluate(() => window.scrollBy(0, 350));
  await page.waitForTimeout(1000);

  console.log('4. Opening Create post modal...');
  const openComposer = page.locator('span:has-text("What\'s on your mind?"), div[role="button"]:has-text("What\'s on your mind?")').first();
  if (await openComposer.isVisible().catch(() => false)) {
    await openComposer.click();
    await page.waitForTimeout(3000);
  } else {
    // Click coordinates of composer box
    console.log('Clicking composer box by coordinates (700, 480)...');
    await page.mouse.click(700, 480);
    await page.waitForTimeout(3000);
  }

  // Check dialog
  console.log('5. Verifying modal dialog...');
  const dialog = page.locator('div[role="dialog"]').first();
  await dialog.waitFor({ state: 'visible', timeout: 10000 });

  // Click green Photo/video icon inside modal
  console.log('6. Clicking Photo/video icon...');
  const photoIcon = dialog.locator('div[aria-label="Photo/video"], div[aria-label="Photo/Video"]').first();
  if (await photoIcon.isVisible().catch(() => false)) {
    await photoIcon.click();
    await page.waitForTimeout(2000);
  }

  // Attach master video via CDP
  console.log('7. Attaching master video via CDP...');
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

  console.log('8. Waiting 10 seconds for video card to populate...');
  await page.waitForTimeout(10000);

  // Attach thumbnail
  console.log('9. Attaching custom thumbnail...');
  const { nodeIds: currentInputs } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });
  for (const id of currentInputs) {
    const { attributes } = await session.send('DOM.getAttributes', { nodeId: id });
    const attrStr = attributes.join(' ');
    if (attrStr.includes('image/') && !attrStr.includes('video/')) {
      console.log('Attaching thumbnail to node:', id);
      await session.send('DOM.setFileInputFiles', { files: [THUMB_PATH], nodeId: id });
      break;
    }
  }
  await page.waitForTimeout(3000);

  // Fill text
  console.log('10. Filling title and description...');
  const textBox = dialog.locator('div[role="textbox"]').first();
  if (await textBox.isVisible().catch(() => false)) {
    await textBox.click();
    await page.waitForTimeout(300);

    await page.evaluate((text) => {
      const el = document.querySelector('div[role="dialog"] div[role="textbox"]');
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
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tools/fb_master_ready_to_click_next.png' });
  console.log('11. Saved tools/fb_master_ready_to_click_next.png');

  // Click Next
  console.log('12. Clicking Next button...');
  const nextBtn = dialog.locator('div[role="button"]:has-text("Next"), button:has-text("Next")').first();
  await nextBtn.click();
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'tools/fb_master_step2_ready.png' });
  console.log('13. Saved tools/fb_master_step2_ready.png');

  // Click Post
  console.log('14. Clicking final Post button...');
  const postBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Post"), div[role="dialog"] button:has-text("Post"), div[role="button"]:has-text("Post")').first();
  await postBtn.click();
  console.log('15. Clicked Post! Upload in progress...');

  // Monitor upload until completed
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(3000);
    const dialogs = await page.locator('div[role="dialog"]').count();
    const text = await page.evaluate(() => document.body.innerText).catch(() => '');
    const isUploading = text.includes('Uploading') || text.includes('Processing') || text.includes('Posting');
    console.log(`Poll ${i + 1}/40: dialogs=${dialogs}, uploading=${isUploading}`);
    if (dialogs === 0 && !isUploading) {
      console.log('Post completed successfully!');
      break;
    }
  }

  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tools/fb_master_posted_confirmed.png' });
  console.log('Final confirmation screenshot saved.');

  const artifactDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
  fs.copyFileSync('tools/fb_master_posted_confirmed.png', path.join(artifactDir, 'fb_master_posted_confirmed.png'));

  console.log('=== Master Video Publication Complete ===');
  await page.waitForTimeout(5000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
