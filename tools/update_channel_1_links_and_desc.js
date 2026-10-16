const { chromium } = require('playwright-core');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AVATAR_PATH = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'branding', 'avatar_simple_history_teller.jpg');
const CHANNEL_ID = 'UCvEQdVnctkuYZw3iNDo5krg';

const DESCRIPTION = `Welcome to Simple History Teller – where world history, forgotten civilizations, and ancient mysteries come alive through immersive animated storytelling! 🏛️✨

From the dawn of early humans and the origin of spoken language to the rise and fall of ancient empires, legendary rulers, and history's greatest secrets – we make complex history simple, entertaining, and unforgettable.

📜 WHAT WE EXPLORE:
• Ancient Civilizations & Archaeological Discoveries
• Origins of Language, Culture & Human Evolution
• Forbidden Experiments of Ancient Kings & Emperors
• Pivotal Wars, Revolutions & World-Changing Inventions
• Illustrated Animated History Documentaries

⏰ NEW VIDEOS WEEKLY!
📩 Business: bmajnu980@gmail.com

🔔 Subscribe to Simple History Teller and journey through time with us!

#SimpleHistoryTeller #History #AnimatedHistory #AncientHistory #WorldHistory #OverSimplified #HistoryDocumentary #HistoryExplained`;

console.log('Description length:', DESCRIPTION.length);

const SOCIAL_LINKS = [
  { title: 'Facebook', url: 'https://facebook.com/SimpleHistoryTeller' },
  { title: 'Instagram', url: 'https://instagram.com/SimpleHistoryTeller' },
  { title: 'X (Twitter)', url: 'https://x.com/SimpleHistoryT' },
  { title: 'TikTok', url: 'https://tiktok.com/@SimpleHistoryTeller' }
];

const CONTACT_EMAIL = 'bmajnu980@gmail.com';

async function main() {
  console.log('=== UPDATING CHANNEL 1: Perfect Description & Social Links ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  let page = context.pages().find(p => p.url().includes(CHANNEL_ID) && p.url().includes('editing'));
  if (!page) {
    page = await context.newPage();
    await page.goto(`https://studio.youtube.com/channel/${CHANNEL_ID}/editing/profile`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
  }
  await page.bringToFront();

  // 1. Set Description
  console.log('Inserting optimized Description...');
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
  console.log('Description inserted cleanly.');
  await page.waitForTimeout(1000);

  // 2. Set Social Links
  console.log('Setting Social Links...');
  const addLinkBtn = page.locator('button.YtcpChannelLinksAddLinkButton, button:has-text("Add link")').first();
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

    const currentUrlInput = page.locator('input[placeholder="Enter a URL"]').nth(i);
    await currentUrlInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await currentUrlInput.fill(link.url);
    console.log(`Link ${i + 1} set: ${link.title} -> ${link.url}`);
    await page.waitForTimeout(300);
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
  console.log('Setting Video Watermark...');
  const watermarkFileInput = page.locator('input.style-scope.ytcp-video-watermark-upload, input[type="file"]').nth(2);
  if (await watermarkFileInput.count() > 0) {
    await watermarkFileInput.setInputFiles(AVATAR_PATH);
    await page.waitForTimeout(2000);

    const doneBtn = page.getByRole('button', { name: 'Done' }).or(page.locator('button:has-text("Done")')).first();
    if (await doneBtn.isVisible()) {
      await doneBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }

    const entireVideoRadio = page.locator('tp-yt-paper-radio-button[name="ENTIRE_VIDEO"], tp-yt-paper-radio-button:has-text("Entire video")').first();
    if (await entireVideoRadio.count() > 0) {
      await entireVideoRadio.click({ force: true });
    }
  }

  await page.screenshot({ path: 'tools/c1_pre_publish_fixed.png' });

  // 5. Publish
  console.log('Publishing Channel 1...');
  const pubBtn = page.getByRole('button', { name: 'Publish' }).or(page.locator('button:has-text("Publish")')).first();
  const isDisabled = await pubBtn.isDisabled();
  console.log('Publish button disabled:', isDisabled);
  if (!isDisabled) {
    await pubBtn.click();
    console.log('Clicked Publish! Waiting 6s...');
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: 'tools/c1_published_success.png' });
  console.log('🎉 CHANNEL 1 PRODUCTION SETUP SAVED!');
  process.exit(0);
}

main().catch(err => {
  console.error('Channel 1 update error:', err);
  process.exit(1);
});
