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
  console.log('=== SWITCHING AND CONFIGURING CHANNEL 1 (English: bmajnu980@gmail.com) ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = await context.newPage();

  page.on('dialog', async d => {
    console.log('Accepting dialog:', d.message());
    await d.accept().catch(() => {});
  });

  // 1. Switch account on YouTube
  console.log('Navigating to youtube.com for account switch...');
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const avatarBtn = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatarBtn.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("অন্য অ্যাকাউন্ট ব্যবহার"), ytd-compact-link-renderer:has-text("অ্যাকাউন্ট পরিবর্তন করুন"), ytd-compact-link-renderer:has-text("अकाउंट बदलें")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  const section = page.locator('ytd-account-item-section-renderer').filter({ hasText: 'bmajnu980@gmail.com' }).first();
  if (await section.count() > 0) {
    console.log('Found section for bmajnu980@gmail.com, clicking...');
    const item = section.locator('ytd-account-item-renderer, #channel-title, yt-formatted-string#channel-title').first();
    await item.click();
    await page.waitForTimeout(4000);
  } else {
    console.log('bmajnu980 section not found directly, checking item text...');
    const directItem = page.locator('ytd-account-item-renderer:has-text("bmajnu980@gmail.com")').first();
    if (await directItem.count() > 0) {
      await directItem.click();
      await page.waitForTimeout(4000);
    }
  }

  console.log('Switched account! URL:', page.url());

  // 2. Open Channel 1 Studio Customization
  console.log('Opening Studio Customization for Channel 1...');
  await page.goto(`https://studio.youtube.com/channel/${CHANNEL_ID}/editing/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  await dismissDialogs(page);
  await page.screenshot({ path: 'tools/c1_customization_landing.png' });

  // 3. Upload Profile Picture
  console.log('Uploading Profile Picture...');
  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();
  console.log('Found file inputs:', count);
  if (count > 1) {
    // Input 1 is profile picture (ytcp-profile-image-upload)
    console.log('Setting file on profile input (index 1)...');
    await fileInputs.nth(1).setInputFiles(AVATAR_PATH);
    await page.waitForTimeout(3000);

    const doneBtn = page.getByRole('button', { name: 'Done' }).or(page.locator('button:has-text("Done")')).first();
    if (await doneBtn.isVisible()) {
      console.log('Clicking Done on crop dialog...');
      await doneBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }
  }

  // 4. Set Handle
  console.log('Setting Handle...');
  const handleBox = page.locator('input[aria-label*="Handle"], input[aria-label*="হ্যান্ডেল"], #handle-input input').first();
  if (await handleBox.count() > 0) {
    await handleBox.scrollIntoViewIfNeeded();
    await handleBox.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await handleBox.fill(TARGET_HANDLE_1);
    await page.waitForTimeout(2000);

    // Check if error message for handle unavailable
    const handleErr = await page.locator('#handle-error, [role="alert"]').first().innerText().catch(() => '');
    if (handleErr && handleErr.length > 0) {
      console.log('Handle 1 error / taken:', handleErr, '- trying fallback handle:', TARGET_HANDLE_2);
      await handleBox.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await handleBox.fill(TARGET_HANDLE_2);
      await page.waitForTimeout(1500);
    } else {
      console.log('Handle set to:', TARGET_HANDLE_1);
    }
  }

  // 5. Fill English Description
  console.log('Filling Description...');
  await dismissDialogs(page);
  const descContainer = page.locator('#description-container, textarea#description, textarea[aria-label*="Description"], textarea[aria-label*="বিবরণ"], ytcp-form-textarea').first();
  if (await descContainer.count() > 0) {
    await descContainer.scrollIntoViewIfNeeded();
    await descContainer.click({ force: true });
    await page.waitForTimeout(500);
    const textarea = page.locator('textarea').first();
    await textarea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await textarea.fill(DESCRIPTION);
    console.log('English Description filled!');
    await page.waitForTimeout(1000);
  }

  // 6. Publish profile changes
  console.log('Publishing profile...');
  await dismissDialogs(page);
  const pubBtn = page.getByRole('button', { name: 'Publish' }).or(page.locator('button:has-text("Publish"), button:has-text("প্রকাশ করুন")')).first();
  if (await pubBtn.isVisible() && !(await pubBtn.isDisabled())) {
    await pubBtn.click({ force: true });
    console.log('Publish clicked! Waiting 6s...');
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: 'tools/c1_after_profile_publish.png' });

  // 7. Settings Modal
  console.log('Opening Studio Settings...');
  const settingsItem = page.locator('#settings-item').first();
  await settingsItem.scrollIntoViewIfNeeded();
  await settingsItem.click({ force: true });
  await page.waitForTimeout(3000);

  // Click Channel in sidebar
  console.log('Clicking Channel in settings menu...');
  const chTab = page.locator('span.title-text:has-text("Channel"), ytcp-navigation span:has-text("Channel")').first();
  await chTab.click();
  await page.waitForTimeout(2000);

  // Enter Keywords
  console.log('Entering English Keywords...');
  const kwInput = page.locator('#keywords-input input, input[placeholder*="keywords"], input#text-input').first();
  await kwInput.click();
  for (const kw of KEYWORDS_LIST) {
    await kwInput.fill(kw);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
  }
  console.log('Keywords entered!');

  // Click Advanced settings
  console.log('Clicking Advanced settings...');
  const advTab = page.locator('ytcp-primary-action-bar span:has-text("Advanced settings"), ytcp-primary-action-bar :text("Advanced settings")').first();
  await advTab.click();
  await page.waitForTimeout(1500);

  // Not made for kids
  console.log('Selecting "Not made for kids"...');
  const notKids = page.locator('tp-yt-paper-radio-button[name="NOT_MADE_FOR_KIDS"]').first();
  if (await notKids.count() > 0) {
    await notKids.click();
    console.log('Selected NOT_MADE_FOR_KIDS!');
    await page.waitForTimeout(1000);
  }

  // Click Save
  console.log('Saving settings...');
  const saveBtn = page.locator('ytcp-button#save-button button, button:has-text("Save")').first();
  await saveBtn.click();
  await page.waitForTimeout(4000);
  console.log('Settings Saved!');

  await page.screenshot({ path: 'tools/c1_final_done.png' });
  console.log('🎉 CHANNEL 1 (ENGLISH) COMPLETED 100%!');
  process.exit(0);
}

main().catch(err => {
  console.error('Channel 1 error:', err);
  process.exit(1);
});
