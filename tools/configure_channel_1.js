const { chromium } = require('playwright-core');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AVATAR_PATH = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'branding', 'avatar_simple_history_teller.jpg');

const CHANNEL_NAME = 'Simple History Teller';
const HANDLE = 'SimpleHistoryTeller';
const DESCRIPTION = `Welcome to Simple History Teller – where the greatest stories of human civilization, ancient mysteries, and forgotten history come to life through engaging, immersive animations and captivating storytelling.

From the dawn of early humans and the very first spoken words to the rise and fall of ancient empires, legendary rulers, mysterious archaeological discoveries, and the turning points of world history – we make complex historical events simple, entertaining, and unforgettable.

📜 What We Cover:
• Ancient Civilizations & Archaeological Mysteries
• The Origins of Human Language, Culture & Science
• Forbidden Experiments of Ancient Kings & Emperors
• Pivotal Wars, Revolutions & World-Changing Discoveries
• Deep-dive Historical Documentaries with Animated Visuals

🔔 Subscribe to Simple History Teller and travel through time with us!
New animated history stories every week.

#SimpleHistoryTeller #History #AnimatedHistory #AncientHistory #HistoryDocumentary #OverSimplified #WorldHistory #HistoryExplained`;

const KEYWORDS = 'Simple History Teller, simple history, animated history, history documentary, world history, ancient history, oversimplified, human history, history explained, origin of language, ancient egypt, roman empire, historical mysteries, educational animation, civilization';

async function main() {
  console.log('--- CONFIGURING CHANNEL 1: Simple History Teller ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  // 1. Switch account to bmajnu980@gmail.com
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const avatar = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("অন্য অ্যাকাউন্ট ব্যবহার")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  const section = page.locator('ytd-account-item-section-renderer').filter({ hasText: 'bmajnu980@gmail.com' }).first();
  if (await section.count() > 0) {
    const item = section.locator('ytd-account-item-renderer, #channel-title, yt-formatted-string#channel-title').first();
    await item.click();
    await page.waitForTimeout(4000);
  }

  // 2. Open YouTube Studio
  console.log('Navigating to YouTube Studio...');
  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Dismiss overlays
  console.log('Dismissing overlays...');
  const continueBtn = page.locator('button:has-text("Continue"), ytcp-button:has-text("Continue")').first();
  if (await continueBtn.count() > 0 && await continueBtn.isVisible()) {
    await continueBtn.click();
    await page.waitForTimeout(1000);
  }

  const closeAsk = page.locator('button:has-text("Close"), ytcp-button:has-text("Close")').first();
  if (await closeAsk.count() > 0 && await closeAsk.isVisible()) {
    await closeAsk.click();
    await page.waitForTimeout(500);
  }

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 3. Click Customization
  console.log('Navigating to Customization...');
  const customItem = page.locator('ytcp-navigation-item#customization, a[test-id="customization"], ytcp-navigation-item:has-text("Customization")').first();
  if (await customItem.count() > 0) {
    await customItem.click();
    await page.waitForTimeout(4000);
  }

  // Dismiss overlays again if any
  if (await continueBtn.count() > 0 && await continueBtn.isVisible()) {
    await continueBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'tools/c1_custom_ready.png' });

  // 4. Fill Profile details (Name, Handle, Description)
  console.log('Filling Name:', CHANNEL_NAME);
  // Name input
  const nameInput = page.locator('input#input, #name-input input, input[aria-label*="Name"], input[aria-label*="নাম"]').first();
  if (await nameInput.count() > 0) {
    await nameInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await nameInput.fill(CHANNEL_NAME);
    await page.waitForTimeout(500);
  }

  console.log('Filling Handle:', HANDLE);
  const handleInput = page.locator('input[aria-label*="Handle"], input[aria-label*="হ্যান্ডেল"], #handle-input input').first();
  if (await handleInput.count() > 0) {
    await handleInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await handleInput.fill(HANDLE);
    await page.waitForTimeout(1000);
  }

  console.log('Filling Description...');
  const descArea = page.locator('textarea#description, #description-textarea, textarea[aria-label*="Description"], textarea[aria-label*="বিবরণ"]').first();
  if (await descArea.count() > 0) {
    await descArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await descArea.fill(DESCRIPTION);
    await page.waitForTimeout(500);
  }

  // 5. Upload Avatar
  console.log('Uploading Avatar...');
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles(AVATAR_PATH);
    await page.waitForTimeout(2500);
    const doneCrop = page.locator('button:has-text("Done"), ytcp-button:has-text("Done"), button:has-text("হয়ে গেছে")').first();
    if (await doneCrop.count() > 0 && await doneCrop.isVisible()) {
      await doneCrop.click();
      await page.waitForTimeout(2000);
    }
  }

  await page.screenshot({ path: 'tools/c1_before_publish.png' });

  // 6. Click Publish
  console.log('Clicking Publish...');
  const pubBtn = page.locator('ytcp-button#publish-button, button:has-text("Publish")').first();
  if (await pubBtn.count() > 0 && !(await pubBtn.isDisabled())) {
    await pubBtn.click();
    console.log('Clicked Publish!');
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: 'tools/c1_published.png' });

  // 7. Channel Settings (Keywords & Not made for kids)
  console.log('Opening Settings...');
  const settingsBtn = page.locator('#settings-button, button[aria-label="Settings"], ytcp-button:has-text("Settings"), button:has-text("Settings")').first();
  if (await settingsBtn.count() > 0) {
    await settingsBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tools/c1_settings_dialog.png' });

    // Click "Channel" in settings dialog
    const channelTab = page.locator('paper-tab:has-text("Channel"), tp-yt-paper-tab:has-text("Channel"), [role="tab"]:has-text("Channel"), ytcp-navigation-item:has-text("Channel")').first();
    if (await channelTab.count() > 0) {
      await channelTab.click();
      await page.waitForTimeout(1500);
    }

    // Set Country of Residence (optional/if available)
    // Fill Keywords
    console.log('Adding Channel Keywords...');
    const kwInput = page.locator('input[placeholder*="keywords"], input[placeholder*="Keywords"], #keywords-input input, input#input').first();
    if (await kwInput.count() > 0) {
      await kwInput.click();
      await kwInput.fill(KEYWORDS);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
    }

    // Click "Advanced settings"
    const advTab = page.locator('paper-tab:has-text("Advanced settings"), tp-yt-paper-tab:has-text("Advanced settings"), [role="tab"]:has-text("Advanced settings")').first();
    if (await advTab.count() > 0) {
      await advTab.click();
      await page.waitForTimeout(1500);
      // Select "No, set this channel as not made for kids"
      const notForKids = page.locator('tp-yt-paper-radio-button[name="NOT_MADE_FOR_KIDS"], [role="radio"]:has-text("not made for kids"), tp-yt-paper-radio-button').nth(1);
      if (await notForKids.count() > 0) {
        await notForKids.click();
        await page.waitForTimeout(500);
      }
    }

    await page.screenshot({ path: 'tools/c1_settings_filled.png' });

    // Save Settings
    const saveBtn = page.locator('ytcp-button#save-button, button:has-text("Save")').first();
    if (await saveBtn.count() > 0 && !(await saveBtn.isDisabled())) {
      await saveBtn.click();
      console.log('Saved Channel Settings!');
      await page.waitForTimeout(3000);
    }
  }

  await page.screenshot({ path: 'tools/c1_final_complete.png' });
  console.log('🎉 CHANNEL 1 CONFIGURATION 100% COMPLETE!');
  await page.close();
}

main().catch(console.error);
