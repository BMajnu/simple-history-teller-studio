const { chromium } = require('playwright-core');

const CAPTION = `🏛️ মানুষ কীভাবে প্রথম রাজা বানাল? [পর্ব 1] | সম্পূর্ণ ভিডিও দেখুন YouTube-এ @SimpleHistoryTellerBangla 👑 #ইতিহাস #অ্যানিমেশন #রহস্য #banglahistory #firstking #shorts #history`;

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('tiktok.com'));
  if (!page) {
    console.error('No TikTok page found!');
    process.exit(1);
  }

  console.log('1. Removing joyride tour overlays and modals via DOM...');
  await page.evaluate(() => {
    document.querySelectorAll('#react-joyride-portal, .react-joyride__overlay, .TUXModal-overlay, [data-floating-ui-portal]').forEach(el => el.remove());
  });
  await page.waitForTimeout(1000);

  // 2. Set Caption
  console.log('2. Setting caption...');
  const captionEditor = page.locator('.public-DraftEditor-content, div[contenteditable="true"]').first();
  if (await captionEditor.isVisible().catch(() => false)) {
    await captionEditor.click({ force: true });
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
    console.log('Caption inserted!');
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'tools/tiktok_ready_post.png' });
  console.log('Saved tools/tiktok_ready_post.png');

  // 3. Click Post button
  console.log('3. Clicking Post button...');
  const postBtn = page.locator('button:has-text("Post"), div[role="button"]:has-text("Post")').first();
  if (await postBtn.isVisible().catch(() => false)) {
    await postBtn.click({ force: true });
    console.log('Clicked Post button! Waiting 8s...');
    await page.waitForTimeout(8000);
  }

  await page.screenshot({ path: 'tools/tiktok_post_final.png' });
  console.log('Saved tools/tiktok_post_final.png');

  process.exit(0);
})().catch(console.error);
