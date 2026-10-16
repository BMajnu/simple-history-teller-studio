const { chromium } = require('playwright-core');

async function main() {
  console.log('--- CREATING CHANNEL 2: Simple History Teller Bangla (bmajnu981@gmail.com) ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  console.log('Opening studio for bmajnu981@gmail.com...');
  await page.goto('https://studio.youtube.com/?authuser=bmajnu981@gmail.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);

  await page.screenshot({ path: 'tools/c2_create_modal.png' });

  // Locate Name input
  console.log('Looking for Name and Handle inputs...');
  const nameInput = page.locator('input#input, #name-input input, input[aria-label*="Name"], input[aria-label*="নাম"], input').filter({ hasText: '' }).nth(0);
  
  // More specific search inside the dialog
  const dialog = page.locator('tp-yt-paper-dialog, ytd-channel-creation-dialog-renderer, #content-container').first();
  if (await dialog.count() > 0) {
    console.log('Found creation dialog');
    const inputs = dialog.locator('input');
    const count = await inputs.count();
    console.log(`Found ${count} inputs in dialog`);
    if (count >= 2) {
      // Input 0: Name
      await inputs.nth(0).click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await inputs.nth(0).fill('Simple History Teller Bangla');
      await page.waitForTimeout(500);

      // Input 1: Handle
      await inputs.nth(1).click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await inputs.nth(1).fill('SimpleHistoryTellerBangla');
      await page.waitForTimeout(1000);
    }
  }

  await page.screenshot({ path: 'tools/c2_modal_filled.png' });

  // Click "Create channel" button
  const createBtn = page.locator('button:has-text("Create channel"), ytcp-button:has-text("Create channel"), button:has-text("চ্যানেল তৈরি করুন")').first();
  if (await createBtn.count() > 0) {
    console.log('Clicking Create channel button...');
    await createBtn.click();
    await page.waitForTimeout(10000);
  }

  console.log('After creation URL:', page.url());
  await page.screenshot({ path: 'tools/c2_after_create.png' });

  await page.close();
}

main().catch(console.error);
