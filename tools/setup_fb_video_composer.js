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
  await page.bringToFront();

  // Close the center modal by clicking the X button on "Create post"
  console.log('Closing top Create post overlay modal...');
  const closeBtn = page.locator('div[aria-label="Create post"] div[aria-label="Close"], div[aria-label="Close"]').first();
  if (await closeBtn.isVisible().catch(() => false)) {
    console.log('Clicking close on center modal...');
    await closeBtn.click();
    await page.waitForTimeout(1500);
  }

  // Check left pane fields
  console.log('Checking description textarea...');
  const descBox = page.locator('div[role="textbox"][contenteditable="true"], textarea[placeholder*="Describe"], div[aria-label*="Describe"]').first();
  if (await descBox.isVisible().catch(() => false)) {
    console.log('Filling description in left panel...');
    await descBox.click();
    await page.keyboard.insertText(`${TITLE}\n\n${DESCRIPTION}`);
    await page.waitForTimeout(2000);
  }

  // Check Choose a thumbnail button
  console.log('Checking Choose a thumbnail...');
  const chooseThumbBtn = page.locator('div[aria-label*="Choose a thumbnail"], div[role="button"]:has-text("Choose a thumbnail"), span:has-text("Choose a thumbnail")').first();
  if (await chooseThumbBtn.isVisible().catch(() => false)) {
    console.log('Clicking Choose a thumbnail...');
    await chooseThumbBtn.click();
    await page.waitForTimeout(2000);

    // Look for image file input or Upload image button
    const session = await page.context().newCDPSession(page);
    const doc = await session.send('DOM.getDocument', { depth: 0 });
    const { nodeIds } = await session.send('DOM.querySelectorAll', {
      nodeId: doc.root.nodeId,
      selector: 'input[type="file"]'
    });

    console.log('File inputs count after Choose thumbnail:', nodeIds.length);
    // Find input accepting images
    let imageNodeId = null;
    for (const id of nodeIds) {
      const { attributes } = await session.send('DOM.getAttributes', { nodeId: id });
      const attrStr = attributes.join(' ');
      if (attrStr.includes('image/')) {
        imageNodeId = id;
      }
    }

    if (imageNodeId) {
      console.log('Attaching custom thumbnail to image nodeId:', imageNodeId);
      await session.send('DOM.setFileInputFiles', {
        files: [THUMB_PATH],
        nodeId: imageNodeId
      });
      console.log('Custom thumbnail attached successfully!');
      await page.waitForTimeout(3000);
    }
  }

  // Save screenshot of full filled preview
  await page.screenshot({ path: 'tools/fb_master_preview_ready.png' });
  console.log('Saved tools/fb_master_preview_ready.png');

  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
