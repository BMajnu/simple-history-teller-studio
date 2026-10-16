const { chromium } = require('playwright-core');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AVATAR_PATH = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'branding', 'avatar_simple_history_teller.jpg');

const CH_NAME = 'Simple History Teller Bangla';
const CH_HANDLE = 'SimpleHistoryTellerBangla';
const CH_EMAIL = 'bmajnu981@gmail.com';
const CH_ID = 'UCOzERwa3GJqO00B8LMTPtDg';

const CH_DESC = `স্বাগতম Simple History Teller Bangla (সিম্পল হিস্ট্রি টেলার বাংলা) চ্যানেলে! 

মানব সভ্যতার রোমাঞ্চকর ইতিহাস, প্রাচীন রহস্য এবং পৃথিবীর সবচেয়ে অদ্ভুত ও অজানা ঐতিহাসিক ঘটনাগুলোকে সহজ, আকর্ষণীয় এবং জীবন্ত অ্যানিমেশনের মাধ্যমে তুলে ধরার বিশ্বস্ত বাংলা প্ল্যাটফর্ম।

আদিম মানুষের প্রথম কথা বলা থেকে শুরু করে প্রাচীন মিশরের ফারাওদের নিষিদ্ধ পরীক্ষা, পরাক্রমশালী সাম্রাজ্যের উত্থান-পতন, অজানা যুদ্ধ এবং বিশ্ব বদলে দেওয়া বৈজ্ঞানিক আবিষ্কার—ইতিহাসের জটিল সব অধ্যায়কে আমরা গল্প ও কার্টুন অ্যানিমেশনের মাধ্যমে সবার জন্য উপভোগ্য করে তুলি।

📜 আমাদের চ্যানেলের বিষয়বস্তু:
• মানব সভ্যতার উৎপত্তি ও রোমাঞ্চকর বিবর্তন
• প্রাচীন মিশর, রোম ও মেসোপটেমিয়ার গোপন রহস্য
• রাজাদের অদ্ভুত ও নিষিদ্ধ ঐতিহাসিক পরীক্ষা
• অজানা ঐতিহাসিক যুদ্ধ, বিপ্লব ও আবিষ্কার
• হাই-কোয়ালিটি অ্যানিমেটেড বাংলা ডকুমেন্টারি

🔔 নতুন সব ঐতিহাসিক অ্যানিমেশন ভিডিও দেখতে এখনই চ্যানেলটি সাবস্ক্রাইব করুন!

#SimpleHistoryTellerBangla #সিম্পলহিস্ট্রিটেলার #বাংলাইতিহাস #ইতিহাস #BanglaHistory #AnimatedHistory #HistoryDocumentary #OverSimplified #অজানাইতিহাস #বাংলাডকুমেন্টারি`;

const CH_KEYWORDS = 'Simple History Teller Bangla, সিম্পল হিস্ট্রি টেলার বাংলা, সিম্পল ইতিহাস, বাংলা ইতিহাস, অজানা ইতিহাস, মানব ইতিহাস, ancient history bangla, animated history bangla, history documentary bangla, প্রথম ভাষা, ফারাওয়ের পরীক্ষা, oversimplified bangla, bangla explainer, ইতিহাস';

async function main() {
  console.log('--- CONFIGURING CHANNEL 2: Simple History Teller Bangla ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  page.on('dialog', async d => {
    console.log('Dialog:', d.message());
    await d.accept().catch(() => {});
  });

  // 1. Switch to bmajnu981@gmail.com
  console.log('Switching to bmajnu981@gmail.com...');
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const avatar = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("অন্য অ্যাকাউন্ট ব্যবহার")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  const section = page.locator('ytd-account-item-section-renderer').filter({ hasText: CH_EMAIL }).first();
  if (await section.count() > 0) {
    const item = section.locator('ytd-account-item-renderer, #channel-title').first();
    await item.click();
    await page.waitForTimeout(4000);
    console.log('Switched to', CH_EMAIL);
  }

  // 2. Go to Customization page
  const editUrl = `https://studio.youtube.com/channel/${CH_ID}/editing/profile`;
  console.log('Navigating to Customization:', editUrl);
  await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Dismiss overlays
  try {
    const cont = page.locator('button:has-text("Continue"), ytcp-button:has-text("Continue")').first();
    if (await cont.count() > 0 && await cont.isVisible()) {
      await cont.click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {}

  await page.keyboard.press('Escape');

  // Fill Handle
  console.log('Filling Handle:', CH_HANDLE);
  const handleInput = page.locator('input.YtcpChannelEditingChannelHandleHandleInput, input[placeholder*="handle"]').first();
  if (await handleInput.count() > 0) {
    await handleInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await handleInput.pressSequentially(CH_HANDLE, { delay: 20 });
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1000);
  }

  // Fill Description
  console.log('Filling Description...');
  const descArea = page.locator('textarea').first();
  if (await descArea.count() > 0) {
    await descArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await descArea.fill(CH_DESC);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(1000);
  }

  // Upload Picture
  console.log('Uploading Picture...');
  const picInput = page.locator('input.ytcp-profile-image-upload#file-selector, input[type="file"]').nth(1);
  if (await picInput.count() > 0) {
    await picInput.setInputFiles(AVATAR_PATH);
    await page.waitForTimeout(3000);
    const doneBtn = page.locator('button:has-text("Done"), ytcp-button:has-text("Done"), button:has-text("Save")').first();
    if (await doneBtn.count() > 0 && await doneBtn.isVisible()) {
      await doneBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  await page.screenshot({ path: 'tools/c2_ready_to_publish.png' });

  // Click Publish
  console.log('Clicking Publish...');
  const pubBtn = page.locator('ytcp-button#publish-button, button:has-text("Publish")').first();
  if (await pubBtn.count() > 0 && !(await pubBtn.isDisabled())) {
    await pubBtn.click();
    console.log('✓ Clicked Publish!');
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: 'tools/c2_published.png' });

  // 3. Settings (Keywords & Not made for kids)
  console.log('Opening Settings...');
  const settingsBtn = page.locator('#settings-button, button[aria-label="Settings"], ytcp-button:has-text("Settings"), button:has-text("Settings")').first();
  if (await settingsBtn.count() > 0) {
    await settingsBtn.click();
    await page.waitForTimeout(3000);

    const chTab = page.locator('paper-tab:has-text("Channel"), [role="tab"]:has-text("Channel"), tp-yt-paper-tab:has-text("Channel")').first();
    if (await chTab.count() > 0) {
      await chTab.click();
      await page.waitForTimeout(1500);

      // Keywords input
      console.log('Entering Keywords...');
      const kwInput = page.locator('input[placeholder*="keywords"], input[placeholder*="Keywords"], #keywords-input input').first();
      if (await kwInput.count() > 0) {
        await kwInput.click();
        await kwInput.fill(CH_KEYWORDS);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
      }

      // Advanced settings
      console.log('Setting Not made for kids...');
      const advTab = page.locator('paper-tab:has-text("Advanced settings"), [role="tab"]:has-text("Advanced settings")').first();
      if (await advTab.count() > 0) {
        await advTab.click();
        await page.waitForTimeout(1500);
        const notForKids = page.locator('tp-yt-paper-radio-button[name="NOT_MADE_FOR_KIDS"], [role="radio"]:has-text("not made for kids")').first();
        if (await notForKids.count() > 0) {
          await notForKids.click();
          await page.waitForTimeout(500);
        }
      }

      // Save
      const saveBtn = page.locator('ytcp-button#save-button button, ytcp-button#save-button, button:has-text("Save")').first();
      if (await saveBtn.count() > 0 && !(await saveBtn.isDisabled())) {
        await saveBtn.click();
        console.log('✓ Saved Channel Settings!');
        await page.waitForTimeout(4000);
      }
    }
  }

  await page.screenshot({ path: 'tools/c2_final_complete.png' });
  console.log('🎉 CHANNEL 2: Simple History Teller Bangla FULLY CONFIGURED!');
  await page.close();
}

main().catch(console.error);
