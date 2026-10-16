const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.join(ARTIFACTS_DIR, 'history_mascot_02_torch_stone_arch_ruins.jpg');
const BANNER_PATH = path.join(ARTIFACTS_DIR, 'banner_simple_history_teller_hi.jpg');

const CHANNEL_ID = 'UCkG4y9NJQ5yCys3jxFDUOcg';
const EMAIL = 'bmajnu9811@gmail.com';

const DESCRIPTION_HI = `सिंपल हिस्ट्री टेलर हिंदी (Simple History Teller Hindi) में आपका स्वागत है! 🏛️✨
यहाँ विश्व इतिहास, प्राचीन सभ्यताएँ और अनसुलझे ऐतिहासिक रहस्य सजीव हो उठते हैं आकर्षक और सरल एनिमेटेड कहानियों के माध्यम से।

मानव सभ्यता की शुरुआत, भाषा की उत्पत्ति से लेकर प्राचीन राजाओं-सम्राटों के विचित्र गुप्त प्रयोग, विश्व-प्रसिद्ध युद्ध और खोए हुए साम्राज्यों के रोमांचक किस्से—सब कुछ आसान और रोचक अंदाज़ में जानिए।

📜 हमारे विषय:
• प्राचीन सभ्यताएँ, पिरामिड और पुरातात्विक खोजें
• मानव विकास और भाषाओं की उत्पत्ति
• राजाओं, रानियों और सम्राटों के अनसुने गुप्त इतिहास
• ऐतिहासिक युद्ध, क्रांतियाँ और महान आविष्कार
• एनिमेटेड हिस्ट्री डॉक्यूमेंट्रीज़

⏰ हर २ दिन में नया एपिसोड (हफ़्ते में ३ नए एपिसोड)!
📩 बिज़नेस ईमेल: bmajnu9811@gmail.com

🔔 अभी सब्सक्राइब करें और इतिहास की रोमांचक यात्रा में हमारे साथ जुड़ें!

#SimpleHistoryTellerHindi #इतिहास #HindiHistory #AncientHistory #HistoryDocumentary #OverSimplified #WorldHistory`;

(async () => {
  console.log('=== ROBUST BRANDING UPLOAD FOR CHANNEL 3 (Hindi: bmajnu9811) ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  page.on('dialog', async d => {
    console.log('Dialog:', d.message());
    await d.accept().catch(() => {});
  });

  // Switch to bmajnu9811
  console.log('Switching account to bmajnu9811...');
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const avatarBtn = page.locator('#avatar-btn').first();
  await avatarBtn.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("अन्य অ্যাকাউন্ট ব্যবহার"), ytd-compact-link-renderer:has-text("अकाउंट बदलें")').first();
  if (await switchItem.isVisible().catch(() => false)) {
    await switchItem.click();
    await page.waitForTimeout(2000);
    const item = page.locator(`ytd-account-item-renderer:has-text("${EMAIL}")`).first();
    if (await item.count() > 0) {
      await item.click();
      await page.waitForTimeout(4000);
    }
  }

  // Open Channel 3 Studio Profile
  console.log('Navigating to Channel 3 Studio Profile...');
  await page.goto(`https://studio.youtube.com/channel/${CHANNEL_ID}/editing/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Clear overlays
  await page.evaluate(() => {
    document.querySelectorAll('.cdk-overlay-container, .cdk-overlay-backdrop').forEach(el => el.remove());
  });

  // 1. Upload Logo
  console.log('1. Setting Profile Logo for Channel 3...');
  const profileInput = page.locator('ytcp-profile-image-upload input[type="file"]').first();
  if (await profileInput.count() > 0) {
    await profileInput.setInputFiles(LOGO_PATH);
    console.log('Waiting for Profile crop dialog...');
    await page.waitForSelector('ytcp-image-cropper, ytcp-dialog', { timeout: 15000 }).catch(() => console.log('Cropper selector timeout'));
    await page.waitForTimeout(2000);

    const pDone = page.locator('ytcp-dialog #done-button button, ytcp-image-cropper #done-button button, #done-button button, #done-button').first();
    if (await pDone.isVisible().catch(() => false)) {
      console.log('Clicking Done on Profile modal...');
      await pDone.click({ force: true });
      await page.waitForTimeout(3000);
    } else {
      const allDone = page.locator('button:has-text("Done")');
      for (let i = 0; i < await allDone.count(); i++) {
        if (await allDone.nth(i).isVisible()) {
          await allDone.nth(i).click({ force: true });
          await page.waitForTimeout(3000);
          break;
        }
      }
    }
  }

  // 2. Upload Banner
  console.log('2. Setting Banner Image for Channel 3...');
  const bannerInput = page.locator('ytcp-banner-upload input[type="file"]').first();
  if (await bannerInput.count() > 0) {
    await bannerInput.setInputFiles(BANNER_PATH);
    console.log('Waiting for Banner crop editor...');
    await page.waitForSelector('ytcp-banner-editor', { timeout: 15000 }).catch(() => console.log('Banner editor timeout'));
    await page.waitForTimeout(2000);

    const bDone = page.locator('ytcp-banner-editor #done-button button, ytcp-banner-editor #done-button').first();
    if (await bDone.isVisible().catch(() => false)) {
      console.log('Clicking Done on Banner modal...');
      await bDone.click({ force: true });
      await page.waitForTimeout(3000);
    } else {
      const allDone = page.locator('button:has-text("Done")');
      for (let i = 0; i < await allDone.count(); i++) {
        if (await allDone.nth(i).isVisible()) {
          await allDone.nth(i).click({ force: true });
          await page.waitForTimeout(3000);
          break;
        }
      }
    }
  }

  // 3. Update Hindi Description schedule
  console.log('Updating Hindi Description...');
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
    }, DESCRIPTION_HI);
    await page.waitForTimeout(1000);
  }

  // 4. Publish
  console.log('4. Publishing Channel 3...');
  const pubBtn = page.locator('#publish-button button, #publish-button').first();
  const isEnabled = await pubBtn.isEnabled().catch(() => false);
  console.log('Publish enabled:', isEnabled);
  if (isEnabled) {
    await pubBtn.click({ force: true });
    console.log('Clicked Publish! Waiting 8s for YouTube to save...');
    await page.waitForTimeout(8000);
  }

  await page.screenshot({ path: 'tools/c3_robust_published.png' });
  console.log('Saved Channel 3 verification screenshot.');

  // Check public view
  console.log('Verifying public channel view...');
  await page.goto('https://www.youtube.com/@SimpleHistoryTellerHindi', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tools/c3_public_updated_live.png' });
  console.log('Channel 3 public screenshot saved!');

  await page.close();
  process.exit(0);
})();
