const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  console.log('=== FILLING HINDI FACEBOOK PAGE DETAILS ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.error('FB create page not found');
    process.exit(1);
  }

  // 1. Page Name at (180, 232)
  console.log('Filling Page Name...');
  await p.mouse.click(180, 232);
  await p.waitForTimeout(500);
  await p.keyboard.type('Simple History Teller Hindi', { delay: 50 });
  await p.waitForTimeout(1000);

  // 2. Category at (70, 365)
  console.log('Filling Category...');
  await p.mouse.click(70, 365);
  await p.waitForTimeout(500);
  await p.keyboard.type('Digital creator', { delay: 50 });
  await p.waitForTimeout(2000);

  // Click the dropdown option for Digital creator
  const option = p.locator('div[role="listbox"] div[role="option"], div[role="option"]:has-text("Digital creator"), span:has-text("Digital creator")').first();
  if (await option.isVisible().catch(() => false)) {
    console.log('Clicking Digital creator option...');
    await option.click();
  } else {
    console.log('Pressing Enter for category...');
    await p.keyboard.press('ArrowDown');
    await p.keyboard.press('Enter');
  }
  await p.waitForTimeout(1500);

  // 3. Bio at (180, 485)
  console.log('Filling Bio...');
  await p.mouse.click(180, 485);
  await p.waitForTimeout(500);
  await p.keyboard.type('🏛️ एनिमेशन के ज़रिये जानिए इतिहास के रोमांचक रहस्य! ⏰ हर २ दिन में नया एपिसोड 📺 YouTube: @SimpleHistoryTellerHindi', { delay: 30 });
  await p.waitForTimeout(2000);

  // Take screenshot of filled form
  const client = await p.context().newCDPSession(p);
  let snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/fb_c3_filled_verified.png', Buffer.from(snap.data, 'base64'));
  console.log('Filled form screenshot saved.');

  // 4. Click Create Page
  const createBtn = p.locator('div[aria-label="Create Page"][role="button"], div[role="button"]:has-text("Create Page")').first();
  if (await createBtn.isVisible().catch(() => false)) {
    console.log('Clicking Create Page button locator...');
    await createBtn.click();
  } else {
    console.log('Finding Create Page button via DOM...');
    const btnCoords = await p.evaluate(() => {
      const b = Array.from(document.querySelectorAll('div[role="button"]')).find(el => el.innerText && el.innerText.includes('Create Page'));
      if (b) {
        const r = b.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      }
      return null;
    });
    if (btnCoords) {
      console.log('Clicking at coords:', btnCoords);
      await p.mouse.click(btnCoords.x, btnCoords.y);
    }
  }

  console.log('Waiting 10s for page creation GraphQL response...');
  await p.waitForTimeout(10000);

  snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/fb_c3_after_create_result.png', Buffer.from(snap.data, 'base64'));
  console.log('Result screenshot saved.');

  process.exit(0);
})();
