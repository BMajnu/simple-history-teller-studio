const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.join(ARTIFACTS_DIR, 'history_mascot_02_torch_stone_arch_ruins.jpg');
const BANNER_PATH = path.join(ARTIFACTS_DIR, 'banner_simple_history_teller_hi.jpg');

const CHANNEL_ID = 'UCkG4y9NJQ5yCys3jxFDUOcg';

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
  console.log('=== DEPLOYING BRANDING TO CHANNEL 3 (HINDI) ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  page.on('dialog', async d => {
    console.log('Browser Dialog:', d.message());
    await d.accept().catch(() => {});
  });

  // Step 1: Switch Account on YouTube
  console.log('Navigating to youtube.com...');
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  console.log('Opening avatar menu...');
  const avatarBtn = page.locator('#avatar-btn').first();
  await avatarBtn.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("অন্য অ্যাকাউন্ট"), ytd-compact-link-renderer:has-text("अकाउंट बदलें")').first();
  if (await switchItem.isVisible().catch(() => false)) {
    console.log('Clicking Switch account...');
    await switchItem.click();
    await page.waitForTimeout(2000);

    // Look for Simple History Teller Hindi account item
    const hindiAccount = page.locator('ytd-account-item-renderer:has-text("Simple History Teller Hindi")').first();
    if (await hindiAccount.isVisible().catch(() => false)) {
      console.log('Found Simple History Teller Hindi account! Clicking...');
      await hindiAccount.click();
      await page.waitForTimeout(5000);
      console.log('Switched to Hindi account successfully.');
    } else {
      console.log('Hindi account item not found directly, scanning all account items...');
      const allItems = page.locator('ytd-account-item-renderer');
      for (let i = 0; i < await allItems.count(); i++) {
        const text = await allItems.nth(i).innerText();
        if (text.includes('Hindi') || text.includes('9811')) {
          console.log(`Found item index ${i}: ${text.replace(/\n/g, ' ')}`);
          await allItems.nth(i).click();
          await page.waitForTimeout(5000);
          break;
        }
      }
    }
  }

  // Step 2: Open Studio Profile for Channel 3
  console.log(`Navigating to Studio Profile: https://studio.youtube.com/channel/${CHANNEL_ID}/editing/profile ...`);
  await page.goto(`https://studio.youtube.com/channel/${CHANNEL_ID}/editing/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  // Clear any overlays
  await page.evaluate(() => {
    document.querySelectorAll('.cdk-overlay-container, .cdk-overlay-backdrop').forEach(el => el.remove());
  });

  // Step 3: Upload Profile Logo
  console.log('1. Setting Profile Logo for Channel 3...');
  const profileInput = page.locator('ytcp-profile-image-upload input[type="file"]').first();
  if (await profileInput.count() > 0) {
    console.log('Attaching logo file:', LOGO_PATH);
    await profileInput.setInputFiles(LOGO_PATH);
    console.log('Waiting for Profile cropper dialog...');
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
          console.log(`Clicking Done button fallback ${i}...`);
          await allDone.nth(i).click({ force: true });
          await page.waitForTimeout(3000);
          break;
        }
      }
    }
  } else {
    console.log('Warning: profileInput not found!');
  }

  // Step 4: Upload Banner
  console.log('2. Setting Banner Image for Channel 3...');
  const bannerInput = page.locator('ytcp-banner-upload input[type="file"]').first();
  if (await bannerInput.count() > 0) {
    console.log('Attaching banner file:', BANNER_PATH);
    await bannerInput.setInputFiles(BANNER_PATH);
    console.log('Waiting for Banner editor...');
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
          console.log(`Clicking Done button fallback ${i}...`);
          await allDone.nth(i).click({ force: true });
          await page.waitForTimeout(3000);
          break;
        }
      }
    }
  } else {
    console.log('Warning: bannerInput not found!');
  }

  // Step 5: Update Hindi Description
  console.log('3. Updating Hindi Description text...');
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
    await page.waitForTimeout(1500);
    console.log('Description set successfully.');
  }

  // Step 6: Publish
  console.log('4. Publishing changes to Channel 3...');
  const pubBtn = page.locator('#publish-button button, #publish-button').first();
  const isEnabled = await pubBtn.isEnabled().catch(() => false);
  console.log('Publish button enabled:', isEnabled);
  if (isEnabled) {
    await pubBtn.click({ force: true });
    console.log('Clicked Publish! Waiting 10s for YouTube to save and apply...');
    await page.waitForTimeout(10000);
  }

  await page.screenshot({ path: 'tools/c3_direct_published.png' });
  console.log('Saved Channel 3 Studio screenshot to tools/c3_direct_published.png');

  // Step 7: Verify Public Channel
  console.log('Navigating to public channel: https://www.youtube.com/@SimpleHistoryTellerHindi ...');
  await page.goto('https://www.youtube.com/@SimpleHistoryTellerHindi', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'tools/c3_public_updated_live.png' });
  console.log('Saved Channel 3 public screenshot to tools/c3_public_updated_live.png');

  await page.close();
  console.log('=== CHANNEL 3 BRANDING COMPLETE ===');
  process.exit(0);
})();
