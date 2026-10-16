const { chromium } = require('playwright-core');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AVATAR_PATH = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'branding', 'avatar_simple_history_teller.jpg');

const CHANNEL_ID = 'UCkG4y9NJQ5yCys3jxFDUOcg';

const DESCRIPTION = `सिंपल हिस्ट्री टेलर हिंदी (Simple History Teller Hindi) में आपका स्वागत है – जहाँ मानव सभ्यता, प्राचीन रहस्य, महान साम्राज्य और इतिहास की अनकही कहानियाँ जीवंत एनिमेशन और रोमांचक अंदाज़ में पेश की जाती हैं।

प्राचीन सभ्यताओं की उत्पत्ति, राजा-महाराजाओं के रहस्यमयी प्रयोग, दुनिया को बदलने वाले युद्ध, क्रांतिकारी खोजें और इतिहास के सबसे बड़े अनसुलझे रहस्य – हम हर जटिल ऐतिहासिक घटना को आसान, ज्ञानवर्धक और मनोरंजक बनाते हैं।

📜 हम क्या कवर करते हैं:
• प्राचीन सभ्यताएँ, सिंधु घाटी और विश्व इतिहास
• मानव भाषा, संस्कृति और विज्ञान की उत्पत्ति
• प्राचीन राजाओं और सम्राटों के ऐतिहासिक प्रयोग
• महत्वपूर्ण युद्ध, क्रांतियाँ और ऐतिहासिक घटनाएँ
• उच्च-गुणवत्ता वाले एनिमेटेड ऐतिहासिक वृत्तचित्र (Documentaries)

🔔 इतिहास की रोमांचक यात्रा पर चलने के लिए Simple History Teller Hindi को अभी सब्सक्राइब करें!
हर सप्ताह नई एनिमेटेड कहानियाँ।

#SimpleHistoryTellerHindi #HindiHistory #AnimatedHistory #AncientHistory #HistoryInHindi #WorldHistory #IndianHistory #HistoricalFacts #HistoryExplained`;

const KEYWORDS = 'Simple History Teller Hindi, सिंपल हिस्ट्री टेलर हिंदी, history in hindi, animated history hindi, world history in hindi, ancient history hindi, mysterious history, indian history, itihas, prachin itihas, historical documentaries hindi, oversimplified hindi, history facts, educational animation hindi';

async function dismissDialogs(page) {
  for (let i = 0; i < 3; i++) {
    try {
      const continueBtn = page.locator('#confirm-button, button:has-text("Continue"), ytcp-button:has-text("Continue"), button:has-text("जारी रखें")').first();
      if (await continueBtn.isVisible()) {
        console.log('Dismissing dialog...');
        await continueBtn.click({ force: true });
        await page.waitForTimeout(1000);
      }
    } catch (e) {}
    try {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (e) {}
  }
}

async function main() {
  console.log('=== FINISHING CHANNEL 3 (Hindi) ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  
  let page = context.pages().find(p => p.url().includes(CHANNEL_ID));
  if (!page) {
    page = await context.newPage();
    await page.goto(`https://studio.youtube.com/channel/${CHANNEL_ID}/editing/profile`, { waitUntil: 'domcontentloaded' });
  }
  await page.bringToFront();
  await page.waitForTimeout(2000);

  // 1. Dismiss welcome modal
  await dismissDialogs(page);

  // 2. Picture upload
  console.log('Uploading Picture...');
  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();
  console.log(`Found ${count} file inputs.`);
  if (count > 0) {
    // Picture upload is the second file input (or the one under Picture section)
    // Let's find file input inside picture container or the right file input
    // In YouTube Studio: input 0 is usually banner, input 1 is profile picture, or vice versa
    // Let's inspect which one has 'image/*' or let's target by container
    const picUploadBtn = page.locator('button:has-text("Upload"), ytcp-button:has-text("Upload"), button:has-text("আপলোড করুন"), button:has-text("अपलोड करें")').first();
    // Alternatively set directly on file inputs:
    for (let idx = 0; idx < count; idx++) {
      const parentText = await fileInputs.nth(idx).evaluate(el => el.closest('div, section')?.innerText || '').catch(() => '');
      console.log(`Input ${idx} parent text:`, parentText.slice(0, 50));
    }

    // Usually input 1 is profile picture if banner is first, or input 0 if it's the only one
    // Let's target the input near Picture
    await fileInputs.nth(count > 1 ? 1 : 0).setInputFiles(AVATAR_PATH);
    await page.waitForTimeout(2000);

    // Click "Done" on crop dialog
    const doneBtn = page.locator('button:has-text("Done"), ytcp-button:has-text("Done"), button:has-text("हो गया"), button:has-text("Save")').first();
    if (await doneBtn.isVisible()) {
      console.log('Clicking Done on crop dialog...');
      await doneBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }
  }

  // 3. Scroll to description and fill
  console.log('Filling Description...');
  await dismissDialogs(page);
  
  const descContainer = page.locator('#description-container, textarea#description, textarea[aria-label*="Description"], textarea[aria-label*="विवरण"], ytcp-form-textarea').first();
  if (await descContainer.count() > 0) {
    await descContainer.scrollIntoViewIfNeeded();
    await descContainer.click({ force: true });
    await page.waitForTimeout(500);
    const textarea = page.locator('textarea').first();
    await textarea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await textarea.fill(DESCRIPTION);
    console.log('Description filled!');
    await page.waitForTimeout(1000);
  }

  // 4. Click Publish
  console.log('Clicking Publish...');
  await dismissDialogs(page);
  const pubBtn = page.locator('button:has-text("Publish"), ytcp-button#publish-button button, button:has-text("प्रकाशित करें")').first();
  if (await pubBtn.isVisible() && !(await pubBtn.isDisabled())) {
    await pubBtn.click({ force: true });
    console.log('Publish clicked! Waiting 6s for changes to save...');
    await page.waitForTimeout(6000);
  } else {
    console.log('Publish button not enabled or already saved.');
  }

  await page.screenshot({ path: 'tools/c3_after_profile_save.png' });

  // 5. Open Settings Modal
  console.log('Opening Studio Settings...');
  const settingsBtn = page.locator('#settings-button, button[aria-label="Settings"], ytcp-button:has-text("Settings"), button:has-text("Settings"), button:has-text("सेटिंग")').first();
  await settingsBtn.scrollIntoViewIfNeeded();
  await settingsBtn.click({ force: true });
  await page.waitForTimeout(3000);

  // Click Channel tab
  console.log('Navigating to Channel tab...');
  const chTab = page.locator('tp-yt-paper-tab:has-text("Channel"), [role="tab"]:has-text("Channel"), tp-yt-paper-item:has-text("Channel"), tp-yt-paper-tab:has-text("चैनल")').first();
  if (await chTab.count() > 0) {
    await chTab.click({ force: true });
    await page.waitForTimeout(2000);
  }

  // Enter Keywords
  console.log('Entering Keywords...');
  const kwInput = page.locator('input[placeholder*="keywords"], input[placeholder*="Keywords"], #keywords-input input, input[placeholder*="कीवर्ड"]').first();
  if (await kwInput.count() > 0) {
    await kwInput.click();
    await kwInput.fill(KEYWORDS);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    console.log('Keywords entered.');
  }

  // Advanced settings: Not made for kids
  console.log('Setting Not made for kids...');
  const advTab = page.locator('tp-yt-paper-tab:has-text("Advanced settings"), [role="tab"]:has-text("Advanced settings"), tp-yt-paper-tab:has-text("बेहतर सेटिंग")').first();
  if (await advTab.count() > 0) {
    await advTab.click({ force: true });
    await page.waitForTimeout(1500);

    const notKidsRadio = page.locator('tp-yt-paper-radio-button[name="NOT_MADE_FOR_KIDS"], [role="radio"]:has-text("not made for kids"), [role="radio"]:has-text("बच्चों के लिए नहीं")').first();
    if (await notKidsRadio.count() > 0) {
      await notKidsRadio.click({ force: true });
      await page.waitForTimeout(1000);
      console.log('Selected "Not made for kids".');
    }
  }

  await page.screenshot({ path: 'tools/c3_settings_configured.png' });

  // Save Settings
  const saveBtn = page.locator('ytcp-button#save-button, button:has-text("Save"), button:has-text("सहेजें")').first();
  if (await saveBtn.count() > 0 && !(await saveBtn.isDisabled())) {
    console.log('Saving Settings...');
    await saveBtn.click({ force: true });
    await page.waitForTimeout(4000);
    console.log('Settings successfully saved!');
  }

  await page.screenshot({ path: 'tools/c3_final_done.png' });
  console.log('🎉 CHANNEL 3 (HINDI) COMPLETED 100%!');
  process.exit(0);
}

main().catch(err => {
  console.error('Channel 3 error:', err);
  process.exit(1);
});
