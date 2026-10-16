const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.join(ARTIFACTS_DIR, 'history_mascot_02_torch_stone_arch_ruins.jpg');
const BANNER_PATH = path.join(ARTIFACTS_DIR, 'banner_simple_history_teller_en.jpg');

const CHANNEL_ID = 'UCvEQdVnctkuYZw3iNDo5krg';

const UPDATED_DESC = `Welcome to Simple History Teller – where world history, forgotten civilizations, and ancient mysteries come alive through immersive animated storytelling! 🏛️✨

From the dawn of early humans and the origin of spoken language to the rise and fall of ancient empires, legendary rulers, and history's greatest secrets – we make complex history simple, entertaining, and unforgettable.

📜 WHAT WE EXPLORE:
• Ancient Civilizations & Archaeological Discoveries
• Origins of Language, Culture & Human Evolution
• Forbidden Experiments of Ancient Kings & Emperors
• Pivotal Wars, Revolutions & World-Changing Inventions
• Illustrated Animated History Documentaries

⏰ NEW EPISODES EVERY 2 DAYS (3 VIDEOS WEEKLY)!
📩 Business: bmajnu980@gmail.com

🔔 Subscribe to Simple History Teller and journey through time with us!

#SimpleHistoryTeller #History #AnimatedHistory #AncientHistory #WorldHistory #OverSimplified #HistoryDocumentary #HistoryExplained`;

(async () => {
  console.log('=== UPLOADING BRANDING TO CHANNEL 1 (English) ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes(CHANNEL_ID) && p.url().includes('editing')) || ctx.pages()[0];
  await page.bringToFront();

  // Make sure we are on editing/profile
  if (!page.url().includes('editing/profile')) {
    await page.goto(`https://studio.youtube.com/channel/${CHANNEL_ID}/editing/profile`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
  }

  // Dismiss any overlays
  await page.evaluate(() => {
    document.querySelectorAll('.cdk-overlay-container, .cdk-overlay-backdrop').forEach(el => el.remove());
  });

  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();
  console.log('Found file inputs:', count);

  // 1. Upload Banner Image (Input 0)
  console.log('Uploading Banner Image...');
  await fileInputs.nth(0).setInputFiles(BANNER_PATH);
  await page.waitForTimeout(3000);

  let doneBtn = page.locator('#done-button, button:has-text("Done"), ytcp-button:has-text("Done")').first();
  if (await doneBtn.isVisible().catch(() => false)) {
    console.log('Clicking Done on Banner crop...');
    await doneBtn.click({ force: true });
    await page.waitForTimeout(3000);
  }

  // 2. Upload Profile Picture / Mascot Logo (Input 1)
  console.log('Uploading Profile Picture / Mascot Logo...');
  await fileInputs.nth(1).setInputFiles(LOGO_PATH);
  await page.waitForTimeout(3000);

  doneBtn = page.locator('#done-button, button:has-text("Done"), ytcp-button:has-text("Done")').first();
  if (await doneBtn.isVisible().catch(() => false)) {
    console.log('Clicking Done on Logo crop...');
    await doneBtn.click({ force: true });
    await page.waitForTimeout(3000);
  }

  // 3. Update Description schedule
  console.log('Updating Description with new schedule...');
  const descDiv = page.locator('#description-textbox #textbox').first();
  if (await descDiv.count() > 0) {
    await descDiv.scrollIntoViewIfNeeded();
    await page.evaluate((text) => {
      const el = document.querySelector('#description-textbox #textbox');
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, UPDATED_DESC);
    await page.waitForTimeout(1000);
  }

  // 4. Publish
  console.log('Publishing changes...');
  const pubBtn = page.locator('#publish-button, button:has-text("Publish")').first();
  const isEnabled = await pubBtn.isEnabled().catch(() => false);
  console.log('Publish button enabled:', isEnabled);
  if (isEnabled) {
    await pubBtn.click({ force: true });
    await page.waitForTimeout(5000);
    console.log('Published Channel 1 successfully!');
  } else {
    console.log('Publish button not enabled, taking screenshot...');
  }

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'c1_branding_published.png') });
  console.log('Channel 1 branding update complete!');
  process.exit(0);
})();
