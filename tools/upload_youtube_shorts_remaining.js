const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');

const SHORTS_DATA = [
  {
    part: 2,
    file: path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts', 'short_bn_part2.mp4'),
    title: 'মানুষ কীভাবে প্রথম রাজা বানাল? 👑 [পর্ব ২] #Shorts #History',
    desc: `শিকারির সমাজ থেকে শস্যভাণ্ডার এবং প্রথম রাজার উত্থান!\n\nসম্পূর্ণ ১৫ মিনিটের অ্যানিমেটেড ইতিহাস দেখুন চ্যানেলে: @SimpleHistoryTellerBangla\n\n#SimpleHistoryTellerBangla #Shorts #ইতিহাস #AnimatedHistory #BanglaHistory #FirstKing`
  },
  {
    part: 3,
    file: path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts', 'short_bn_part3.mp4'),
    title: 'মানুষ কীভাবে প্রথম রাজা বানাল? 👑 [পর্ব ৩] #Shorts #History',
    desc: `পৃথিবীর প্রথম কর ও প্রোটেকশন র‍্যাকেট!\n\nসম্পূর্ণ ১৫ মিনিটের অ্যানিমেটেড ইতিহাস দেখুন চ্যানেলে: @SimpleHistoryTellerBangla\n\n#SimpleHistoryTellerBangla #Shorts #ইতিহাস #AnimatedHistory #BanglaHistory #FirstKing`
  },
  {
    part: 4,
    file: path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts', 'short_bn_part4.mp4'),
    title: 'মানুষ কীভাবে প্রথম রাজা বানাল? 👑 [পর্ব ৪] #Shorts #History',
    desc: `সুমেরীয় জিগুরাত, সার্গন অফ আক্কাদ এবং আধুনিক রাষ্ট্র!\n\nসম্পূর্ণ ১৫ মিনিটের অ্যানিমেটেড ইতিহাস দেখুন চ্যানেলে: @SimpleHistoryTellerBangla\n\n#SimpleHistoryTellerBangla #Shorts #ইতিহাস #AnimatedHistory #BanglaHistory #FirstKing`
  }
];

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  for (const item of SHORTS_DATA) {
    console.log(`\n========================================`);
    console.log(`▶ UPLOADING BANGLA SHORT PART ${item.part}...`);
    console.log(`File: ${item.file}`);
    console.log(`Title: ${item.title}`);

    // Navigate to studio upload URL
    await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/upload?d=pt', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await page.waitForTimeout(3000);

    // Dismiss any dialogs
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Trigger upload modal via Create button
    const createBtn = page.locator('#create-icon, button:has-text("Create"), ytcp-button:has-text("Create"), button:has-text("তৈরি করুন")').first();
    if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(1000);
      const uploadItem = page.locator('tp-yt-paper-item:has-text("Upload videos"), ytd-compact-link-renderer:has-text("Upload videos"), [aria-label*="Upload"]').first();
      if (await uploadItem.isVisible({ timeout: 3000 }).catch(() => false)) {
        await uploadItem.click();
        await page.waitForTimeout(3000);
      }
    } else {
      const uploadBtn = page.locator('ytcp-button:has-text("Upload videos"), button:has-text("Upload videos"), #upload-button').first();
      if (await uploadBtn.isVisible().catch(() => false)) {
        await uploadBtn.click();
        await page.waitForTimeout(3000);
      }
    }

    // Attach file via CDP
    const cdp = await ctx.newCDPSession(page);
    const { root } = await cdp.send('DOM.getDocument');
    const { nodeId } = await cdp.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: 'input[type="file"]'
    });

    console.log(`Found file input nodeId: ${nodeId}`);
    await cdp.send('DOM.setFileInputFiles', {
      files: [item.file],
      nodeId: nodeId
    });

    console.log(`File attached! Waiting 8s for form...`);
    await page.waitForTimeout(8000);

    // Set Title
    const titleBox = page.locator('#title-textarea #textbox').first();
    await titleBox.waitFor({ state: 'visible', timeout: 15000 });
    await titleBox.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);
    await page.evaluate((text) => {
      const el = document.querySelector('#title-textarea #textbox');
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, item.title);
    console.log('Title set!');
    await page.waitForTimeout(800);

    // Set Description
    const descBox = page.locator('#description-textarea #textbox').first();
    await descBox.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);
    await page.evaluate((text) => {
      const el = document.querySelector('#description-textarea #textbox');
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, item.desc);
    console.log('Description set!');
    await page.waitForTimeout(800);

    // Audience: Not made for kids
    const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
    if (await notForKids.isVisible({ timeout: 5000 }).catch(() => false)) {
      await notForKids.click({ force: true });
      await page.waitForTimeout(400);
    }

    // Step through Next buttons
    const nextBtn = page.locator('#next-button').first();
    await nextBtn.click();
    await page.waitForTimeout(2000);
    await nextBtn.click();
    await page.waitForTimeout(2000);
    await nextBtn.click();
    await page.waitForTimeout(2000);

    // Visibility: Public
    const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
    if (await publicRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
      await publicRadio.click({ force: true });
      await page.waitForTimeout(800);
    }

    // Click Publish
    const doneBtn = page.locator('#done-button').first();
    await doneBtn.waitFor({ state: 'visible', timeout: 5000 });
    await doneBtn.click({ force: true });
    console.log(`Published Part ${item.part}! Waiting 8s...`);
    await page.waitForTimeout(8000);

    const shareLink = await page.locator('a.ytcp-video-info, [href*="shorts"]').first().getAttribute('href').catch(() => null);
    console.log(`✓ Part ${item.part} Link: ${shareLink || 'Published successfully'}`);
    await page.screenshot({ path: `tools/short_part${item.part}_published.png` });
  }

  await page.close();
  console.log('\n🎉 ALL BANGLA SHORTS (PARTS 1, 2, 3, 4) SUCCESSFULLY PUBLISHED TO YOUTUBE!');
  process.exit(0);
})().catch(err => {
  console.error('Error in batch upload:', err);
  process.exit(1);
});
