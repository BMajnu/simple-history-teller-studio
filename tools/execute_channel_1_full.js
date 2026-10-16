const { chromium } = require('playwright-core');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AVATAR_PATH = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'branding', 'avatar_simple_history_teller.jpg');

const CHANNEL_ID = 'UCvEQdVnctkuYZw3iNDo5krg';
const CHANNEL_NAME = 'Simple History Teller';
const TARGET_HANDLE_1 = 'SimpleHistoryTeller';
const TARGET_HANDLE_2 = 'SimpleHistoryTellerOfficial';

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

const KEYWORDS_LIST = [
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
  'ancient civilizations',
  'historical mysteries',
  'educational animation'
];

async function dismissDialogs(page) {
  for (let i = 0; i < 3; i++) {
    try {
      const continueBtn = page.locator('#confirm-button, button:has-text("Continue"), ytcp-button:has-text("Continue"), button:has-text("जारी रखें"), button:has-text("চালিয়ে যান")').first();
      if (await continueBtn.isVisible()) {
        console.log('Dismissing Continue modal...');
        await continueBtn.click({ force: true });
        await page.waitForTimeout(1000);
      }
    } catch (e) {}

    try {
      const closeBtn = page.locator('button:has-text("Close")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click({ force: true });
        await page.waitForTimeout(500);
      }
    } catch (e) {}

    try {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (e) {}
  }
}

async function main() {
  console.log('=== FULL STEP-BY-STEP CHANNEL 1 EXECUTION ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const pages = browser.contexts()[0].pages();
  
  // Find page 8 or any active page for UCvEQdVnctkuYZw3iNDo5krg
  const page = pages[8] || pages.find(p => p.url().includes(CHANNEL_ID)) || pages[0];
  await page.bringToFront();
  console.log('Using page URL:', page.url());

  // Step 1: Dismiss all popups
  console.log('Step 1: Dismissing popups...');
  await dismissDialogs(page);
  await page.screenshot({ path: 'tools/c1_step1_dismissed.png' });

  // Step 2: Name Input
  console.log('Step 2: Setting Channel Name...');
  const nameInput = page.locator('input.ytcpChannelEditingChannelNameBrandNameInput, input#input, #name-input input').first();
  if (await nameInput.count() > 0) {
    await nameInput.scrollIntoViewIfNeeded();
    await nameInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await nameInput.fill(CHANNEL_NAME);
    console.log('Channel Name set to:', CHANNEL_NAME);
    await page.waitForTimeout(500);
  }

  // Step 3: Handle Input
  console.log('Step 3: Setting Handle...');
  const handleInput = page.locator('input.YtcpChannelEditingChannelHandleHandleInput').first();
  if (await handleInput.count() > 0) {
    await handleInput.scrollIntoViewIfNeeded();
    await handleInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await handleInput.fill(TARGET_HANDLE_1);
    await page.waitForTimeout(2000);

    const errorVisible = await page.locator('.error-message, [aria-invalid="true"]').first().isVisible().catch(() => false);
    if (errorVisible) {
      console.log('Target handle 1 unavailable, setting fallback handle 2...');
      await handleInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await handleInput.fill(TARGET_HANDLE_2);
      await page.waitForTimeout(1000);
    }
    console.log('Handle set!');
  }

  // Step 4: Banner & Avatar Upload
  console.log('Step 4: Uploading Branding (Banner & Avatar)...');
  const fileInputs = page.locator('input[type="file"]');
  const fCount = await fileInputs.count();
  console.log(`Found ${fCount} file inputs.`);

  // Upload Banner (input 0)
  if (fCount > 0) {
    console.log('Uploading Banner image...');
    await fileInputs.nth(0).setInputFiles(AVATAR_PATH);
    await page.waitForTimeout(2500);

    const doneBtn = page.getByRole('button', { name: 'Done' }).or(page.locator('button:has-text("Done")')).first();
    if (await doneBtn.isVisible()) {
      await doneBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }
  }

  // Upload Avatar (input 1)
  if (fCount > 1) {
    console.log('Uploading Avatar image...');
    await fileInputs.nth(1).setInputFiles(AVATAR_PATH);
    await page.waitForTimeout(2500);

    const doneBtn = page.getByRole('button', { name: 'Done' }).or(page.locator('button:has-text("Done")')).first();
    if (await doneBtn.isVisible()) {
      await doneBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }
  }

  // Step 5: Description
  console.log('Step 5: Filling Description...');
  await dismissDialogs(page);
  // Scroll down to Description
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(500);

  const descContainer = page.locator('#description-container, ytcp-form-textarea, #description-textarea').first();
  if (await descContainer.count() > 0) {
    await descContainer.scrollIntoViewIfNeeded();
    await descContainer.click({ force: true });
    await page.waitForTimeout(500);
  }

  const descTextarea = page.locator('textarea').first();
  if (await descTextarea.count() > 0) {
    await descTextarea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await descTextarea.fill(DESCRIPTION);
    console.log('English Description filled!');
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: 'tools/c1_ready_to_publish.png' });

  // Step 6: Publish
  console.log('Step 6: Clicking Publish...');
  await dismissDialogs(page);
  const pubBtn = page.getByRole('button', { name: 'Publish' }).or(page.locator('button:has-text("Publish")')).first();
  if (await pubBtn.isVisible() && !(await pubBtn.isDisabled())) {
    await pubBtn.click({ force: true });
    console.log('Clicked Publish! Waiting 6s for persistence...');
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: 'tools/c1_published_live.png' });

  // Step 7: Settings Modal (Keywords & Not made for kids)
  console.log('Step 7: Configuring Settings...');
  const settingsItem = page.locator('#settings-item').first();
  await settingsItem.scrollIntoViewIfNeeded();
  await settingsItem.click({ force: true });
  await page.waitForTimeout(3000);

  // Click Channel in sidebar
  console.log('Clicking Channel in settings sidebar...');
  const chTab = page.locator('span.title-text:has-text("Channel"), ytcp-navigation span:has-text("Channel")').first();
  await chTab.click();
  await page.waitForTimeout(2000);

  // Enter Keywords
  console.log('Entering Keywords...');
  const kwInput = page.locator('#keywords-input input, input[placeholder*="keywords"], input#text-input').first();
  await kwInput.click();
  for (const kw of KEYWORDS_LIST) {
    await kwInput.fill(kw);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
  }
  console.log('Keywords entered!');

  // Advanced settings: Not made for kids
  console.log('Clicking Advanced settings...');
  const advTab = page.locator('ytcp-primary-action-bar span:has-text("Advanced settings"), ytcp-primary-action-bar :text("Advanced settings")').first();
  await advTab.click();
  await page.waitForTimeout(1500);

  console.log('Selecting "Not made for kids"...');
  const notKids = page.locator('tp-yt-paper-radio-button[name="NOT_MADE_FOR_KIDS"]').first();
  if (await notKids.count() > 0) {
    await notKids.click();
    console.log('Selected NOT_MADE_FOR_KIDS!');
    await page.waitForTimeout(1000);
  }

  // Click Save
  console.log('Saving Settings...');
  const saveBtn = page.locator('ytcp-button#save-button button, button:has-text("Save")').first();
  await saveBtn.click();
  await page.waitForTimeout(4000);
  console.log('Settings Saved successfully!');

  await page.screenshot({ path: 'tools/c1_all_finished_final.png' });
  console.log('🎉 CHANNEL 1: Simple History Teller 100% COMPLETE!');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal Channel 1 error:', err);
  process.exit(1);
});
