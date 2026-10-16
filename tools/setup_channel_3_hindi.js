const { chromium } = require('playwright-core');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AVATAR_PATH = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'branding', 'avatar_simple_history_teller.jpg');

const CHANNEL_ID = 'UCkG4y9NJQ5yCys3jxFDUOcg';
const CHANNEL_NAME = 'Simple History Teller Hindi';
const HANDLE = 'SimpleHistoryTellerHindi';

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

async function main() {
  console.log('=== SETTING UP CHANNEL 3: Simple History Teller Hindi ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  
  // Find or create Studio page for Channel 3
  let page = context.pages().find(p => p.url().includes(CHANNEL_ID));
  if (!page) {
    page = await context.newPage();
  }
  await page.bringToFront();

  // Handle any alert / dialog automatically
  page.on('dialog', async d => {
    console.log('Accepting dialog:', d.message());
    await d.accept().catch(() => {});
  });

  // Navigate to customization basic info
  console.log('Navigating to Customization Basic Info...');
  await page.goto(`https://studio.youtube.com/channel/${CHANNEL_ID}/editing/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Dismiss overlays
  try {
    const continueBtn = page.locator('button:has-text("Continue"), ytcp-button:has-text("Continue"), button:has-text("जारी रखें")').first();
    if (await continueBtn.count() > 0 && await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {}

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'tools/c3_step1_profile.png' });
  console.log('Step 1 screenshot saved.');

  // Check / set Handle if needed
  try {
    const handleBox = page.locator('input[aria-label*="Handle"], input[aria-label*="হ্যান্ডেল"], input[aria-label*="हैंडल"], #handle-input input').first();
    if (await handleBox.count() > 0) {
      const curHandle = await handleBox.inputValue().catch(() => '');
      console.log('Current handle value:', curHandle);
      if (!curHandle.includes(HANDLE)) {
        console.log('Setting handle to:', HANDLE);
        await handleBox.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        await handleBox.fill(HANDLE);
        await page.waitForTimeout(1000);
      }
    }
  } catch (e) {
    console.error('Handle error:', e.message);
  }

  // Scroll down to find Description
  console.log('Finding description textarea...');
  try {
    const descBox = page.locator('textarea#description, #description-textarea, textarea[aria-label*="Description"], textarea[aria-label*="विवरण"], textarea').first();
    if (await descBox.count() > 0) {
      await descBox.scrollIntoViewIfNeeded();
      await descBox.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await descBox.fill(DESCRIPTION);
      console.log('Description filled successfully!');
      await page.waitForTimeout(1000);
    } else {
      console.log('Desc box not found directly, clicking description container...');
      const descContainer = page.locator('#description-container, ytcp-form-textarea').first();
      if (await descContainer.count() > 0) {
        await descContainer.scrollIntoViewIfNeeded();
        await descContainer.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.type(DESCRIPTION);
      }
    }
  } catch (e) {
    console.error('Description fill error:', e.message);
  }

  // Publish profile changes
  console.log('Publishing profile changes...');
  const pubBtn = page.locator('ytcp-button#publish-button, button:has-text("Publish"), button:has-text("प्रकाशित करें")').first();
  if (await pubBtn.count() > 0 && !(await pubBtn.isDisabled())) {
    await pubBtn.click();
    console.log('Clicked Publish!');
    await page.waitForTimeout(5000);
  }

  await page.screenshot({ path: 'tools/c3_step2_profile_published.png' });

  // Now Branding tab (Avatar & Banner)
  console.log('Going to Branding tab...');
  const brandingTab = page.locator('tp-yt-paper-tab:has-text("Branding"), div:has-text("ब्रैंडिंग"), paper-tab:has-text("Branding")').first();
  if (await brandingTab.count() > 0) {
    await brandingTab.click();
    await page.waitForTimeout(3000);
  } else {
    await page.goto(`https://studio.youtube.com/channel/${CHANNEL_ID}/editing/images`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: 'tools/c3_step3_branding.png' });

  // Upload Avatar
  console.log('Looking for Avatar file input...');
  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();
  console.log('Found file inputs count:', count);
  if (count > 0) {
    console.log('Uploading avatar to first file input...');
    await fileInputs.first().setInputFiles(AVATAR_PATH);
    await page.waitForTimeout(2500);

    // Click "Done" or "Save" on crop dialog
    const doneBtn = page.locator('button:has-text("Done"), ytcp-button:has-text("Done"), button:has-text("हो गया"), button:has-text("Save")').first();
    if (await doneBtn.count() > 0 && await doneBtn.isVisible()) {
      console.log('Clicking Done on crop dialog...');
      await doneBtn.click();
      await page.waitForTimeout(2000);
    }

    // Publish branding
    const pubBranding = page.locator('ytcp-button#publish-button, button:has-text("Publish"), button:has-text("प्रकाशित करें")').first();
    if (await pubBranding.count() > 0 && !(await pubBranding.isDisabled())) {
      await pubBranding.click();
      console.log('Published avatar branding!');
      await page.waitForTimeout(5000);
    }
  }

  await page.screenshot({ path: 'tools/c3_step4_avatar_published.png' });

  // Now Settings Modal: Keywords & Not Made for Kids
  console.log('Opening Studio Settings...');
  const settingsBtn = page.locator('#settings-button, button[aria-label="Settings"], button:has-text("Settings"), button:has-text("सेटिंग")').first();
  if (await settingsBtn.count() > 0) {
    await settingsBtn.click();
    await page.waitForTimeout(3500);
    await page.screenshot({ path: 'tools/c3_step5_settings_open.png' });

    // Click Channel tab
    const chTab = page.locator('paper-tab:has-text("Channel"), [role="tab"]:has-text("Channel"), tp-yt-paper-tab:has-text("Channel"), tp-yt-paper-item:has-text("Channel"), paper-item:has-text("Channel"), tp-yt-paper-tab:has-text("चैनल")').first();
    if (await chTab.count() > 0) {
      console.log('Clicking Channel tab in settings...');
      await chTab.click();
      await page.waitForTimeout(2000);
    }

    // Fill Keywords
    console.log('Entering Keywords...');
    const kwInput = page.locator('input[placeholder*="keywords"], input[placeholder*="Keywords"], #keywords-input input, input[placeholder*="कीवर्ड"]').first();
    if (await kwInput.count() > 0) {
      await kwInput.click();
      await kwInput.fill(KEYWORDS);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      console.log('Keywords entered.');
    } else {
      console.log('Keywords input not found directly.');
    }

    // Advanced settings: Not Made For Kids
    console.log('Going to Advanced Settings tab...');
    const advTab = page.locator('paper-tab:has-text("Advanced settings"), [role="tab"]:has-text("Advanced settings"), tp-yt-paper-tab:has-text("Advanced settings"), tp-yt-paper-tab:has-text("बेहतर सेटिंग")').first();
    if (await advTab.count() > 0) {
      await advTab.click();
      await page.waitForTimeout(1500);

      const notKidsRadio = page.locator('tp-yt-paper-radio-button[name="NOT_MADE_FOR_KIDS"], [role="radio"]:has-text("not made for kids"), [role="radio"]:has-text("बच्चों के लिए नहीं")').first();
      if (await notKidsRadio.count() > 0) {
        console.log('Selecting "Not made for kids"...');
        await notKidsRadio.click();
        await page.waitForTimeout(1000);
      }
    }

    await page.screenshot({ path: 'tools/c3_step6_settings_filled.png' });

    // Click Save
    const saveBtn = page.locator('ytcp-button#save-button, button:has-text("Save"), button:has-text("सहेजें")').first();
    if (await saveBtn.count() > 0 && !(await saveBtn.isDisabled())) {
      console.log('Clicking Save button in Settings...');
      await saveBtn.click();
      await page.waitForTimeout(4000);
      console.log('Settings saved!');
    }
  }

  await page.screenshot({ path: 'tools/c3_complete.png' });
  console.log('🎉 CHANNEL 3: Simple History Teller Hindi FULLY CONFIGURED!');
  await browser.disconnect();
}

main().catch(e => {
  console.error('Fatal error in Channel 3 setup:', e);
  process.exit(1);
});
