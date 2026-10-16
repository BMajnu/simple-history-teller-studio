const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('=== UPLOADING HINDI COVER PHOTO ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/profile.php?id=61595333157867'));
  if (!p) {
    console.error('Hindi FB page not found');
    process.exit(1);
  }

  const bannerPath = path.resolve('banner_assets/banner_simple_history_teller_hi.jpg');

  // Look for "Add Cover Photo" button
  const addCoverBtn = p.locator('div[aria-label="Add Cover Photo"][role="button"], div[role="button"]:has-text("Add Cover Photo")').first();
  if (await addCoverBtn.isVisible().catch(() => false)) {
    console.log('Clicking Add Cover Photo button...');
    await addCoverBtn.click();
    await p.waitForTimeout(1500);

    const uploadOption = p.locator('div[role="menuitem"]:has-text("Upload photo"), span:has-text("Upload photo")').first();
    if (await uploadOption.isVisible().catch(() => false)) {
      console.log('Found Upload photo option. Setting file on fileChooser...');
      const [fileChooser] = await Promise.all([
        p.waitForEvent('filechooser', { timeout: 10000 }).catch(() => null),
        uploadOption.click().catch(() => {})
      ]);

      if (fileChooser) {
        console.log('FileChooser intercepted, setting files...');
        await fileChooser.setFiles(bannerPath);
      } else {
        const fileInputs = p.locator('input[type="file"]');
        if (await fileInputs.count() > 0) {
          await fileInputs.last().setInputFiles(bannerPath);
        }
      }
    }
  }

  console.log('Waiting 8s for cover photo preview to load...');
  await p.waitForTimeout(8000);

  // Find exact coordinates of Save changes button
  const btnInfo = await p.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const el = all.find(e => e.innerText && e.innerText.trim() === 'Save changes');
    if (!el) return null;
    const parent = el.closest('[role="button"]') || el;
    const rect = parent.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  });

  console.log('Save changes target coords:', btnInfo);
  if (btnInfo) {
    await p.mouse.click(btnInfo.x, btnInfo.y);
    console.log('Clicked Save changes button!');
    await p.waitForTimeout(6000);
  } else {
    // If not found yet, try clicking standard position
    console.log('Trying mouse click at (1803, 86)...');
    await p.mouse.click(1803, 86);
    await p.waitForTimeout(6000);
  }

  const client = await p.context().newCDPSession(p);
  const snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/fb_c3_live_page_final.png', Buffer.from(snap.data, 'base64'));
  fs.writeFileSync('C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/fb_page_c3_live.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved final Hindi Facebook page screenshot!');

  process.exit(0);
})();
