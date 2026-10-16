const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const SHORT_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts', 'short_bn_part1.mp4');

const TITLE = 'মানুষ কীভাবে প্রথম রাজা বানাল? 👑 [পর্ব ১] #Shorts #History';
const DESCRIPTION = `আজ আমরা কোটি কোটি মানুষ রাজার শাসন মেনে নিই, কিন্তু প্রথম রাজা কীভাবে এলো? 

সম্পূর্ণ ১৫ মিনিটের অ্যানিমেটেড ইতিহাস দেখুন চ্যানেলে: @SimpleHistoryTellerBangla

#SimpleHistoryTellerBangla #Shorts #ইতিহাস #AnimatedHistory #BanglaHistory #FirstKing`;

(async () => {
  console.log('--- UPLOADING BANGLA SHORT PART 1 TO YOUTUBE SHORTS ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('1. Navigating to YouTube Studio Upload for Channel 2...');
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/upload?d=pt', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(4000);

  // Click Create button in header to trigger upload modal
  console.log('Triggering upload modal via Create button...');
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

  // Attach Short video via CDP
  console.log('2. Attaching Short video file via CDP:', SHORT_PATH);
  const cdp = await ctx.newCDPSession(page);
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', {
    nodeId: root.nodeId,
    selector: 'input[type="file"]'
  });
  console.log('Found file input nodeId:', nodeId);

  await cdp.send('DOM.setFileInputFiles', {
    files: [SHORT_PATH],
    nodeId: nodeId
  });

  console.log('File attached! Waiting 10s for details form...');
  await page.waitForTimeout(10000);

  // Set Title
  console.log('3. Setting Short Title...');
  const titleBox = page.locator('#title-textarea #textbox').first();
  await titleBox.waitFor({ state: 'visible', timeout: 20000 });
  await titleBox.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(300);
  await page.evaluate((text) => {
    const el = document.querySelector('#title-textarea #textbox');
    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertText', false, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, TITLE);
  console.log('Title set!');
  await page.waitForTimeout(1000);

  // Set Description
  console.log('4. Setting Short Description...');
  const descBox = page.locator('#description-textarea #textbox').first();
  await descBox.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(300);
  await page.evaluate((text) => {
    const el = document.querySelector('#description-textarea #textbox');
    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertText', false, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, DESCRIPTION);
  console.log('Description set!');
  await page.waitForTimeout(1000);

  // Audience: Not made for kids
  console.log('5. Setting Not Made For Kids...');
  const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKids.isVisible({ timeout: 5000 }).catch(() => false)) {
    await notForKids.click({ force: true });
    console.log('Audience set!');
    await page.waitForTimeout(500);
  }

  // Next -> Elements -> Next -> Checks -> Next -> Visibility
  const nextBtn = page.locator('#next-button').first();
  console.log('Clicking Next to Elements...');
  await nextBtn.click();
  await page.waitForTimeout(2500);

  console.log('Clicking Next to Checks...');
  await nextBtn.click();
  await page.waitForTimeout(2500);

  console.log('Clicking Next to Visibility...');
  await nextBtn.click();
  await page.waitForTimeout(2500);

  // Select Public
  console.log('Selecting Public visibility...');
  const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
  if (await publicRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
    await publicRadio.click({ force: true });
    console.log('Selected PUBLIC!');
    await page.waitForTimeout(1000);
  }

  const shortUrl = await page.locator('a.ytcp-video-info, a[href*="youtu.be"]').first().getAttribute('href').catch(() => null);
  console.log('>>> YOUTUBE SHORT URL:', shortUrl);

  // Click Save/Publish (#done-button)
  console.log('Publishing Short...');
  const doneBtn = page.locator('#done-button').first();
  await doneBtn.waitFor({ state: 'visible', timeout: 5000 });
  await doneBtn.click({ force: true });
  console.log('Published! Waiting 8s...');
  await page.waitForTimeout(8000);

  await page.screenshot({ path: 'tools/short_part1_published_yt.png' });
  console.log('Saved tools/short_part1_published_yt.png');

  await page.close();
  console.log('=== BANGLA SHORT PART 1 PUBLISHED TO YOUTUBE! ===');
  process.exit(0);
})().catch(err => {
  console.error('Error publishing short:', err);
  process.exit(1);
});
