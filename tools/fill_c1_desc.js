const { chromium } = require('playwright-core');

const CHANNEL_ID = 'UCvEQdVnctkuYZw3iNDo5krg';

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

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes(CHANNEL_ID) && p.url().includes('editing')) || context.pages()[0];
  await page.bringToFront();

  // Find description textarea
  const descArea = page.locator('textarea').first();
  await descArea.scrollIntoViewIfNeeded();
  await descArea.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await descArea.fill(DESCRIPTION);
  console.log('Filled English Description!');
  await page.waitForTimeout(1000);

  // Click Publish
  const pubBtn = page.getByRole('button', { name: 'Publish' }).or(page.locator('button:has-text("Publish")')).first();
  if (!(await pubBtn.isDisabled())) {
    await pubBtn.click();
    console.log('Clicked Publish!');
    await page.waitForTimeout(5000);
  }

  await page.screenshot({ path: 'tools/c1_desc_published.png' });
  console.log('Screenshot saved to tools/c1_desc_published.png');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
