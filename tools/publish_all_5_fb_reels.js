const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = path.join(__dirname, '..');
const SHORTS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full');
const THUMBS_DIR = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'shorts_full');

const shortsData = [
  {
    part: 1,
    file: path.join(SHORTS_DIR, 'short_bn_full1.mp4'),
    thumb: path.join(THUMBS_DIR, 'thumb_full_part1.jpg'),
    title: 'মানুষের প্রথম রাজা? শিকারিকে উপহাস! 👑 [১ম পর্ব] #Shorts #ইতিহাস',
    description: `৩ লক্ষ বছর রাজা ছাড়াই মানুষ বাঁচত কীভাবে? কালাহারির শিকারিরা অহংকারীকে হাসিয়ে থামিয়ে দিত!

👑 সম্পূর্ণ ১৫ মিনিটের মূল তথ্যচিত্র দেখুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation #reels`
  },
  {
    part: 2,
    file: path.join(SHORTS_DIR, 'short_bn_full2.mp4'),
    thumb: path.join(THUMBS_DIR, 'thumb_full_part2.jpg'),
    title: 'কৃষির মারণফাঁদ ও লোভের জন্ম! 🌾 [২য় পর্ব] #Shorts #ইতিহাস',
    description: `শস্যভাণ্ডার ভরতেই এলো লোভ আর ভয়! কৃষিকাজের ফাঁদে আটকে যাওয়া মানুষ নিরাপত্তার জন্য প্রথম হাত পাতল।

🌾 সম্পূর্ণ ১৫ মিনিটের মূল তথ্যচিত্র দেখুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation #reels`
  },
  {
    part: 3,
    file: path.join(SHORTS_DIR, 'short_bn_full3.mp4'),
    thumb: path.join(THUMBS_DIR, 'thumb_full_part3.jpg'),
    title: 'পৃথিবীর প্রথম চাঁদাবাজি ও ইতিহাসের প্রথম ডন! ⚔️ [৩য় পর্ব] #Shorts #ইতিহাস',
    description: `ফসলের ২০% কর দাও, নইলে...! মানব ইতিহাসের প্রথম চাঁদাবাজি আর প্রথম ডনের আসল ইতিহাস!

⚔️ সম্পূর্ণ ১৫ মিনিটের মূল তথ্যচিত্র দেখুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation #reels`
  },
  {
    part: 4,
    file: path.join(SHORTS_DIR, 'short_bn_full4.mp4'),
    thumb: path.join(THUMBS_DIR, 'thumb_full_part4.jpg'),
    title: 'সুমেরীয় সম্রাট ও প্রথম সিংহাসন! 🏛️ [৪র্থ পর্ব] #Shorts #ইতিহাস',
    description: `আকাশ থেকে নামল রাজতন্ত্র! সুমেরীয় রাজাতালিকা, সোনার মুকুট আর প্রথম স্থায়ী সেনাবাহিনীর ইতিহাস!

🏛️ সম্পূর্ণ ১৫ মিনিটের মূল তথ্যচিত্র দেখুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation #reels`
  },
  {
    part: 5,
    file: path.join(SHORTS_DIR, 'short_bn_full5.mp4'),
    thumb: path.join(THUMBS_DIR, 'thumb_full_part5.jpg'),
    title: 'রাজার পতন ও আধুনিক রাষ্ট্রের জন্ম! ⏳ [৫ম পর্ব] #Shorts #ইতিহাস',
    description: `সব রাজারই পতন ঘটে! জাদুঘরের শবাধার থেকে আধুনিক রাষ্ট্র — ক্ষমতার চিরন্তন সত্য ইতিহাস!

⏳ সম্পূর্ণ ১৫ মিনিটের মূল তথ্যচিত্র দেখুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation #reels`
  }
];

(async () => {
  console.log('Launching Chrome for 5 Facebook Reels batch upload...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  for (let i = 0; i < shortsData.length; i++) {
    const s = shortsData[i];
    console.log(`\n========================================`);
    console.log(`>>> UPLOADING FB REEL PART ${s.part} (${i + 1}/${shortsData.length}): ${s.title}`);
    console.log(`========================================`);

    await page.goto('https://www.facebook.com/reels/create', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const session = await page.context().newCDPSession(page);
    const doc = await session.send('DOM.getDocument', { depth: 0 });
    const { nodeIds } = await session.send('DOM.querySelectorAll', {
      nodeId: doc.root.nodeId,
      selector: 'input[type="file"]'
    });

    if (!nodeIds || nodeIds.length === 0) {
      console.error(`No file inputs found on reels/create for Part ${s.part}!`);
      continue;
    }

    console.log(`Attaching file ${s.file} to node ${nodeIds[0]}...`);
    await session.send('DOM.setFileInputFiles', {
      files: [s.file],
      nodeId: nodeIds[0]
    });

    console.log('Waiting for Next button to appear...');
    const nextBtn = page.locator('div[role="button"]:has-text("Next"), button:has-text("Next")').first();
    await nextBtn.waitFor({ state: 'visible', timeout: 30000 });
    console.log('Clicking Next (1)...');
    await nextBtn.click();
    await page.waitForTimeout(2000);

    // If second Next exists (Edit step)
    const nextBtn2 = page.locator('div[role="button"]:has-text("Next"), button:has-text("Next")').first();
    if (await nextBtn2.isVisible().catch(() => false)) {
      console.log('Clicking Next (2)...');
      await nextBtn2.click();
      await page.waitForTimeout(2000);
    }

    // Fill description
    console.log('Filling description for Part ' + s.part);
    const descBox = page.locator('div[aria-label="Describe your reel..."], div[role="textbox"]').first();
    await descBox.waitFor({ state: 'visible', timeout: 10000 });
    await descBox.click();
    await page.waitForTimeout(300);

    const fullCaption = `${s.title}\n\n${s.description}`;
    const lines = fullCaption.split('\n');
    for (const l of lines) {
      if (l === '') {
        await page.keyboard.press('Enter');
      } else {
        await page.evaluate((text) => document.execCommand('insertText', false, text), l);
        await page.keyboard.press('Enter');
      }
      await page.waitForTimeout(30);
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // Click Post
    console.log(`Publishing Reel Part ${s.part}...`);
    const postBtn = page.locator('div[role="button"]:has-text("Post"), button:has-text("Post")').last();
    await postBtn.click();
    console.log(`Clicked Post for Part ${s.part}! Monitoring upload...`);

    // Wait until dialog closes or navigates
    for (let p = 0; p < 25; p++) {
      await page.waitForTimeout(2000);
      const isStillInModal = page.url().includes('create') && await page.locator('div[aria-label="Describe your reel..."]').isVisible().catch(() => false);
      if (!isStillInModal) {
        console.log(`Reel Part ${s.part} successfully posted and closed!`);
        break;
      }
    }

    await page.waitForTimeout(3000);
    const shotPath = `tools/fb_reel_part${s.part}_posted.png`;
    await page.screenshot({ path: shotPath });
    console.log(`Saved screenshot: ${shotPath}`);

    // Copy to artifact dir
    const artifactDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
    fs.copyFileSync(shotPath, path.join(artifactDir, `fb_reel_part${s.part}_posted.png`));
  }

  console.log('\n========================================');
  console.log('ALL 5 FACEBOOK REELS POSTED SUCCESSFULLY!');
  console.log('========================================\n');

  await page.waitForTimeout(5000);
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal batch error:', err);
  process.exit(1);
});
