const { chromium } = require('playwright-core');

const HINDI_KEYWORDS = 'Simple History Teller Hindi, सिंपल हिस्ट्री टेलर हिंदी, history in hindi, animated history hindi, world history in hindi, ancient history hindi, mysterious history, indian history, itihas, prachin itihas, historical documentaries hindi, oversimplified hindi, history facts, educational animation hindi';

async function configureSettings(page, keywords) {
  console.log('Clicking Settings item (#settings-item)...');
  const settingsItem = page.locator('#settings-item').first();
  await settingsItem.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'tools/settings_dialog_opened.png' });

  // Click Channel tab on the left inside settings modal
  console.log('Navigating to Channel tab inside settings...');
  const channelTab = page.locator('tp-yt-paper-tab:has-text("Channel"), [role="tab"]:has-text("Channel"), tp-yt-paper-item:has-text("Channel"), #menu paper-item:has-text("Channel")').first();
  if (await channelTab.count() > 0) {
    await channelTab.click();
    await page.waitForTimeout(2000);
  } else {
    // try clicking by text
    await page.getByRole('tab', { name: 'Channel' }).first().click().catch(() => {});
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tools/settings_channel_tab.png' });

  // Enter keywords
  console.log('Entering keywords...');
  const kwInput = page.locator('input[placeholder*="keywords"], input[placeholder*="Keywords"], #keywords-input input, input#text-input').first();
  if (await kwInput.count() > 0) {
    await kwInput.click();
    await kwInput.fill(keywords);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    console.log('Keywords entered successfully!');
  } else {
    console.log('Keyword input not found, searching textareas or inputs...');
    const anyInput = page.locator('ytcp-form-input-container input').first();
    if (await anyInput.count() > 0) {
      await anyInput.fill(keywords);
      await page.keyboard.press('Enter');
    }
  }

  // Click Advanced settings tab
  console.log('Clicking Advanced settings tab...');
  const advTab = page.locator('tp-yt-paper-tab:has-text("Advanced settings"), [role="tab"]:has-text("Advanced settings")').first();
  if (await advTab.count() > 0) {
    await advTab.click();
    await page.waitForTimeout(1500);
  } else {
    await page.getByRole('tab', { name: /Advanced/i }).first().click().catch(() => {});
    await page.waitForTimeout(1500);
  }

  await page.screenshot({ path: 'tools/settings_advanced_tab.png' });

  // Select "No, set this channel as not made for kids"
  console.log('Selecting "Not made for kids"...');
  const notForKids = page.locator('tp-yt-paper-radio-button[name="NOT_MADE_FOR_KIDS"], [role="radio"]:has-text("not made for kids"), [role="radio"]:has-text("kids")').first();
  if (await notForKids.count() > 0) {
    await notForKids.click();
    await page.waitForTimeout(1000);
    console.log('Selected not made for kids!');
  } else {
    // Try radio button matching by text
    const radio2 = page.locator('tp-yt-paper-radio-button').nth(1);
    if (await radio2.count() > 0) {
      await radio2.click();
      console.log('Clicked 2nd radio option!');
      await page.waitForTimeout(1000);
    }
  }

  await page.screenshot({ path: 'tools/settings_before_save.png' });

  // Click Save button
  console.log('Clicking Save button...');
  const saveBtn = page.locator('ytcp-button#save-button, button:has-text("Save")').first();
  if (await saveBtn.count() > 0 && !(await saveBtn.isDisabled())) {
    await saveBtn.click();
    console.log('Settings Saved!');
    await page.waitForTimeout(4000);
  } else {
    console.log('Save button disabled or already saved.');
  }

  await page.screenshot({ path: 'tools/settings_saved_done.png' });
}

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('editing')) || context.pages()[0];
  
  await configureSettings(page, HINDI_KEYWORDS);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
