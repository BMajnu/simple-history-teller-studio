const { chromium } = require('playwright-core');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AVATAR_PATH = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'branding', 'avatar_simple_history_teller.jpg');
const CHANNEL_ID = 'UCvEQdVnctkuYZw3iNDo5krg';

const DESCRIPTION = `Welcome to Simple History Teller – the official destination where world history, forgotten civilizations, and legendary mysteries are brought to life through captivating visual storytelling and animated documentaries! 🏛️✨

From the dawn of human civilization and the origins of early spoken languages to the rise and fall of colossal empires, ancient kings, tactical warfare, and groundbreaking discoveries that altered the course of mankind – we transform complex historical narratives into simple, cinematic, and unforgettable experiences.

━━━━━━━━━━━━━━━━━━━━━━━━━━
📜 WHAT YOU WILL DISCOVER ON THIS CHANNEL:
• Ancient Civilizations & Archaeological Discoveries (Egypt, Mesopotamia, Rome, Indus Valley)
• The Evolution of Language, Culture, Science & Human Intelligence
• Forbidden Psychological & Historical Experiments of Monarchs & Rulers
• Legendary Battles, Strategic Revolutions & World-Changing Inventions
• Deep-dive Illustrated Animated Documentaries

━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ UPLOAD SCHEDULE:
• New Full-Length Animated History Documentaries every Friday & Sunday!
• Historical Shorts & Curiosities throughout the week.

━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 CONNECT WITH US ACROSS SOCIAL MEDIA:
• Facebook: https://facebook.com/SimpleHistoryTeller
• Instagram: https://instagram.com/SimpleHistoryTeller
• X (Twitter): https://x.com/SimpleHistoryT
• TikTok: https://tiktok.com/@SimpleHistoryTeller

📩 Business & Sponsorship Inquiries: bmajnu980@gmail.com

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔔 Subscribe to Simple History Teller and journey through the corridors of time with us!
Don't forget to like, comment, and turn on all notifications so you never miss a new chapter in history.

#SimpleHistoryTeller #History #AnimatedHistory #AncientCivilizations #WorldHistory #HistoryDocumentary #OverSimplified #HistoryExplained #EducationalAnimation`;

const SOCIAL_LINKS = [
  { title: 'Facebook', url: 'https://facebook.com/SimpleHistoryTeller' },
  { title: 'Instagram', url: 'https://instagram.com/SimpleHistoryTeller' },
  { title: 'X (Twitter)', url: 'https://x.com/SimpleHistoryT' },
  { title: 'TikTok', url: 'https://tiktok.com/@SimpleHistoryTeller' }
];

const CONTACT_EMAIL = 'bmajnu980@gmail.com';

async function dismissDialogs(page) {
  for (let i = 0; i < 3; i++) {
    try {
      const continueBtn = page.locator('#confirm-button, button:has-text("Continue"), ytcp-button:has-text("Continue")').first();
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
  console.log('=== UPDATING CHANNEL 1: Simple History Teller (Full Production Setup) ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  let page = context.pages().find(p => p.url().includes(CHANNEL_ID) && p.url().includes('editing'));
  if (!page) {
    page = await context.newPage();
    await page.goto(`https://studio.youtube.com/channel/${CHANNEL_ID}/editing/profile`, { waitUntil: 'domcontentloaded' });
  }
  await page.bringToFront();
  await page.waitForTimeout(3000);

  await dismissDialogs(page);

  // 1. Description
  console.log('Updating Description...');
  const descContainer = page.locator('#description-container, ytcp-form-textarea').first();
  await descContainer.scrollIntoViewIfNeeded();
  await descContainer.click({ force: true });
  await page.waitForTimeout(500);
  const textarea = page.locator('textarea').first();
  await textarea.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await textarea.fill(DESCRIPTION);
  console.log('Description filled successfully!');
  await page.waitForTimeout(1000);

  // 2. Add Social Links
  console.log('Adding Social Links...');
  // Scroll down to Links section
  const addLinkBtn = page.locator('button.YtcpChannelLinksAddLinkButton, button:has-text("Add link")').first();
  await addLinkBtn.scrollIntoViewIfNeeded();

  for (let i = 0; i < SOCIAL_LINKS.length; i++) {
    const link = SOCIAL_LINKS[i];
    // Check how many link items exist currently
    const titleInputs = page.locator('input.ytcpChannelLinkItemTitleInput');
    const existingCount = await titleInputs.count();
    console.log(`Current link rows count: ${existingCount}, needed index: ${i}`);
    
    if (existingCount <= i) {
      console.log(`Clicking Add link for item ${i + 1} (${link.title})...`);
      await addLinkBtn.scrollIntoViewIfNeeded();
      await addLinkBtn.click({ force: true });
      await page.waitForTimeout(1000);
    }

    const currentTitleInput = page.locator('input.ytcpChannelLinkItemTitleInput').nth(i);
    await currentTitleInput.scrollIntoViewIfNeeded();
    await currentTitleInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await currentTitleInput.fill(link.title);

    const currentUrlInput = page.locator('input[placeholder="Enter a URL"]').nth(i);
    await currentUrlInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await currentUrlInput.fill(link.url);
    console.log(`Added link: ${link.title} -> ${link.url}`);
    await page.waitForTimeout(500);
  }

  // 3. Contact Email
  console.log('Setting Contact Email...');
  const emailInput = page.locator('input[placeholder="Email address"], #business-email input').first();
  if (await emailInput.count() > 0) {
    await emailInput.scrollIntoViewIfNeeded();
    await emailInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await emailInput.fill(CONTACT_EMAIL);
    console.log(`Contact email set to ${CONTACT_EMAIL}`);
    await page.waitForTimeout(500);
  }

  // 4. Video watermark
  console.log('Checking Video Watermark upload...');
  const watermarkFileInput = page.locator('input.style-scope.ytcp-video-watermark-upload, input[type="file"]').nth(2);
  if (await watermarkFileInput.count() > 0) {
    console.log('Uploading avatar as video watermark...');
    await watermarkFileInput.setInputFiles(AVATAR_PATH);
    await page.waitForTimeout(2000);

    const doneBtn = page.getByRole('button', { name: 'Done' }).or(page.locator('button:has-text("Done")')).first();
    if (await doneBtn.isVisible()) {
      await doneBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }

    // Select "Entire video" radio button for watermark
    const entireVideoRadio = page.locator('tp-yt-paper-radio-button[name="ENTIRE_VIDEO"], tp-yt-paper-radio-button:has-text("Entire video")').first();
    if (await entireVideoRadio.count() > 0) {
      await entireVideoRadio.click({ force: true });
      console.log('Selected "Entire video" for watermark display time.');
    }
  }

  await page.screenshot({ path: 'tools/c1_ready_for_production_publish.png' });

  // 5. Publish
  console.log('Clicking Publish...');
  await dismissDialogs(page);
  const pubBtn = page.getByRole('button', { name: 'Publish' }).or(page.locator('button:has-text("Publish")')).first();
  if (await pubBtn.isVisible() && !(await pubBtn.isDisabled())) {
    await pubBtn.click({ force: true });
    console.log('Clicked Publish! Waiting 6s for changes to save...');
    await page.waitForTimeout(6000);
  } else {
    console.log('Publish button not enabled or already saved.');
  }

  await page.screenshot({ path: 'tools/c1_production_saved.png' });
  console.log('🎉 CHANNEL 1 PRODUCTION SETUP COMPLETE!');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error updating Channel 1:', err);
  process.exit(1);
});
