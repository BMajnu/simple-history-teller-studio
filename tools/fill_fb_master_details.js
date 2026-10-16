const { chromium } = require('playwright-core');
const path = require('path');

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

  // Fill "Describe your reel..."
  console.log('Locating description input in left sidebar...');
  const descLocator = page.locator('div[role="textbox"][contenteditable="true"], div[aria-label*="Describe"], textarea[placeholder*="Describe"]').first();
  await descLocator.waitFor({ state: 'visible', timeout: 10000 });
  await descLocator.click();
  await page.waitForTimeout(500);

  console.log('Inserting full text...');
  await page.keyboard.insertText(`${TITLE}\n\n${DESCRIPTION}`);
  await page.waitForTimeout(2000);

  // Click "Choose a thumbnail"
  console.log('Locating "Choose a thumbnail" button...');
  const chooseThumbBtn = page.locator('span:has-text("Choose a thumbnail"), div:has-text("Choose a thumbnail")').last();
  if (await chooseThumbBtn.isVisible().catch(() => false)) {
    console.log('Clicking "Choose a thumbnail"...');
    // Get bounding box or click
    await chooseThumbBtn.click();
    await page.waitForTimeout(2000);
  }

  // Look for image input or upload prompt
  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  console.log('Found file inputs:', nodeIds.length);
  for (const id of nodeIds) {
    const { attributes } = await session.send('DOM.getAttributes', { nodeId: id });
    const attrStr = attributes.join(' ');
    console.log('Input node', id, 'accept:', attrStr);
    if (attrStr.includes('image/') && !attrStr.includes('video/')) {
      console.log('Attaching thumbnail to nodeId:', id);
      await session.send('DOM.setFileInputFiles', {
        files: [THUMB_PATH],
        nodeId: id
      });
      console.log('Thumbnail attached!');
      await page.waitForTimeout(3000);
      break;
    }
  }

  // If no image-only input, check inputs that accept images
  // Take screenshot of filled state
  await page.screenshot({ path: 'tools/fb_master_preview_ready.png' });
  console.log('Saved tools/fb_master_preview_ready.png');

  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
