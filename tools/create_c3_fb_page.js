const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('=== CREATING HINDI FACEBOOK PAGE ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  
  // Find or create a page for fb create
  let p = ctx.pages().find(page => page.url().includes('facebook.com'));
  if (!p) {
    p = await ctx.newPage();
  }

  await p.goto('https://www.facebook.com/pages/create/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(5000);

  // Take initial snapshot
  const client = await p.context().newCDPSession(p);
  let snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/fb_c3_create_initial.png', Buffer.from(snap.data, 'base64'));
  console.log('Navigated to https://www.facebook.com/pages/create/');

  // Fill Page Name
  const nameInput = p.locator('input[aria-label="Page name (required)"], input[type="text"]').first();
  await nameInput.click();
  await nameInput.fill('Simple History Teller Hindi');
  console.log('Filled Page Name: Simple History Teller Hindi');
  await p.waitForTimeout(1000);

  // Fill Category
  const catInput = p.locator('input[aria-label="Category (required)"]').first();
  if (await catInput.isVisible().catch(() => false)) {
    await catInput.click();
    await catInput.fill('Digital creator');
    await p.waitForTimeout(1500);
    // Select dropdown option
    const option = p.locator('div[role="listbox"] div[role="option"], div[role="option"]:has-text("Digital creator"), span:has-text("Digital creator")').first();
    if (await option.isVisible().catch(() => false)) {
      await option.click();
      console.log('Selected category: Digital creator');
    }
  }

  // Fill Bio
  const bioInput = p.locator('textarea[aria-label="Bio (optional)"]').first();
  if (await bioInput.isVisible().catch(() => false)) {
    await bioInput.click();
    await bioInput.fill('🏛️ एनिमेशन के ज़रिये जानिए इतिहास के रोमांचक रहस्य! ⏰ हर २ दिन में नया एपिसोड 📺 YouTube: @SimpleHistoryTellerHindi');
    console.log('Filled Bio');
  }

  await p.waitForTimeout(2000);
  snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/fb_c3_filled_form.png', Buffer.from(snap.data, 'base64'));

  // Click Create Page button
  const createBtn = p.locator('div[aria-label="Create Page"][role="button"], div[role="button"]:has-text("Create Page")').first();
  if (await createBtn.isVisible().catch(() => false)) {
    console.log('Clicking Create Page button...');
    await createBtn.click();
  } else {
    console.log('Create Page button not found via locator, searching role=button...');
    const btnCoords = await p.evaluate(() => {
      const b = Array.from(document.querySelectorAll('div[role="button"]')).find(el => el.innerText && el.innerText.includes('Create Page'));
      if (b) {
        const r = b.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      }
      return null;
    });
    if (btnCoords) {
      await p.mouse.click(btnCoords.x, btnCoords.y);
    }
  }

  console.log('Waiting 10s for page creation GraphQL...');
  await p.waitForTimeout(10000);

  snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/fb_c3_after_create_click.png', Buffer.from(snap.data, 'base64'));
  console.log('Saved tools/fb_c3_after_create_click.png. Current URL:', p.url());

  process.exit(0);
})();
