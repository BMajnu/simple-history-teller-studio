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

async function main() {
  console.log('--- SETTING UP CHANNEL 1: Simple History Teller (bmajnu980@gmail.com) ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  // 1. Go to YouTube and switch to bmajnu980@gmail.com
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
    console.log('Clicking item inside bmajnu980 section...');
    await item.click();
    await page.waitForTimeout(5000);
  }

  console.log('Switched to bmajnu980! URL:', page.url());

  // 2. Click avatar -> YouTube Studio or View your channel
  const av2 = page.locator('#avatar-btn, button#avatar-btn').first();
  await av2.click();
  await page.waitForTimeout(1500);

  const studioLink = page.locator('ytd-compact-link-renderer:has-text("YouTube Studio")').first();
  if (await studioLink.count() > 0) {
    console.log('Clicking YouTube Studio link...');
    await studioLink.click();
    await page.waitForTimeout(6000);
  }

  // Dismiss any welcome modal
  try {
    const continueBtn = page.locator('button:has-text("Continue"), ytcp-button:has-text("Continue")').first();
    if (await continueBtn.count() > 0 && await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(1500);
    }
  } catch (e) {}

  console.log('In Studio! URL:', page.url());
  await page.screenshot({ path: 'tools/c1_studio_landing.png' });

  // 3. Click Customization in Studio sidebar
  const customItem = page.locator('ytcp-navigation-item#customization, a[test-id="customization"], ytcp-navigation-item:has-text("Customization")').first();
  if (await customItem.count() > 0) {
    console.log('Clicking Customization in sidebar...');
    await customItem.click();
    await page.waitForTimeout(4000);
  } else {
    // Navigate via subpath if available
    const studioUrl = page.url();
    const match = studioUrl.match(/channel\/([^/?#]+)/);
    if (match) {
      await page.goto(`https://studio.youtube.com/channel/${match[1]}/editing/profile`);
      await page.waitForTimeout(4000);
    }
  }

  await page.screenshot({ path: 'tools/c1_customization_landing.png' });

  // Click Basic info tab
  const basicInfoTab = page.locator('tp-yt-paper-tab:has-text("Basic info"), div:has-text("Basic info")').first();
  if (await basicInfoTab.count() > 0) {
    await basicInfoTab.click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tools/c1_basic_info_active.png' });

  // Name
  console.log('Filling Name:', CHANNEL_NAME);
  const nameBox = page.locator('input#input, #name-input input, input[aria-label*="Name"], input[aria-label*="নাম"]').first();
  if (await nameBox.count() > 0) {
    await nameBox.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await nameBox.fill(CHANNEL_NAME);
    await page.waitForTimeout(500);
  }

  // Handle
  console.log('Filling Handle:', HANDLE);
  const handleBox = page.locator('input[aria-label*="Handle"], input[aria-label*="হ্যান্ডেল"], #handle-input input').first();
  if (await handleBox.count() > 0) {
    await handleBox.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await handleBox.fill(HANDLE);
    await page.waitForTimeout(1000);
  }

  // Description
  console.log('Filling Description...');
  const descBox = page.locator('textarea#description, #description-textarea, textarea[aria-label*="Description"], textarea[aria-label*="বিবরণ"]').first();
  if (await descBox.count() > 0) {
    await descBox.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await descBox.fill(DESCRIPTION);
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: 'tools/c1_profile_filled.png' });

  // Publish
  const pubBtn = page.locator('ytcp-button#publish-button, button:has-text("Publish"), button:has-text("প্রকাশ করুন")').first();
  if (await pubBtn.count() > 0 && !(await pubBtn.isDisabled())) {
    console.log('Clicking Publish...');
    await pubBtn.click();
    await page.waitForTimeout(5000);
  }

  // 4. Click Branding tab
  const brandingTab = page.locator('tp-yt-paper-tab:has-text("Branding")').first();
  if (await brandingTab.count() > 0) {
    console.log('Clicking Branding tab...');
    await brandingTab.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tools/c1_branding_active.png' });

    // File input for picture
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      console.log('Uploading avatar logo...');
      await fileInput.setInputFiles(AVATAR_PATH);
      await page.waitForTimeout(2000);
      const doneBtn = page.locator('button:has-text("Done"), ytcp-button:has-text("Done"), button:has-text("হয়ে গেছে")').first();
      if (await doneBtn.count() > 0) {
        await doneBtn.click();
        await page.waitForTimeout(2000);
      }
      const pub2 = page.locator('ytcp-button#publish-button, button:has-text("Publish")').first();
      if (await pub2.count() > 0 && !(await pub2.isDisabled())) {
        await pub2.click();
        console.log('Published avatar!');
        await page.waitForTimeout(5000);
      }
    }
  }

  await page.screenshot({ path: 'tools/c1_final_state.png' });
  console.log('🎉 CHANNEL 1 FULLY CONFIGURED!');
  await page.close();
}

main().catch(console.error);
