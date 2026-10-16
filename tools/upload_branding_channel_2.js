const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.join(ARTIFACTS_DIR, 'history_mascot_02_torch_stone_arch_ruins.jpg');
const BANNER_PATH = path.join(ARTIFACTS_DIR, 'banner_simple_history_teller_bn.jpg');

const CHANNEL_ID = 'UCOzERwa3GJqO00B8LMTPtDg';
const EMAIL = 'bmajnu981@gmail.com';

const DESCRIPTION_BN = `সিম্পল হিস্ট্রি টেলার বাংলা (Simple History Teller Bangla)-এ আপনাকে স্বাগতম! 🏛️✨
এখানে প্রাচীন ইতিহাস, রোমাঞ্চকর প্রত্নতাত্ত্বিক আবিষ্কার এবং বিশ্ব ইতিহাসের অজানা রহস্যগুলো জীবন্ত হয়ে ওঠে সহজ ও মনোগ্রাহী অ্যানিমেশনের মাধ্যমে।

মানব সভ্যতার সূচনা, ভাষার আদি উৎস থেকে শুরু করে রাজা-বাদশাহদের গোপন পরীক্ষা-নিরীক্ষা, ঐতিহাসিক যুদ্ধ এবং হারিয়ে যাওয়া প্রাচীন সাম্রাজ্যের গল্প—সবকিছু জানতে আমাদের সাথে যুক্ত থাকুন।

📜 আমাদের বিষয়বস্তু:
• প্রাচীন সভ্যতা, পিরামিড ও প্রত্নতাত্ত্বিক অনুসন্ধান
• মানব বিবর্তন এবং ভাষার উৎপত্তি
• রাজা ও সম্রাটদের বিচিত্র গোপন ইতিহাস
• বিশ্ব কাঁপানো ঐতিহাসিক যুদ্ধ ও আবিষ্কার
• অ্যানিমেটেড ইতিহাস তথ্যচিত্র ও ডকুমেন্টারি

⏰ প্রতি ২ দিন পরপর নতুন পর্ব (সপ্তাহে ৩টি এপিসোড)!
📩 ব্যবসায়িক যোগাযোগ: bmajnu981@gmail.com

🔔 আজই সাবস্ক্রাইব করুন এবং ইতিহাসের রোমাঞ্চকর যাত্রায় আমাদের সঙ্গী হোন!

#SimpleHistoryTellerBangla #ইতিহাস #বাংলাইতিহাস #AncientHistory #BanglaHistory #OverSimplified #HistoryDocumentary`;

(async () => {
  console.log('=== UPDATING BRANDING FOR CHANNEL 2 (Bangla: bmajnu981) ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  page.on('dialog', async d => {
    console.log('Accepting dialog:', d.message());
    await d.accept().catch(() => {});
  });

  // 1. Switch account to bmajnu981
  console.log('Switching account to bmajnu981...');
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const avatarBtn = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatarBtn.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("অন্য অ্যাকাউন্ট ব্যবহার"), ytd-compact-link-renderer:has-text("অ্যাকাউন্ট বদলান")').first();
  if (await switchItem.isVisible().catch(() => false)) {
    await switchItem.click();
    await page.waitForTimeout(2000);

    const section = page.locator('ytd-account-item-section-renderer').filter({ hasText: EMAIL }).first();
    if (await section.count() > 0) {
      console.log('Found section for bmajnu981, clicking...');
      const item = section.locator('ytd-account-item-renderer, #channel-title').first();
      await item.click();
      await page.waitForTimeout(4000);
    } else {
      const directItem = page.locator(`ytd-account-item-renderer:has-text("${EMAIL}")`).first();
      if (await directItem.count() > 0) {
        await directItem.click();
        await page.waitForTimeout(4000);
      }
    }
  }

  // 2. Open Channel 2 Studio Profile
  console.log('Navigating to Channel 2 Studio Profile...');
  await page.goto(`https://studio.youtube.com/channel/${CHANNEL_ID}/editing/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Clear any overlays
  await page.evaluate(() => {
    document.querySelectorAll('.cdk-overlay-container, .cdk-overlay-backdrop').forEach(el => el.remove());
  });

  // 3. Upload Logo
  console.log('Setting Logo for Channel 2...');
  const profileInput = page.locator('ytcp-profile-image-upload input[type="file"]').first();
  if (await profileInput.count() > 0) {
    await profileInput.setInputFiles(LOGO_PATH);
    await page.waitForTimeout(3000);

    const doneBtns = page.locator('button:has-text("Done")');
    const dCount = await doneBtns.count();
    for (let i = 0; i < dCount; i++) {
      if (await doneBtns.nth(i).isVisible()) {
        console.log(`Clicking Logo Done button ${i}...`);
        await doneBtns.nth(i).click({ force: true });
        await page.waitForTimeout(3000);
        break;
      }
    }
  }

  // 4. Upload Banner
  console.log('Setting Banner for Channel 2...');
  const bannerInput = page.locator('ytcp-banner-upload input[type="file"]').first();
  if (await bannerInput.count() > 0) {
    await bannerInput.setInputFiles(BANNER_PATH);
    await page.waitForTimeout(4000);

    const bDoneBtns = page.locator('button:has-text("Done")');
    const bCount = await bDoneBtns.count();
    for (let i = 0; i < bCount; i++) {
      if (await bDoneBtns.nth(i).isVisible()) {
        console.log(`Clicking Banner Done button ${i}...`);
        await bDoneBtns.nth(i).click({ force: true });
        await page.waitForTimeout(3000);
        break;
      }
    }
  }

  // 5. Update Bengali Description schedule
  console.log('Updating Bengali Description...');
  const descDiv = page.locator('#description-textbox #textbox').first();
  if (await descDiv.count() > 0) {
    await descDiv.scrollIntoViewIfNeeded();
    await page.evaluate((text) => {
      const el = document.querySelector('#description-textbox #textbox');
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, DESCRIPTION_BN);
    await page.waitForTimeout(1000);
  }

  // 6. Publish
  console.log('Publishing Channel 2 changes...');
  const pubBtn = page.locator('#publish-button button, #publish-button').first();
  if (await pubBtn.isEnabled().catch(() => false)) {
    await pubBtn.click({ force: true });
    console.log('Clicked Publish for Channel 2!');
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: 'tools/c2_final_published_live.png' });
  console.log('Saved Channel 2 verification screenshot.');

  // Verify public view
  await page.goto('https://www.youtube.com/@SimpleHistoryTellerBangla', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tools/c2_public_updated_live.png' });
  console.log('Channel 2 public screenshot saved!');

  await page.close();
  process.exit(0);
})();
