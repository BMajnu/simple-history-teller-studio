const { chromium } = require('playwright-core');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AVATAR_PATH = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'branding', 'avatar_simple_history_teller.jpg');
const CHANNEL_ID = 'UCOzERwa3GJqO00B8LMTPtDg';

const DESCRIPTION = `সিম্পল হিস্ট্রি টেলার বাংলা (Simple History Teller Bangla)-এ স্বাগতম! 🏛️✨

বিশ্বের হারিয়ে যাওয়া ইতিহাস, প্রাচীন সভ্যতা এবং রোমাঞ্চকর সব রহস্যময় সত্য ঘটনা জীবন্ত অ্যানিমেশন ও চিত্তাকর্ষক গল্পে তুলে ধরাই আমাদের লক্ষ্য।

মানব সভ্যতার সূচনা ও প্রথম ভাষার রহস্য থেকে শুরু করে পরাক্রমশালী রাজা-বাদশাহদের উত্থান-পতন, প্রাচীন পৃথিবীর গোপন পরীক্ষা এবং বিশ্ব ইতিহাস বদলে দেওয়া যুদ্ধসমূহ – সব জটিল ইতিহাস এখানে সহজ ও তথ্যবহুল।

📜 আমাদের চ্যানেলে যা পাবেন:
• প্রাচীন সভ্যতা ও প্রত্নতাত্ত্বিক রহস্য
• ভাষার উৎপত্তি ও মানব সংস্কৃতির বিবর্তন
• প্রাচীন সম্রাটদের অদ্ভুত ও গোপন পরীক্ষা
• ঐতিহাসিক যুদ্ধ, বিপ্লব ও যুগান্তকারী আবিষ্কার
• প্রিমিয়াম অ্যানিমেটেড হিস্ট্রি ডকুমেন্টারি

⏰ প্রতি সপ্তাহে নতুন অ্যানিমেটেড ইতিহাস!
📩 বিজনেস যোগাযোগ: bmajnu981@gmail.com

🔔 এখনই সাবস্ক্রাইব করুন এবং ইতিহাসের রোমাঞ্চকর দুনিয়ায় যুক্ত থাকুন!

#SimpleHistoryTellerBangla #ইতিহাস #AnimatedHistory #BanglaHistory #WorldHistory #Itihas #AncientCivilizations`;

console.log('Bangla Description length:', DESCRIPTION.length);

const SOCIAL_LINKS = [
  { title: 'Facebook', url: 'https://facebook.com/SimpleHistoryTellerBangla' },
  { title: 'Instagram', url: 'https://instagram.com/SimpleHistoryTellerBangla' },
  { title: 'X (Twitter)', url: 'https://x.com/SimpleHistoryBN' },
  { title: 'TikTok', url: 'https://tiktok.com/@SimpleHistoryBangla' }
];

const CONTACT_EMAIL = 'bmajnu981@gmail.com';

async function dismissDialogs(page) {
  for (let i = 0; i < 3; i++) {
    try {
      const continueBtn = page.locator('#confirm-button, button:has-text("Continue"), ytcp-button:has-text("Continue"), button:has-text("চালিয়ে যান")').first();
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
  console.log('=== UPDATING CHANNEL 2 (Bangla): Production Description, Social Links, Email ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = await context.newPage();

  page.on('dialog', async d => {
    console.log('Accepting dialog:', d.message());
    await d.accept().catch(() => {});
  });

  // 1. Switch to bmajnu981@gmail.com on YouTube
  console.log('Switching account to bmajnu981@gmail.com...');
  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const avatarBtn = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatarBtn.click();
  await page.waitForTimeout(1500);

  const switchItem = page.locator('ytd-compact-link-renderer:has-text("Switch account"), ytd-compact-link-renderer:has-text("অন্য অ্যাকাউন্ট ব্যবহার"), ytd-compact-link-renderer:has-text("অ্যাকাউন্ট পরিবর্তন করুন")').first();
  await switchItem.click();
  await page.waitForTimeout(2000);

  const section = page.locator('ytd-account-item-section-renderer').filter({ hasText: 'bmajnu981@gmail.com' }).first();
  if (await section.count() > 0) {
    const item = section.locator('ytd-account-item-renderer, #channel-title, yt-formatted-string#channel-title').first();
    await item.click();
    await page.waitForTimeout(4000);
  } else {
    const directItem = page.locator('ytd-account-item-renderer:has-text("bmajnu981@gmail.com")').first();
    if (await directItem.count() > 0) {
      await directItem.click();
      await page.waitForTimeout(4000);
    }
  }

  // 2. Open Customization Profile
  console.log('Navigating to Channel 2 Customization...');
  await page.goto(`https://studio.youtube.com/channel/${CHANNEL_ID}/editing/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  await dismissDialogs(page);

  // 3. Set Description
  console.log('Inserting Bangla Description...');
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
  console.log('Bangla Description inserted!');
  await page.waitForTimeout(1000);

  // 4. Set Social Links
  console.log('Setting Social Links...');
  const addLinkBtn = page.locator('button.YtcpChannelLinksAddLinkButton, button:has-text("Add link"), button:has-text("লিঙ্ক যোগ করুন")').first();
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

    const currentUrlInput = page.locator('input[placeholder="Enter a URL"], input[placeholder="একটি URL লিখুন"]').nth(i);
    await currentUrlInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await currentUrlInput.fill(link.url);
    console.log(`Link ${i + 1} set: ${link.title} -> ${link.url}`);
    await page.waitForTimeout(300);
  }

  // 5. Contact Email
  console.log('Setting Contact Email...');
  const emailInput = page.locator('input[placeholder="Email address"], input[placeholder="ইমেল ঠিকানা"], #business-email input').first();
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

    const doneBtn = page.getByRole('button', { name: 'Done' }).or(page.locator('button:has-text("Done"), button:has-text("হয়ে গেছে")')).first();
    if (await doneBtn.isVisible()) {
      await doneBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }

    const entireVideoRadio = page.locator('tp-yt-paper-radio-button[name="ENTIRE_VIDEO"], tp-yt-paper-radio-button:has-text("Entire video"), tp-yt-paper-radio-button:has-text("সম্পূর্ণ ভিডিও")').first();
    if (await entireVideoRadio.count() > 0) {
      await entireVideoRadio.click({ force: true });
    }
  }

  await page.screenshot({ path: 'tools/c2_pre_publish_fixed.png' });

  // 7. Publish
  console.log('Publishing Channel 2...');
  const pubBtn = page.getByRole('button', { name: 'Publish' }).or(page.locator('button:has-text("Publish"), button:has-text("প্রকাশ করুন")')).first();
  const isDisabled = await pubBtn.isDisabled();
  console.log('Publish button disabled:', isDisabled);
  if (!isDisabled) {
    await pubBtn.click();
    console.log('Clicked Publish! Waiting 6s...');
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: 'tools/c2_published_success.png' });
  console.log('🎉 CHANNEL 2 PRODUCTION SETUP SAVED!');
  await page.close();
  process.exit(0);
}

main().catch(err => {
  console.error('Channel 2 update error:', err);
  process.exit(1);
});
