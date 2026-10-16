const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('=== COMPLETING HINDI FACEBOOK PAGE SETUP ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/pages/create'));
  if (!p) {
    console.error('FB create page not found');
    process.exit(1);
  }

  // --- STEP 1: Contact Details ---
  console.log('--- Step 1: Filling contact info ---');
  // Website
  const websiteInput = p.locator('input[type="text"]').first();
  await websiteInput.click();
  await websiteInput.fill('https://youtube.com/@SimpleHistoryTellerHindi');
  await p.waitForTimeout(500);

  // Email
  const emailInput = p.locator('input[type="text"]').nth(2);
  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.click();
    await emailInput.fill('bmajnu9811@gmail.com');
  } else {
    // Try by label or finding email input
    const emailLoc = p.locator('input[aria-label="Email address"], input[name="email"]').first();
    if (await emailLoc.isVisible().catch(() => false)) {
      await emailLoc.fill('bmajnu9811@gmail.com');
    }
  }
  await p.waitForTimeout(1000);

  // Remove toast
  await p.evaluate(() => {
    const toasts = Array.from(document.querySelectorAll('div')).filter(d => d.innerText && d.innerText.includes('was created'));
    toasts.forEach(t => t.remove());
  });
  await p.waitForTimeout(500);

  // Click Next on Step 1
  console.log('Clicking Next on Step 1...');
  const nextBtn1 = p.locator('div[aria-label="Next"][role="button"], div[role="button"]:has-text("Next")').first();
  if (await nextBtn1.isVisible().catch(() => false)) {
    await nextBtn1.click();
  } else {
    await p.mouse.click(265, 893);
  }
  await p.waitForTimeout(4000);

  // --- STEP 2: Images (Avatar & Banner) ---
  console.log('--- Step 2: Uploading Images ---');
  const avatarPath = path.resolve('banner_assets/history_mascot_02_torch_stone_arch_ruins.jpg');
  const bannerPath = path.resolve('banner_assets/banner_simple_history_teller_hi.jpg');

  const fileLocators = p.locator('input[type="file"]');
  const count = await fileLocators.count();
  console.log('File inputs count on Step 2:', count);

  if (count >= 1) {
    console.log('Uploading avatar to input 0...');
    await fileLocators.nth(0).setInputFiles(avatarPath);
    await p.waitForTimeout(5000);
  }

  const countAfter = await p.locator('input[type="file"]').count();
  console.log('File inputs count after avatar:', countAfter);
  if (countAfter >= 2) {
    console.log('Uploading Hindi banner to input 1...');
    await p.locator('input[type="file"]').nth(1).setInputFiles(bannerPath);
    await p.waitForTimeout(5000);
  }

  // Click Next on Step 2
  console.log('Clicking Next on Step 2...');
  const nextBtn2 = p.locator('div[aria-label="Next"][role="button"], div[role="button"]:has-text("Next")').first();
  if (await nextBtn2.isVisible().catch(() => false)) {
    await nextBtn2.click();
  } else {
    await p.mouse.click(265, 893);
  }
  await p.waitForTimeout(4000);

  // --- STEPS 3, 4, 5: WhatsApp Skip, Audience Next, Notifications Done ---
  for (let s = 3; s <= 6; s++) {
    console.log(`Advancing wizard step ${s}...`);
    await p.waitForTimeout(2000);

    if (p.url().includes('/profile.php')) {
      console.log('Reached profile page!');
      break;
    }

    const skipBtn = p.locator('div[aria-label="Skip"][role="button"], div[role="button"]:has-text("Skip")').first();
    const nextBtn = p.locator('div[aria-label="Next"][role="button"], div[role="button"]:has-text("Next")').first();
    const doneBtn = p.locator('div[aria-label="Done"][role="button"], div[role="button"]:has-text("Done")').first();

    if (await skipBtn.isVisible().catch(() => false)) {
      console.log('Clicking Skip on step', s);
      await skipBtn.click();
    } else if (await nextBtn.isVisible().catch(() => false)) {
      console.log('Clicking Next on step', s);
      await nextBtn.click();
    } else if (await doneBtn.isVisible().catch(() => false)) {
      console.log('Clicking Done on step', s);
      await doneBtn.click();
    }
    await p.waitForTimeout(3500);
  }

  console.log('Waiting for final profile load...');
  await p.waitForTimeout(5000);
  console.log('Final URL:', p.url());

  const client = await p.context().newCDPSession(p);
  const snap = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('tools/fb_c3_live_page_final.png', Buffer.from(snap.data, 'base64'));
  fs.writeFileSync('C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/fb_page_c3_live.png', Buffer.from(snap.data, 'base64'));
  console.log('Hindi Facebook Page is live and saved to artifacts!');

  process.exit(0);
})();
