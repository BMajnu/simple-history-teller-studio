const { chromium } = require('playwright-core');

(async () => {
  console.log('=== ENABLING CROSS-POSTING: REELS, POSTS, STORIES ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://accountscenter.facebook.com/connected_experiences/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Click "Your stories, reels and posts"
  console.log('Clicking Your stories, reels and posts...');
  const contentOption = page.locator('text=Your stories, reels and posts').first();
  await contentOption.click();
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'tools/meta_reels_cross_posting_screen.png' });
  console.log('Saved tools/meta_reels_cross_posting_screen.png. URL:', page.url());

  const text = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Screen text:\n', text);

  // Inspect checkboxes, toggles, or buttons
  const toggles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="checkbox"], [role="switch"], div[role="button"]')).map(el => ({
      tag: el.tagName,
      role: el.getAttribute('role'),
      ariaChecked: el.getAttribute('aria-checked'),
      text: el.innerText ? el.innerText.trim() : ''
    })).filter(x => x.text || x.role === 'switch');
  });
  console.log('Toggles/switches found:', toggles);

  // If there are switches that are false, turn them on
  const switches = page.locator('[role="switch"][aria-checked="false"]');
  const countSwitches = await switches.count();
  console.log('Inactive switches count:', countSwitches);
  for (let i = 0; i < countSwitches; i++) {
    await switches.nth(i).click();
    await page.waitForTimeout(1000);
  }

  // If there's an account selector (e.g. Share from / Share to)
  const rows = page.locator('div[role="button"]:has-text("Share to"), div[role="button"]:has-text("Share from")');
  if (await rows.count() > 0) {
    console.log('Found share config rows');
  }

  await page.screenshot({ path: 'tools/meta_cross_sharing_configured.png' });
  console.log('Saved tools/meta_cross_sharing_configured.png');

  const fs = require('fs');
  fs.copyFileSync('tools/meta_cross_sharing_configured.png', 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/meta_cross_posting_active.png');
  console.log('Copied to artifacts as meta_cross_posting_active.png');

  await page.close();
  process.exit(0);
})();
