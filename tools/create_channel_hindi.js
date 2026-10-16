const { chromium } = require('playwright-core');

async function main() {
  console.log('--- CREATING CHANNEL 3: Simple History Teller Hindi ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  await page.goto('https://www.youtube.com/?authuser=bmajnu9811@gmail.com', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click avatar
  const avatar = page.locator('#avatar-btn, button#avatar-btn').first();
  await avatar.click();
  await page.waitForTimeout(1500);

  // Click "Create a channel" link
  const link = page.locator('a:has-text("Create a channel"), a:has-text("একটি চ্যানেল তৈরি করুন")').first();
  console.log('Clicking Create a channel link...');
  await link.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'tools/c3_modal_opened.png' });

  // Now find the inputs in the modal
  const dialog = page.locator('tp-yt-paper-dialog, ytd-channel-creation-dialog-renderer').first();
  if (await dialog.count() > 0) {
    const inputs = dialog.locator('input');
    console.log(`Found ${await inputs.count()} inputs in dialog`);
    
    // Name
    await inputs.nth(0).click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await inputs.nth(0).fill('Simple History Teller Hindi');
    await page.waitForTimeout(500);

    // Handle
    await inputs.nth(1).click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await inputs.nth(1).fill('SimpleHistoryTellerHindi');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'tools/c3_modal_ready.png' });

    // Click Create channel button
    const createBtn = dialog.locator('button:has-text("Create channel"), ytcp-button:has-text("Create channel")').first();
    console.log('Clicking Create channel button...');
    await createBtn.click();
    await page.waitForTimeout(10000);
  }

  await page.screenshot({ path: 'tools/c3_after_channel_created.png' });
  console.log('Current URL after create:', page.url());
  await page.close();
}

main().catch(console.error);
