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

const KEYWORDS = [
  'Simple History Teller',
  'simple history',
  'animated history',
  'history documentary',
  'world history',
  'ancient history',
  'oversimplified',
  'human history',
  'history explained',
  'origin of language',
  'ancient egypt',
  'roman empire',
  'historical mysteries',
  'educational animation',
  'civilization'
];

async function main() {
  console.log('--- CONFIGURING CHANNEL 1: Simple History Teller (bmajnu980@gmail.com) ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  // 1. Go to Customization -> Basic Info
  const url = 'https://studio.youtube.com/editing/profile?authuser=bmajnu980@gmail.com';
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);

  // Close any welcome popups
  try {
    const continueBtn = page.locator('button:has-text("Continue"), ytcp-button:has-text("Continue")').first();
    if (await continueBtn.count() > 0 && await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(1000);
    }
    const closeBtn = page.locator('button:has-text("Close"), ytcp-button:has-text("Close"), tp-yt-paper-dialog button[aria-label="Close"]').first();
    if (await closeBtn.count() > 0 && await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }
  } catch (e) {}

  await page.screenshot({ path: 'tools/c1_basic_info_page.png' });
  console.log('Current page URL:', page.url());

  // Set Channel Name
  console.log('Setting channel name to:', CHANNEL_NAME);
  const nameInput = page.locator('input#input, #input-0, #name-input input, input[aria-label*="Name"], input[aria-label*="নাম"]').first();
  if (await nameInput.count() > 0) {
    await nameInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await nameInput.fill(CHANNEL_NAME);
    await page.waitForTimeout(500);
  }

  // Set Handle
  console.log('Setting handle to:', HANDLE);
  const handleInput = page.locator('input[aria-label*="Handle"], input[aria-label*="হ্যান্ডেল"], #handle-input input').first();
  if (await handleInput.count() > 0) {
    await handleInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await handleInput.fill(HANDLE);
    await page.waitForTimeout(1000);
  }

  // Set Description
  console.log('Setting description...');
  const descArea = page.locator('textarea#description, #description-textarea, textarea[aria-label*="Description"], textarea[aria-label*="বিবরণ"]').first();
  if (await descArea.count() > 0) {
    await descArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await descArea.fill(DESCRIPTION);
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: 'tools/c1_after_inputs.png' });

  // Click Publish
  console.log('Looking for Publish button...');
  const publishBtn = page.locator('ytcp-button#publish-button, button:has-text("Publish"), button:has-text("প্রকাশ করুন")').first();
  if (await publishBtn.count() > 0 && !(await publishBtn.isDisabled())) {
    await publishBtn.click();
    console.log('Clicked Publish! Waiting for changes to apply...');
    await page.waitForTimeout(4000);
  } else {
    console.log('Publish button status:', await publishBtn.count() > 0 ? 'Disabled or already saved' : 'Not found');
  }

  // 2. Upload Branding Avatar
  console.log('Navigating to Branding tab...');
  await page.goto('https://studio.youtube.com/editing/images?authuser=bmajnu980@gmail.com', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'tools/c1_branding_page.png' });

  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    console.log('Uploading avatar logo from:', AVATAR_PATH);
    await fileInput.setInputFiles(AVATAR_PATH);
    await page.waitForTimeout(2000);
    // Crop dialog 'Done'
    const doneBtn = page.locator('button:has-text("Done"), ytcp-button:has-text("Done"), button:has-text("হয়ে গেছে")').first();
    if (await doneBtn.count() > 0 && await doneBtn.isVisible()) {
      await doneBtn.click();
      await page.waitForTimeout(2000);
    }
    // Publish
    const pub2 = page.locator('ytcp-button#publish-button, button:has-text("Publish"), button:has-text("প্রকাশ করুন")').first();
    if (await pub2.count() > 0 && !(await pub2.isDisabled())) {
      await pub2.click();
      console.log('Published avatar logo!');
      await page.waitForTimeout(4000);
    }
  }

  await page.screenshot({ path: 'tools/c1_done.png' });
  console.log('🎉 CHANNEL 1 CONFIGURATION COMPLETED!');
  await page.close();
}

main().catch(console.error);
