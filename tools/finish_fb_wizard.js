const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  console.log('=== FINISHING FACEBOOK PAGE WIZARD ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.error('FB create page not found');
    process.exit(1);
  }

  // Loop to advance through remaining steps (Step 3: WhatsApp Skip, Step 4: Audience Next, Step 5: Notifications Done)
  for (let step = 3; step <= 6; step++) {
    console.log(`\n--- HANDLING STEP (around ${step}) ---`);
    await p.waitForTimeout(2000);
    const body = await p.innerText('body');
    console.log('Snippet:', body.substring(0, 250).replace(/\n+/g, ' '));

    if (p.url().includes('/profile.php') || (!p.url().includes('/pages/create') && !body.includes('Step '))) {
      console.log('Wizard finished! Current URL:', p.url());
      break;
    }

    // Look for Skip, Next, Done buttons
    const skipBtn = p.locator('div[aria-label="Skip"][role="button"], div[role="button"]:has-text("Skip")').first();
    const nextBtn = p.locator('div[aria-label="Next"][role="button"], div[role="button"]:has-text("Next")').first();
    const doneBtn = p.locator('div[aria-label="Done"][role="button"], div[role="button"]:has-text("Done")').first();

    if (await skipBtn.isVisible().catch(() => false)) {
      console.log('Clicking Skip...');
      await skipBtn.click();
    } else if (await nextBtn.isVisible().catch(() => false)) {
      console.log('Clicking Next...');
      await nextBtn.click();
    } else if (await doneBtn.isVisible().catch(() => false)) {
      console.log('Clicking Done...');
      await doneBtn.click();
    } else {
      console.log('Looking for any clickable button in left area...');
      const btns = await p.evaluate(() => {
        return Array.from(document.querySelectorAll('div[role="button"]'))
          .filter(b => b.innerText && (b.innerText.includes('Skip') || b.innerText.includes('Next') || b.innerText.includes('Done')))
          .map(b => ({ text: b.innerText, rect: b.getBoundingClientRect() }));
      });
      console.log('Matching buttons:', btns);
      if (btns.length > 0) {
        const target = btns[btns.length - 1];
        await p.mouse.click(target.rect.x + target.rect.width / 2, target.rect.y + target.rect.height / 2);
      }
    }
    await p.waitForTimeout(4000);
  }

  console.log('Waiting for final page load...');
  await p.waitForTimeout(5000);
  console.log('Final Page URL:', p.url());

  // Capture final page screenshot using buffer with omitBackground/timeout
  try {
    const buf = await p.screenshot({ timeout: 15000 });
    fs.writeFileSync('tools/fb_c2_live_page_final.png', buf);
    fs.writeFileSync('C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/fb_page_c2_live.png', buf);
    console.log('Screenshot successfully saved to tools and artifact!');
  } catch (e) {
    console.warn('Screenshot error:', e.message);
  }

  process.exit(0);
})();
