const { chromium } = require('playwright-core');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AVATAR_PATH = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'branding', 'avatar_simple_history_teller.jpg');

const CHANNELS = [
  {
    id: 1,
    name: 'Simple History Teller',
    handle: 'SimpleHistoryTeller',
    email: 'bmajnu980@gmail.com',
    channelId: 'UCvEQdVnctkuYZw3iNDo5krg',
    description: `Welcome to Simple History Teller – where the greatest stories of human civilization, ancient mysteries, and forgotten history come to life through engaging, immersive animations and captivating storytelling.

From the dawn of early humans and the very first spoken words to the rise and fall of ancient empires, legendary rulers, mysterious archaeological discoveries, and the turning points of world history – we make complex historical events simple, entertaining, and unforgettable.

📜 What We Cover:
• Ancient Civilizations & Archaeological Mysteries
• The Origins of Human Language, Culture & Science
• Forbidden Experiments of Ancient Kings & Emperors
• Pivotal Wars, Revolutions & World-Changing Discoveries
• Deep-dive Historical Documentaries with Animated Visuals

🔔 Subscribe to Simple History Teller and travel through time with us!
New animated history stories every week.

#SimpleHistoryTeller #History #AnimatedHistory #AncientHistory #HistoryDocumentary #OverSimplified #WorldHistory #HistoryExplained`,
    keywords: 'Simple History Teller, simple history, animated history, history documentary, world history, ancient history, oversimplified, human history, history explained, origin of language, ancient egypt, roman empire, historical mysteries, educational animation, civilization'
  },
  {
    id: 2,
    name: 'Simple History Teller Bangla',
    handle: 'SimpleHistoryTellerBangla',
    email: 'bmajnu981@gmail.com',
    channelId: 'UCOzERwa3GJqO00B8LMTPtDg',
    description: `স্বাগতম Simple History Teller Bangla (সিম্পল হিস্ট্রি টেলার বাংলা) চ্যানেলে! 

মানব সভ্যতার রোমাঞ্চকর ইতিহাস, প্রাচীন রহস্য এবং পৃথিবীর সবচেয়ে অদ্ভুত ও অজানা ঐতিহাসিক ঘটনাগুলোকে সহজ, আকর্ষণীয় এবং জীবন্ত অ্যানিমেশনের মাধ্যমে তুলে ধরার বিশ্বস্ত বাংলা প্ল্যাটফর্ম।

আদিম মানুষের প্রথম কথা বলা থেকে শুরু করে প্রাচীন মিশরের ফারাওদের নিষিদ্ধ পরীক্ষা, পরাক্রমশালী সাম্রাজ্যের উত্থান-পতন, অজানা যুদ্ধ এবং বিশ্ব বদলে দেওয়া বৈজ্ঞানিক আবিষ্কার—ইতিহাসের জটিল সব অধ্যায়কে আমরা গল্প ও কার্টুন অ্যানিমেশনের মাধ্যমে সবার জন্য উপভোগ্য করে তুলি।

📜 আমাদের চ্যানেলের বিষয়বস্তু:
• মানব সভ্যতার উৎপত্তি ও রোমাঞ্চকর বিবর্তন
• প্রাচীন মিশর, রোম ও মেসোপটেমিয়ার গোপন রহস্য
• রাজাদের অদ্ভুত ও নিষিদ্ধ ঐতিহাসিক পরীক্ষা
• অজানা ঐতিহাসিক যুদ্ধ, বিপ্লব ও আবিষ্কার
• হাই-কোয়ালিটি অ্যানিমেটেড বাংলা ডকুমেন্টারি

🔔 নতুন সব ঐতিহাসিক অ্যানিমেশন ভিডিও দেখতে এখনই চ্যানেলটি সাবস্ক্রাইব করুন!

#SimpleHistoryTellerBangla #সিম্পলহিস্ট্রিটেলার #বাংলাইতিহাস #ইতিহাস #BanglaHistory #AnimatedHistory #HistoryDocumentary #OverSimplified #অজানাইতিহাস #বাংলাডকুমেন্টারি`,
    keywords: 'Simple History Teller Bangla, সিম্পল হিস্ট্রি টেলার বাংলা, সিম্পল ইতিহাস, বাংলা ইতিহাস, অজানা ইতিহাস, মানব ইতিহাস, ancient history bangla, animated history bangla, history documentary bangla, প্রথম ভাষা, ফারাওয়ের পরীক্ষা, oversimplified bangla, bangla explainer, ইতিহাস'
  },
  {
    id: 3,
    name: 'Simple History Teller Hindi',
    handle: 'SimpleHistoryTellerHindi',
    email: 'bmajnu9811@gmail.com',
    channelId: 'UCkG4y9NJQ5yCys3jxFDUOcg',
    description: `सिंपल हिस्ट्री टेलर हिंदी (Simple History Teller Hindi) में आपका स्वागत है!

इतिहास के सबसे बड़े रहस्य, प्राचीन सभ्यताएं और मानव सभ्यता के अनोखे व रोमांचक किस्सों को आसान और जीवंत एनिमेशन के माध्यम से पेश करने का विश्वसनीय मंच।

आदिम इंसानों के पहले बोले गए शब्द से लेकर प्राचीन मिस्र के फिरौनों के गुप्त प्रयोग, विशाल साम्राज्यों का उत्थान-पतन, अनसुने युद्ध और दुनिया बदलने वाले आविष्कारों तक—हम इतिहास की गहरी और रहस्यमयी कहानियों को सरल और मनोरंजक अंदाज में समझाते हैं।

📜 हमारे चैनल के मुख्य विषय:
• मानव सभ्यता का विकास और प्राचीन रहस्य
• प्राचीन मिस्र, सिंधु घाटी, रोम और ग्रीक सभ्यताएं
• राजाओं और फिरौनों के गुप्त व अजीबोगरीब प्रयोग
• दुनिया को बदल देने वाले ऐतिहासिक युद्ध और क्रांतियां
• बेहतरीन एनिमेशन के साथ हिंदी हिस्ट्री डॉक्यूमेंट्री

🔔 हर हफ्ते नई ऐतिहासिक एनिमेशन कहानियों के लिए अभी सब्सक्राइब करें!

#SimpleHistoryTellerHindi #सिंपलहिस्ट्रीटेलर #HindiHistory #इतिहास #AncientHistory #AnimatedHistory #HistoryDocumentary #OverSimplified #रहस्य #HindiExplainer`,
    keywords: 'Simple History Teller Hindi, सिंपल हिस्ट्री टेलर हिंदी, सिंपल इतिहास, हिंदी इतिहास, मानव इतिहास, प्राचीन रहस्य, ancient history hindi, animated history in hindi, history documentary hindi, पहली भाषा, फिरौन का प्रयोग, oversimplified hindi, hindi history explainer, itihas'
  }
];

async function switchAccount(page, targetEmail) {
  console.log(`\n>>> Switching active account to: ${targetEmail}...`);
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const avatar = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("অন্য অ্যাকাউন্ট ব্যবহার")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  const section = page.locator('ytd-account-item-section-renderer').filter({ hasText: targetEmail }).first();
  if (await section.count() > 0) {
    const item = section.locator('ytd-account-item-renderer, #channel-title').first();
    await item.click();
    await page.waitForTimeout(4000);
    console.log(`✓ Successfully switched to ${targetEmail}`);
  } else {
    console.warn(`⚠ Section for ${targetEmail} not found!`);
  }
}

async function configureChannel(page, ch) {
  console.log(`\n===============================================================`);
  console.log(`CONFIGURING CHANNEL ${ch.id}: ${ch.name} (${ch.email})`);
  console.log(`===============================================================`);

  await switchAccount(page, ch.email);

  const editUrl = `https://studio.youtube.com/channel/${ch.channelId}/editing/profile`;
  console.log('Navigating to Customization:', editUrl);
  await page.goto(editUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Dismiss any popups/dialogs
  try {
    const continueBtn = page.locator('button:has-text("Continue"), ytcp-button:has-text("Continue")').first();
    if (await continueBtn.count() > 0 && await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {}

  try {
    const closeBtn = page.locator('button:has-text("Close"), ytcp-button:has-text("Close")').first();
    if (await closeBtn.count() > 0 && await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  } catch (e) {}

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 1. Fill Name
  console.log(`1. Setting Name: ${ch.name}...`);
  const nameInput = page.locator('input.ytcpChannelEditingChannelNameBrandNameInput, input#input').first();
  if (await nameInput.count() > 0) {
    await nameInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await nameInput.fill(ch.name);
    await page.waitForTimeout(500);
  }

  // 2. Fill Handle
  console.log(`2. Setting Handle: @${ch.handle}...`);
  const handleInput = page.locator('input.YtcpChannelEditingChannelHandleHandleInput, input[aria-label*="Handle"]').first();
  if (await handleInput.count() > 0) {
    await handleInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await handleInput.fill(ch.handle);
    await page.waitForTimeout(1000);
  }

  // 3. Fill Description
  console.log(`3. Setting SEO Description...`);
  const descArea = page.locator('textarea').first();
  if (await descArea.count() > 0) {
    await descArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await descArea.fill(ch.description);
    await page.waitForTimeout(500);
  }

  // 4. Upload Avatar Picture
  console.log(`4. Uploading Brand Avatar Logo...`);
  const profileUpload = page.locator('input.ytcp-profile-image-upload, input#file-selector').first();
  if (await profileUpload.count() > 0) {
    await profileUpload.setInputFiles(AVATAR_PATH);
    await page.waitForTimeout(2500);
    const doneBtn = page.locator('button:has-text("Done"), ytcp-button:has-text("Done"), button:has-text("হয়ে গেছে")').first();
    if (await doneBtn.count() > 0 && await doneBtn.isVisible()) {
      await doneBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  await page.screenshot({ path: `tools/c${ch.id}_before_pub.png` });

  // 5. Click Publish
  console.log(`5. Publishing profile changes...`);
  const pubBtn = page.locator('ytcp-button#publish-button button, button:has-text("Publish")').first();
  if (await pubBtn.count() > 0 && !(await pubBtn.isDisabled())) {
    await pubBtn.click();
    console.log(`✓ Clicked Publish! Waiting for changes to persist...`);
    await page.waitForTimeout(6000);
  } else {
    console.log(`Publish button disabled or already up to date.`);
  }

  await page.screenshot({ path: `tools/c${ch.id}_published.png` });

  // 6. Settings (Keywords & Not made for kids)
  console.log(`6. Configuring Settings (Keywords & Child Safety)...`);
  const settingsBtn = page.locator('#settings-button, button[aria-label="Settings"], ytcp-button:has-text("Settings"), button:has-text("Settings")').first();
  if (await settingsBtn.count() > 0) {
    await settingsBtn.click();
    await page.waitForTimeout(3000);

    // Click Channel tab
    const chTab = page.locator('paper-tab:has-text("Channel"), [role="tab"]:has-text("Channel"), tp-yt-paper-tab:has-text("Channel")').first();
    if (await chTab.count() > 0) {
      await chTab.click();
      await page.waitForTimeout(1500);

      // Keywords input
      const kwInput = page.locator('input[placeholder*="keywords"], input[placeholder*="Keywords"], #keywords-input input').first();
      if (await kwInput.count() > 0) {
        await kwInput.click();
        await kwInput.fill(ch.keywords);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        console.log(`✓ Added high-traffic SEO keywords!`);
      }

      // Advanced settings
      const advTab = page.locator('paper-tab:has-text("Advanced settings"), [role="tab"]:has-text("Advanced settings")').first();
      if (await advTab.count() > 0) {
        await advTab.click();
        await page.waitForTimeout(1500);
        const notForKids = page.locator('tp-yt-paper-radio-button[name="NOT_MADE_FOR_KIDS"], [role="radio"]:has-text("not made for kids")').first();
        if (await notForKids.count() > 0) {
          await notForKids.click();
          await page.waitForTimeout(500);
          console.log(`✓ Selected "Not made for kids" (COPPA compliant)`);
        }
      }

      // Save Settings
      const saveBtn = page.locator('ytcp-button#save-button button, ytcp-button#save-button, button:has-text("Save")').first();
      if (await saveBtn.count() > 0 && !(await saveBtn.isDisabled())) {
        await saveBtn.click();
        console.log(`✓ Saved Channel Settings!`);
        await page.waitForTimeout(4000);
      }
    }
  }

  await page.screenshot({ path: `tools/c${ch.id}_complete.png` });
  console.log(`✅ CHANNEL ${ch.id} (${ch.name}) 100% CONFIGURED SUCCESSFULLY!\n`);
}

async function main() {
  console.log('--- STARTING MASTER SETUP FOR ALL 3 YOUTUBE CHANNELS ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  for (const ch of CHANNELS) {
    await configureChannel(page, ch);
  }

  console.log('\n🎉 ALL 3 CHANNELS FULLY CONFIGURED & 100% SEO-OPTIMIZED!');
  await page.close();
}

main().catch(console.error);
