const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const SHORT_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts', 'short_bn_part1.mp4');

const CAPTION = `🏛️ মানুষ কীভাবে প্রথম রাজা বানাল? [পর্ব 1] | সম্পূর্ণ ভিডিও দেখুন YouTube-এ @SimpleHistoryTellerBangla 👑 #ইতিহাস #অ্যানিমেশন #রহস্য #banglahistory #firstking #shorts #history`;

(async () => {
  console.log('Connecting to browser for TikTok upload...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to TikTok Studio Upload...');
  await page.goto('https://www.tiktok.com/tiktokstudio/upload', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Use native CDP DOM.setFileInputFiles for instant upload without websocket byte transfer limit
  console.log('Selecting short video file via CDP:', SHORT_PATH);
  const cdp = await ctx.newCDPSession(page);
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', {
    nodeId: root.nodeId,
    selector: 'input[type="file"]'
  });
  console.log('Found TikTok file input nodeId:', nodeId);

  await cdp.send('DOM.setFileInputFiles', {
    files: [SHORT_PATH],
    nodeId: nodeId
  });

  console.log('Short video file attached via CDP! Waiting 12s for upload & form render...');
  await page.waitForTimeout(12000);

  await page.screenshot({ path: 'tools/tiktok_uploaded_screen.png' });
  console.log('Saved tools/tiktok_uploaded_screen.png');

  // Look for caption editor
  console.log('Looking for caption editor...');
  const captionEditor = page.locator('.public-DraftEditor-content, div[contenteditable="true"], [aria-label*="caption"], [aria-label*="Caption"], textarea').first();
  if (await captionEditor.isVisible({ timeout: 15000 }).catch(() => false)) {
    console.log('Found caption editor! Filling caption...');
    await captionEditor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(500);

    // Type caption or insert text
    await page.evaluate((text) => {
      const el = document.querySelector('.public-DraftEditor-content, div[contenteditable="true"]');
      if (el) {
        el.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        document.execCommand('insertText', false, text);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, CAPTION);
    console.log('Caption filled!');
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tools/tiktok_caption_filled.png' });
  console.log('Saved tools/tiktok_caption_filled.png');

  // Look for Post button
  console.log('Looking for Post button...');
  const postBtn = page.locator('button:has-text("Post"), button:has-text("পোস্ট"), div[role="button"]:has-text("Post")').first();
  if (await postBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
    console.log('Clicking Post button...');
    await postBtn.click({ force: true });
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'tools/tiktok_posted_screen.png' });
    console.log('Saved tools/tiktok_posted_screen.png');
  }

  await page.close();
  console.log('=== TIKTOK SHORT PART 1 UPLOAD PROCESS COMPLETE! ===');
  process.exit(0);
})().catch(err => {
  console.error('TikTok Upload Error:', err);
  process.exit(1);
});
