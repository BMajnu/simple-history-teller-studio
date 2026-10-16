const { chromium } = require('playwright-core');

(async () => {
  console.log('=== FINALIZING META CROSS-POSTING CONFIGURATION ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  await page.goto('https://accountscenter.facebook.com/connected_experiences/cross_posting_dialog/17841480341771622', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // 1. Turn on first false switch (Your Instagram story)
  let falseSwitch = page.locator('[role="switch"][aria-checked="false"]').first();
  if (await falseSwitch.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Turning on Story switch...');
    await falseSwitch.click();
    await page.waitForTimeout(2000);
  }

  // 2. Turn on next false switch (Your Instagram posts)
  falseSwitch = page.locator('[role="switch"][aria-checked="false"]').first();
  if (await falseSwitch.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('Turning on Posts switch...');
    await falseSwitch.click();
    await page.waitForTimeout(2000);
  }

  // 3. Check "Share to" options
  const shareTo = page.locator('div[role="button"]:has-text("Share to"), div:has-text("Share to")').last();
  if (await shareTo.isVisible().catch(() => false)) {
    console.log('Clicking Share to...');
    await shareTo.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'tools/meta_share_to_options.png' });
    console.log('Saved tools/meta_share_to_options.png');

    // If History Teller is an option, pick it
    const historyTellerOpt = page.locator('text=History Teller').first();
    if (await historyTellerOpt.isVisible().catch(() => false)) {
      console.log('Selecting History Teller Page as Share to destination!');
      await historyTellerOpt.click();
      await page.waitForTimeout(2000);
    }
  }

  await page.screenshot({ path: 'tools/meta_crossposting_active_final.png' });
  console.log('Saved tools/meta_crossposting_active_final.png');

  // Copy to artifacts
  const fs = require('fs');
  fs.copyFileSync('tools/meta_crossposting_active_final.png', 'C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/meta_crossposting_live.png');
  console.log('Artifact updated: meta_crossposting_live.png');

  await page.close();
  process.exit(0);
})();
