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
  console.log('--- EXECUTING CHANNEL 1 CONFIGURATION: Simple History Teller ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  // 1. Go to studio dashboard
  await page.goto('https://studio.youtube.com/channel/UCvEQdVnctkuYZw3iNDo5krg', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Close any popups
  try {
    const continueBtn = page.locator('button:has-text("Continue"), ytcp-button:has-text("Continue")').first();
    if (await continueBtn.count() > 0 && await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {}

  // 2. Click Customization link
  console.log('Clicking Customization link (a#menu-item-7)...');
  const customLink = page.locator('a#menu-item-7, a:has-text("Customization")').first();
  await customLink.click();
  await page.waitForTimeout(5000);

  try {
    const continueBtn = page.locator('button:has-text("Continue"), ytcp-button:has-text("Continue")').first();
    if (await continueBtn.count() > 0 && await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {}

  await page.screenshot({ path: 'tools/c1_custom_page_loaded.png' });
  console.log('On Customization page! URL:', page.url());

  // 3. Name input
  console.log('Filling Name...');
  const nameInput = page.locator('input#input, #name-input input, input[aria-label*="Name"]').first();
  if (await nameInput.count() > 0) {
    await nameInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await nameInput.fill(CHANNEL_NAME);
    await page.waitForTimeout(500);
  }

  // 4. Handle input
  console.log('Filling Handle...');
  const handleInput = page.locator('input[aria-label*="Handle"], #handle-input input').first();
  if (await handleInput.count() > 0) {
    await handleInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await handleInput.fill(HANDLE);
    await page.waitForTimeout(1000);
  }

  // 5. Description textarea
  console.log('Filling Description...');
  const descArea = page.locator('textarea#description, #description-textarea, textarea[aria-label*="Description"], textarea').first();
  if (await descArea.count() > 0) {
    await descArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await descArea.fill(DESCRIPTION);
    await page.waitForTimeout(500);
  }

  // 6. Picture upload
  console.log('Uploading Picture...');
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    await fileInput.setInputFiles(AVATAR_PATH);
    await page.waitForTimeout(3000);
    const doneBtn = page.locator('button:has-text("Done"), ytcp-button:has-text("Done"), button:has-text("Save")').first();
    if (await doneBtn.count() > 0 && await doneBtn.isVisible()) {
      await doneBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  await page.screenshot({ path: 'tools/c1_before_publish_ready.png' });

  // 7. Click Publish
  console.log('Clicking Publish button...');
  const pubBtn = page.locator('ytcp-button#publish-button, button:has-text("Publish")').first();
  if (await pubBtn.count() > 0) {
    await pubBtn.click();
    console.log('Clicked Publish! Waiting for changes to persist...');
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: 'tools/c1_after_publish_ready.png' });

  // 8. Configure Channel Settings
  console.log('Opening Settings...');
  const settingsBtn = page.locator('#settings-button, button[aria-label="Settings"], ytcp-button:has-text("Settings"), button:has-text("Settings")').first();
  if (await settingsBtn.count() > 0) {
    await settingsBtn.click();
    await page.waitForTimeout(3000);

    // Click Channel tab
    const chTab = page.locator('paper-tab:has-text("Channel"), [role="tab"]:has-text("Channel"), tp-yt-paper-tab:has-text("Channel")').first();
    if (await chTab.count() > 0) {
      await chTab.click();
      await page.waitForTimeout(1500);
    }

    // Add Keywords
    console.log('Entering Keywords...');
    const kwInput = page.locator('input[placeholder*="keywords"], input[placeholder*="Keywords"], #keywords-input input').first();
    if (await kwInput.count() > 0) {
      await kwInput.click();
      await kwInput.fill(KEYWORDS);
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
    const saveBtn = page.locator('ytcp-button#save-button, button:has-text("Save")').first();
    if (await saveBtn.count() > 0 && !(await saveBtn.isDisabled())) {
      await saveBtn.click();
      console.log('Saved Channel Settings!');
      await page.waitForTimeout(4000);
    }
  }

  await page.screenshot({ path: 'tools/c1_success.png' });
  console.log('🎉 CHANNEL 1: Simple History Teller FULLY CONFIGURED!');
  await page.close();
}

main().catch(console.error);
