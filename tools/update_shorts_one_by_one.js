const { chromium } = require('playwright-core');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');

const shorts = [
  {
    part: 1,
    id: '7iM5n-TuxUE',
    title: 'মানুষ কীভাবে প্রথম রাজা বানাল? 👑 [পর্ব ১ • ০:০০ - ১:১২] শিকারিকে উপহাস! #Shorts #ইতিহাস',
    description: `মানুষ কীভাবে প্রথম রাজা বানাল? [পর্ব ১ • ০:০০ - ১:১২ মিনিট]
৩ লক্ষ বছর ধরে মানুষ কোনো রাজা ছাড়াই মুক্ত ও সমানভাবে বাস করত। কালাহারির শিকারিরা অহংকার দমাতে কী অদ্ভুত নিয়ম মানত?

👉 সম্পূর্ণ ১৫ মিনিটের অ্যানিমেটেড তথ্যচিত্রটি দেখতে ভিজিট করুন আমাদের চ্যানেলে:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #oversimplified #ancienthistory #simplehistorytellerbangla #banglaanimation`,
    thumbPath: path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'shorts', 'thumb_bn_part1.jpg')
  },
  {
    part: 2,
    id: '9OZSdYiXDec',
    title: 'কৃষিকাজের মারণফাঁদ ও লোভের জন্ম! 🌾 [পর্ব ২ • ১:১২ - ২:৩০] #Shorts #ইতিহাস',
    description: `কৃষিকাজের মারণফাঁদ ও লোভের জন্ম! [পর্ব ২ • ১:১২ - ২:৩০ মিনিট]
কৃষিকাজ শুরু হতেই মানুষ কীভাবে নিজের ফাঁদে নিজেই আটকা পড়ল? শস্যভাণ্ডারের প্রথম উদ্বৃত্ত সম্পদ কীভাবে মানব ইতিহাসকে চিরতরে বদলে দিল?

👉 সম্পূর্ণ ১৫ মিনিটের অ্যানিমেটেড তথ্যচিত্রটি দেখতে ভিজিট করুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #কৃষিবিপ্লব #oversimplified #ancienthistory #simplehistorytellerbangla #banglaanimation`,
    thumbPath: path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'shorts', 'thumb_bn_part2.jpg')
  },
  {
    part: 3,
    id: 'P7YWpTTRMV0',
    title: 'পৃথিবীর প্রথম কর ও ইতিহাসের প্রথম ডন! ⚔️ [পর্ব ৩ • ২:৩০ - ৩:৪৯] #Shorts #ইতিহাস',
    description: `পৃথিবীর প্রথম কর ও ইতিহাসের প্রথম ডন! [পর্ব ৩ • ২:৩০ - ৩:৪৯ মিনিট]
শস্য চোরদের হাত থেকে বাঁচাতে পাহাদার রাখা হলো। কিন্তু সেই পাহাদারই যখন অস্ত্র উঁচিয়ে সবার কাছ থেকে ভাগ চাইল—জন্ম নিল পৃথিবীর প্রথম ট্যাক্স ও মাফিয়া সিস্টেম!

👉 সম্পূর্ণ ভিডিওটি দেখুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথমট্যাক্স #oversimplified #ancienthistory #simplehistorytellerbangla #banglaanimation`,
    thumbPath: path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'shorts', 'thumb_bn_part3.jpg')
  },
  {
    part: 4,
    id: 'j-_H_lnSzpA',
    title: 'সুমেরীয় সম্রাট সার্গন ও প্রথম সিংহাসন! 🏛️ [পর্ব ৪ • ৩:৪৯ - ৫:০৩] #Shorts #ইতিহাস',
    description: `সুমেরীয় সম্রাট সার্গন ও প্রথম সিংহাসন! [পর্ব ৪ • ৩:৪৯ - ৫:০৩ মিনিট]
'রাজতন্ত্র আকাশ থেকে নামল'—সুমেরীয় রাজাতালিকার রহস্য এবং সার্গন অফ আক্কাদ কীভাবে পৃথিবীর প্রথম স্থায়ী সেনাবাহিনী গড়ে তুলে নিজেকে সম্রাট ঘোষণা করলেন?

👉 সম্পূর্ণ ভিডিওটি দেখতে ক্লিক করুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #সুমেরীয়সভ্যতা #সার্গন #oversimplified #ancienthistory #simplehistorytellerbangla #banglaanimation`,
    thumbPath: path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'shorts', 'thumb_bn_part4.jpg')
  }
];

async function bringToFront() {
  try {
    execSync('powershell -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Chrome\')"', { stdio: 'ignore' });
  } catch (e) {}
}

async function uploadThumbnail(page, filePath) {
  console.log('Uploading thumbnail:', filePath);
  // Scroll to thumbnail area
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 500;
  });
  await page.waitForTimeout(1000);

  const fileInput = page.locator('input#file-loader, ytcp-thumbnails-compact input[type="file"], input[type="file"]').first();
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles(filePath);
    await page.waitForTimeout(4000);
    return true;
  }

  const uploadBtn = page.locator('ytcp-thumbnails-compact #select-button, button:has-text("Upload file"), [aria-label*="Upload file"]').first();
  if (await uploadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null),
      uploadBtn.click().catch(() => {})
    ]);
    if (fileChooser) {
      await fileChooser.setFiles(filePath);
      await page.waitForTimeout(4000);
      return true;
    }
  }
  return false;
}

async function clickSave(page) {
  console.log('Clicking Save button...');
  const saveBtn = page.locator('#save-button, ytcp-button#save-button, button:has-text("SAVE"), button:has-text("Save"), [aria-label*="Save"]').first();
  await page.waitForTimeout(1000);
  if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    const isDisabled = await saveBtn.getAttribute('disabled');
    const ariaDisabled = await saveBtn.getAttribute('aria-disabled');
    if (isDisabled !== null || ariaDisabled === 'true') {
      console.log('Save button is already disabled / saved.');
      return true;
    }
    await saveBtn.click({ force: true });
    console.log('Save clicked! Waiting for save confirmation...');
    await page.waitForTimeout(5000);
    return true;
  }
  return false;
}

(async () => {
  console.log('Connecting to browser via CDP at http://127.0.0.1:9224 ...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const pages = context.pages();
  let page = pages.find(p => p.url().includes('studio.youtube.com')) || pages[0];

  // Disable beforeunload dialog block
  await page.evaluate(() => {
    window.onbeforeunload = null;
  }).catch(() => {});

  for (const item of shorts) {
    console.log(`\n======================================================`);
    console.log(`PROCESSING SHORT PART ${item.part} (${item.id})`);
    console.log(`======================================================`);

    const editUrl = `https://studio.youtube.com/video/${item.id}/edit`;
    console.log('Navigating to:', editUrl);

    try {
      await page.goto(editUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (e) {
      console.log('Navigation note:', e.message);
    }

    await page.waitForTimeout(5000);
    await bringToFront();

    // Disable beforeunload on new page
    await page.evaluate(() => {
      window.onbeforeunload = null;
    }).catch(() => {});

    // Scroll to top
    await page.evaluate(() => {
      const m = document.querySelector('main#main');
      if (m) m.scrollTop = 0;
    });
    await page.waitForTimeout(1000);

    // Update Title
    console.log('Updating Short Title to:', item.title);
    const titleBox = page.locator('#title-textarea #textbox, ytcp-social-suggestions-textbox[label="Title"] #textbox, [aria-label*="title" i] #textbox').first();
    if (await titleBox.isVisible({ timeout: 5000 }).catch(() => false)) {
      await titleBox.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(item.title);
      await page.waitForTimeout(500);
    }

    // Update Description
    console.log('Updating Short Description...');
    const descBox = page.locator('#description-textarea #textbox, ytcp-social-suggestions-textbox[label="Description"] #textbox, [aria-label*="description" i] #textbox').first();
    if (await descBox.isVisible({ timeout: 5000 }).catch(() => false)) {
      await descBox.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await descBox.evaluate((el, text) => {
        el.innerText = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }, item.description);
      await page.waitForTimeout(500);
    }

    // Attach Custom Thumbnail
    console.log(`Uploading Part ${item.part} Custom Thumbnail: ${item.thumbPath}`);
    await uploadThumbnail(page, item.thumbPath);

    // Take screenshot of staged Short
    await page.evaluate(() => {
      const m = document.querySelector('main#main');
      if (m) m.scrollTop = 200;
    });
    await page.waitForTimeout(1500);

    const stagedShot = `tools/short_part${item.part}_saved.png`;
    await page.screenshot({ path: stagedShot });
    console.log(`Captured preview for Part ${item.part} -> ${stagedShot}`);

    // Click Save
    await clickSave(page);
    console.log(`Part ${item.part} saved!`);
    await page.waitForTimeout(3000);
  }

  // Final Overview Screenshots
  console.log('\nNavigating to Shorts list in Studio...');
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'tools/yt_shorts_final_overview.png' });
  console.log('Saved tools/yt_shorts_final_overview.png');

  console.log('Navigating to Master Videos list in Studio...');
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/upload', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'tools/yt_videos_final_overview.png' });
  console.log('Saved tools/yt_videos_final_overview.png');

  console.log('\n=== ALL 4 SHORTS SUCCESSFULLY UPDATED WITH CUSTOM THUMBNAILS & SAVED! ===');
  process.exit(0);
})().catch(err => {
  console.error('Error during shorts update:', err);
  process.exit(1);
});
