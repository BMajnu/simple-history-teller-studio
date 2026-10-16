const { chromium } = require('playwright-core');

const CAPTION = `🏛️ মানুষ কীভাবে প্রথম রাজা বানাল? [পর্ব 1] | সম্পূর্ণ ভিডিও দেখুন YouTube-এ @SimpleHistoryTellerBangla 👑 #ইতিহাস #অ্যানিমেশন #রহস্য #banglahistory #firstking #shorts #history`;

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('tiktok.com'));
  if (!page) {
    console.error('No tiktok page found!');
    process.exit(1);
  }

  console.log('Dismissing Turn on popup...');
  const turnOnBtn = page.locator('button:has-text("Turn on"), button:has-text("Cancel")').first();
  if (await turnOnBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await turnOnBtn.click({ force: true });
    console.log('Turn on popup clicked!');
    await page.waitForTimeout(2000);
  } else {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  }

  // Look for caption editor
  console.log('Filling caption...');
  const captionEditor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').first();
  if (await captionEditor.isVisible({ timeout: 5000 }).catch(() => false)) {
    await captionEditor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(300);

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
    console.log('Caption set!');
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tools/tiktok_ready_to_post.png' });
  console.log('Saved tools/tiktok_ready_to_post.png');

  // Click Post
  console.log('Clicking Post button...');
  const postBtn = page.locator('button:has-text("Post"), div[role="button"]:has-text("Post")').first();
  if (await postBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await postBtn.click({ force: true });
    console.log('Post button clicked! Waiting 10s...');
    await page.waitForTimeout(10000);
    await page.screenshot({ path: 'tools/tiktok_post_result.png' });
    console.log('Saved tools/tiktok_post_result.png');
  }

  process.exit(0);
})().catch(console.error);
