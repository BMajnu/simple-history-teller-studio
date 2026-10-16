const { chromium } = require('playwright-core');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AVATAR_PATH = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'branding', 'avatar_simple_history_teller.jpg');
const CHANNEL_ID = 'UCkG4y9NJQ5yCys3jxFDUOcg';

const DESCRIPTION = `सिंपल हिस्ट्री टेलर हिंदी (Simple History Teller Hindi) में आपका स्वागत है! 🏛️✨

मानव सभ्यता, प्राचीन रहस्य, महान साम्राज्य और इतिहास की अनकही कहानियों को जीवंत एनिमेशन और रोमांचक अंदाज़ में पेश करना ही हमारा उद्देश्य है।

प्राचीन सभ्यताओं की शुरुआत, पहली भाषा की खोज, राजा-महाराजाओं के रहस्यमयी प्रयोग, दुनिया को बदलने वाले युद्ध और इतिहास के सबसे बड़े अनसुलझे रहस्य – हम हर जटिल घटना को आसान, ज्ञानवर्धक और मनोरंजक बनाते हैं।

📜 हम क्या कवर करते हैं:
• प्राचीन सभ्यताएँ और पुरातात्विक रहस्य
• मानव भाषा, संस्कृति और विज्ञान की उत्पत्ति
• प्राचीन राजाओं और सम्राटों के ऐतिहासिक प्रयोग
• निर्णायक युद्ध, क्रांतियाँ और ऐतिहासिक खोजें
• उच्च-गुणवत्ता वाले एनिमेटेड ऐतिहासिक वृत्तचित्र

⏰ हर हफ्ते नए एनिमेटेड वीडियो!
📩 बिजनेस: bmajnu9811@gmail.com

🔔 अभी सब्सक्राइब करें और इतिहास की रोमांचक यात्रा पर चलें!

#SimpleHistoryTellerHindi #HindiHistory #AnimatedHistory #AncientHistory #WorldHistory #IndianHistory #Itihas`;

console.log('Hindi Description length:', DESCRIPTION.length);

const SOCIAL_LINKS = [
  { title: 'Facebook', url: 'https://facebook.com/SimpleHistoryTellerHindi' },
  { title: 'Instagram', url: 'https://instagram.com/SimpleHistoryTellerHindi' },
  { title: 'X (Twitter)', url: 'https://x.com/SimpleHistoryHI' },
  { title: 'TikTok', url: 'https://tiktok.com/@SimpleHistoryHindi' }
];

const CONTACT_EMAIL = 'bmajnu9811@gmail.com';

async function dismissDialogs(page) {
  for (let i = 0; i < 3; i++) {
    try {
      const continueBtn = page.locator('#confirm-button, button:has-text("Continue"), ytcp-button:has-text("Continue"), button:has-text("जारी रखें")').first();
      if (await continueBtn.isVisible()) {
        await continueBtn.click({ force: true });
        await page.waitForTimeout(1000);
      }
    } catch (e) {}
    try {
      await page.keyboard.press('Escape');
    } catch (e) {}
    await page.waitForTimeout(500);
  }
}

async function main() {
  console.log('=== UPDATING CHANNEL 3 (Hindi): Production Description, Social Links, Email ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = await context.newPage();

  page.on('dialog', async d => {
    console.log('Accepting dialog:', d.message());
    await d.accept().catch(() => {});
  });

  // 1. Switch to bmajnu9811@gmail.com on YouTube
  console.log('Switching account to bmajnu9811@gmail.com...');
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const avatarBtn = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatarBtn.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("अन्य অ্যাকাউন্ট ব্যবহার"), ytd-compact-link-renderer:has-text("अकाउंट बदलें")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  const section = page.locator('ytd-account-item-section-renderer').filter({ hasText: 'bmajnu9811@gmail.com' }).first();
  if (await section.count() > 0) {
    const item = section.locator('ytd-account-item-renderer, #channel-title, yt-formatted-string#channel-title').first();
    await item.click();
    await page.waitForTimeout(4000);
  } else {
    const directItem = page.locator('ytd-account-item-renderer:has-text("bmajnu9811@gmail.com")').first();
    if (await directItem.count() > 0) {
      await directItem.click();
      await page.waitForTimeout(4000);
    }
  }

  // 2. Open Customization Profile
  console.log('Navigating to Channel 3 Customization...');
  await page.goto(`https://studio.youtube.com/channel/${CHANNEL_ID}/editing/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  await dismissDialogs(page);

  // 3. Set Description
  console.log('Inserting Hindi Description...');
  const descDiv = page.locator('#description-textbox #textbox').first();
  await descDiv.scrollIntoViewIfNeeded();
  await descDiv.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(300);

  await page.evaluate((text) => {
    const el = document.querySelector('#description-textbox #textbox');
    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    document.execCommand('insertText', false, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, DESCRIPTION);
  console.log('Hindi Description inserted!');
  await page.waitForTimeout(1000);

  // 4. Set Social Links
  console.log('Setting Social Links...');
  const addLinkBtn = page.locator('button.YtcpChannelLinksAddLinkButton, button:has-text("Add link"), button:has-text("लिंक जोड़ें")').first();
  await addLinkBtn.scrollIntoViewIfNeeded();

  for (let i = 0; i < SOCIAL_LINKS.length; i++) {
    const link = SOCIAL_LINKS[i];
    const titleInputs = page.locator('input.ytcpChannelLinkItemTitleInput');
    const existingCount = await titleInputs.count();
    
    if (existingCount <= i) {
      console.log(`Clicking Add link for #${i + 1} (${link.title})...`);
      await addLinkBtn.scrollIntoViewIfNeeded();
      await addLinkBtn.click({ force: true });
      await page.waitForTimeout(800);
    }

    const currentTitleInput = page.locator('input.ytcpChannelLinkItemTitleInput').nth(i);
    await currentTitleInput.scrollIntoViewIfNeeded();
    await currentTitleInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await currentTitleInput.fill(link.title);

    const currentUrlInput = page.locator('input[placeholder="Enter a URL"], input[placeholder="कोई यूआरएल डालें"]').nth(i);
    await currentUrlInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await currentUrlInput.fill(link.url);
    console.log(`Link ${i + 1} set: ${link.title} -> ${link.url}`);
    await page.waitForTimeout(300);
  }

  // 5. Contact Email
  console.log('Setting Contact Email...');
  const emailInput = page.locator('input[placeholder="Email address"], input[placeholder="ईमेल पता"], #business-email input').first();
  if (await emailInput.count() > 0) {
    await emailInput.scrollIntoViewIfNeeded();
    await emailInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await emailInput.fill(CONTACT_EMAIL);
    console.log(`Contact email set to ${CONTACT_EMAIL}`);
    await page.waitForTimeout(500);
  }

  // 6. Video Watermark
  console.log('Setting Video Watermark...');
  const watermarkFileInput = page.locator('input.style-scope.ytcp-video-watermark-upload, input[type="file"]').nth(2);
  if (await watermarkFileInput.count() > 0) {
    await watermarkFileInput.setInputFiles(AVATAR_PATH);
    await page.waitForTimeout(2000);

    const doneBtn = page.getByRole('button', { name: 'Done' }).or(page.locator('button:has-text("Done"), button:has-text("हो गया")')).first();
    if (await doneBtn.isVisible()) {
      await doneBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }

    const entireVideoRadio = page.locator('tp-yt-paper-radio-button[name="ENTIRE_VIDEO"], tp-yt-paper-radio-button:has-text("Entire video"), tp-yt-paper-radio-button:has-text("पूरा वीडियो")').first();
    if (await entireVideoRadio.count() > 0) {
      await entireVideoRadio.click({ force: true });
    }
  }

  await page.screenshot({ path: 'tools/c3_pre_publish_fixed.png' });

  // 7. Publish
  console.log('Publishing Channel 3...');
  const pubBtn = page.getByRole('button', { name: 'Publish' }).or(page.locator('button:has-text("Publish"), button:has-text("प्रकाशित करें")')).first();
  const isDisabled = await pubBtn.isDisabled();
  console.log('Publish button disabled:', isDisabled);
  if (!isDisabled) {
    await pubBtn.click();
    console.log('Clicked Publish! Waiting 6s...');
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: 'tools/c3_published_success.png' });
  console.log('🎉 CHANNEL 3 PRODUCTION SETUP SAVED!');
  await page.close();
  process.exit(0);
}

main().catch(err => {
  console.error('Channel 3 update error:', err);
  process.exit(1);
});
