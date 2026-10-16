const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  console.log('=== FILLING HINDI PAGE CREATION FORM ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.error('Create page not found');
    process.exit(1);
  }

  // Dismiss small switch toast if present
  await p.evaluate(() => {
    const toasts = Array.from(document.querySelectorAll('div')).filter(d => d.innerText && d.innerText.includes('Switched to'));
    toasts.forEach(t => t.remove());
  });

  // 1. Page Name
  const nameInput = p.locator('input[aria-label="Page name (required)"]').first();
  await nameInput.click();
  await nameInput.fill('Simple History Teller Hindi');
  console.log('Page name filled.');
  await p.waitForTimeout(1000);

  // 2. Category
  const catInput = p.locator('input[aria-label="Category (required)"]').first();
  await catInput.click();
  await catInput.fill('Digital creator');
  await p.waitForTimeout(1500);

  // Click the option
  const option = p.locator('div[role="listbox"] div[role="option"], div[role="option"]:has-text("Digital creator"), span:has-text("Digital creator")').first();
  if (await option.isVisible().catch(() => false)) {
    await option.click();
    console.log('Category selected: Digital creator');
  }
  await p.waitForTimeout(1000);

  // 3. Bio
  const bioInput = p.locator('textarea[aria-label="Bio (optional)"]').first();
  await bioInput.click();
  await bioInput.fill('🏛️ एनिमेशन के ज़रिये जानिए इतिहास के रोमांचक रहस्य! ⏰ हर २ दिन में नया एपिसोड 📺 YouTube: @SimpleHistoryTellerHindi');
  console.log('Bio filled.');
  await p.waitForTimeout(1000);

  const client = await p.context().newCDPSession(p);
  let snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/fb_c3_form_filled.png', Buffer.from(snap.data, 'base64'));

  // 4. Click Create Page button
  const createBtn = p.locator('div[aria-label="Create Page"][role="button"], div[role="button"]:has-text("Create Page")').first();
  if (await createBtn.isVisible().catch(() => false)) {
    console.log('Clicking Create Page button...');
    await createBtn.click();
  }

  console.log('Waiting 8s for creation response...');
  await p.waitForTimeout(8000);

  snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/fb_c3_after_create.png', Buffer.from(snap.data, 'base64'));

  process.exit(0);
})();
