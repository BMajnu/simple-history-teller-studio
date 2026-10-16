const { chromium } = require('playwright-core');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AVATAR_PATH = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'branding', 'avatar_simple_history_teller.jpg');

const CHANNEL_ID = 'UCOzERwa3GJqO00B8LMTPtDg';
const CHANNEL_NAME = 'Simple History Teller Bangla';
const HANDLE = 'SimpleHistoryTellerBangla';

const DESCRIPTION = `সিম্পল হিস্ট্রি টেলার বাংলা (Simple History Teller Bangla)-এ আপনাকে স্বাগতম – যেখানে মানব সভ্যতা, প্রাচীন রহস্য, হারিয়ে যাওয়া ইতিহাস এবং রোমাঞ্চকর সব সত্য ঘটনা জীবন্ত অ্যানিমেশন ও চিত্তাকর্ষক বর্ণনায় ফুটে ওঠে।

মানব ইতিহাসের সূচনা, প্রথম ভাষার রহস্য, প্রাচীন মিশর ও মেসোপটেমিয়ার উত্থান-পতন, পরাক্রমশালী রাজা-বাদশাহদের গোপন পরীক্ষা এবং বিশ্ব ইতিহাসের মোড় ঘুরিয়ে দেওয়া যুদ্ধসমূহ – সব জটিল ইতিহাসকে আমরা সহজ, তথ্যবহুল ও আকর্ষণীয়ভাবে তুলে ধরি।

📜 আমাদের চ্যানেলে যা পাবেন:
• প্রাচীন সভ্যতা ও প্রত্নতাত্ত্বিক রহস্য
• ভাষার উৎপত্তি ও মানব সংস্কৃতির বিবর্তন
• প্রাচীন রাজা-বাদশাহ ও সম্রাটদের গোপন পরীক্ষা
• ঐতিহাসিক যুদ্ধ, বিপ্লব ও যুগান্তকারী আবিষ্কার
• প্রিমিয়াম অ্যানিমেটেড হিস্ট্রি ডকুমেন্টারি

🔔 ইতিহাসের রোমাঞ্চকর দুনিয়ায় প্রবেশ করতে এখনই সাবস্ক্রাইব করুন Simple History Teller Bangla!
প্রতি সপ্তাহে নতুন নতুন শিক্ষণীয় ও বিনোদনমূলক অ্যানিমেটেড ইতিহাসের গল্প।

#SimpleHistoryTellerBangla #ইতিহাস #AnimatedHistory #BanglaHistory #AncientHistory #Itihas #WorldHistoryInBengali #HistoryExplained #EducationalAnimation`;

const KEYWORDS_LIST = [
  'Simple History Teller Bangla',
  'সিম্পল হিস্ট্রি টেলার বাংলা',
  'bangla history',
  'itihash',
  'animated history bangla',
  'world history in bengali',
  'prachin itihas',
  'history documentary bangla',
  'oversimplified bangla',
  'itihas golpo',
  'bangla educational video',
  'mysterious history bangla',
  'ancient civilizations bangla'
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
  console.log('=== SWITCHING AND CONFIGURING CHANNEL 2 (Bangla: bmajnu981@gmail.com) ===');
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

  const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("অন্য অ্যাকাউন্ট ব্যবহার"), ytd-compact-link-renderer:has-text("अकाउंट बदलें")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  const section = page.locator('ytd-account-item-section-renderer').filter({ hasText: 'bmajnu981@gmail.com' }).first();
  if (await section.count() > 0) {
    console.log('Found section for bmajnu981@gmail.com, clicking...');
    const item = section.locator('ytd-account-item-renderer, #channel-title, yt-formatted-string#channel-title').first();
    await item.click();
    await page.waitForTimeout(4000);
  } else {
    console.log('bmajnu981 section not found directly, checking item text...');
    const directItem = page.locator('ytd-account-item-renderer:has-text("bmajnu981@gmail.com")').first();
    if (await directItem.count() > 0) {
      await directItem.click();
      await page.waitForTimeout(4000);
    }
  }

  console.log('Switched account! URL:', page.url());

  // 2. Open Channel 2 Studio Customization
  console.log('Opening Studio Customization for Channel 2...');
  await page.goto(`https://studio.youtube.com/channel/${CHANNEL_ID}/editing/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  await dismissDialogs(page);
  await page.screenshot({ path: 'tools/c2_customization_landing.png' });

  // 3. Upload banner if not set
  console.log('Checking banner / avatar file inputs...');
  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();
  console.log('Found file inputs:', count);
  if (count > 0) {
    // If banner has Upload button
    const bannerUploadBtn = page.locator('button:has-text("Upload"), ytcp-button:has-text("Upload")').first();
    // Input 0 is banner
    console.log('Setting banner image...');
    await fileInputs.nth(0).setInputFiles(AVATAR_PATH);
    await page.waitForTimeout(2500);

    const doneBtn = page.getByRole('button', { name: 'Done' }).or(page.locator('button:has-text("Done")')).first();
    if (await doneBtn.isVisible()) {
      console.log('Clicking Done on banner crop...');
      await doneBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }
  }

  // 4. Fill Bengali Description
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
    console.log('Bengali Description filled!');
    await page.waitForTimeout(1000);
  }

  // 5. Publish changes
  console.log('Publishing profile...');
  await dismissDialogs(page);
  const pubBtn = page.getByRole('button', { name: 'Publish' }).or(page.locator('button:has-text("Publish"), button:has-text("প্রকাশ করুন")')).first();
  if (await pubBtn.isVisible() && !(await pubBtn.isDisabled())) {
    await pubBtn.click({ force: true });
    console.log('Publish clicked! Waiting 6s...');
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: 'tools/c2_after_profile_publish.png' });

  // 6. Settings Modal
  console.log('Opening Studio Settings...');
  const settingsItem = page.locator('#settings-item').first();
  await settingsItem.scrollIntoViewIfNeeded();
  await settingsItem.click({ force: true });
  await page.waitForTimeout(3000);

  // Click Channel in sidebar
  console.log('Clicking Channel in settings menu...');
  const chTab = page.locator('span.title-text:has-text("Channel"), ytcp-navigation span:has-text("Channel"), span:has-text("চ্যানেল")').first();
  await chTab.click();
  await page.waitForTimeout(2000);

  // Enter Keywords
  console.log('Entering Bengali Keywords...');
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
  const advTab = page.locator('ytcp-primary-action-bar span:has-text("Advanced settings"), ytcp-primary-action-bar :text("Advanced settings"), span:has-text("উন্নত সেটিংস")').first();
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
  const saveBtn = page.locator('ytcp-button#save-button button, button:has-text("Save"), button:has-text("সংরক্ষণ করুন")').first();
  await saveBtn.click();
  await page.waitForTimeout(4000);
  console.log('Settings Saved!');

  await page.screenshot({ path: 'tools/c2_final_done.png' });
  console.log('🎉 CHANNEL 2 (BANGLA) COMPLETED 100%!');
  process.exit(0);
}

main().catch(err => {
  console.error('Channel 2 error:', err);
  process.exit(1);
});
