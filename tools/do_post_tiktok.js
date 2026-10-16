const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('tiktok.com'));
  if (!page) {
    console.error('No TikTok page found!');
    process.exit(1);
  }

  // Handle beforeunload / dialogs automatically
  page.on('dialog', async d => {
    console.log('Dialog encountered:', d.type(), d.message());
    await d.dismiss().catch(() => {});
  });

  // Remove the exit modal and any tooltips from DOM directly
  console.log('Removing modals and tooltips...');
  await page.evaluate(() => {
    // Click cancel button if exists
    const btns = Array.from(document.querySelectorAll('button'));
    const cancel = btns.find(b => b.innerText.trim() === 'Cancel');
    if (cancel) cancel.click();

    const gotIt = btns.find(b => b.innerText.trim() === 'Got it');
    if (gotIt) gotIt.click();
  });
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: 'tools/tiktok_modal_cleared.png' });
  console.log('Saved tools/tiktok_modal_cleared.png');

  // Fill caption if empty
  const CAPTION = `🏛️ মানুষ কীভাবে প্রথম রাজা বানাল? [পর্ব 1] | সম্পূর্ণ ভিডিও দেখুন YouTube-এ @SimpleHistoryTellerBangla 👑 #ইতিহাস #অ্যানিমেশন #রহস্য #banglahistory #firstking #shorts #history`;
  await page.evaluate((caption) => {
    const el = document.querySelector('.public-DraftEditor-content, div[contenteditable="true"]');
    if (el && (!el.innerText || el.innerText.trim().length < 10)) {
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, caption);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, CAPTION);
  await page.waitForTimeout(1000);

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  // Find Post button and click
  console.log('Locating and clicking Post button...');
  const postBtn = page.locator('button:has-text("Post")').last();
  if (await postBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await postBtn.scrollIntoViewIfNeeded();
    await postBtn.click({ force: true });
    console.log('Post clicked! Waiting 15s for completion...');
    await page.waitForTimeout(15000);
  }

  await page.screenshot({ path: 'tools/tiktok_post_after_click.png' });
  console.log('Saved tools/tiktok_post_after_click.png');

  // DO NOT CLOSE PAGE! Keep it alive in Chrome!
  console.log('Done!');
  process.exit(0);
})().catch(console.error);
