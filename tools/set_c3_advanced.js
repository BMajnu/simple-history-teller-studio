const { chromium } = require('playwright-core');

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('editing')) || context.pages()[0];
  
  // Click Advanced settings
  console.log('Clicking Advanced settings...');
  const advTab = page.locator('ytcp-primary-action-bar span:has-text("Advanced settings"), ytcp-primary-action-bar :text("Advanced settings")').first();
  await advTab.click();
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'tools/c3_advanced_tab_active.png' });

  // Inspect radio buttons
  const radios = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('tp-yt-paper-radio-button, [role="radio"]')).map(r => ({
      name: r.getAttribute('name'),
      text: r.innerText.trim(),
      checked: r.getAttribute('aria-checked')
    }));
  });
  console.log('Radio buttons:', radios);

  // Click NOT_MADE_FOR_KIDS radio
  const notKids = page.locator('tp-yt-paper-radio-button[name="NOT_MADE_FOR_KIDS"], [role="radio"]:has-text("No, set this channel as not made for kids")').first();
  if (await notKids.count() > 0) {
    await notKids.click();
    console.log('Clicked NOT_MADE_FOR_KIDS radio!');
    await page.waitForTimeout(1000);
  }

  // Click Save button
  console.log('Clicking Save button in dialog...');
  const saveBtn = page.locator('ytcp-button#save-button button, button:has-text("Save")').first();
  await saveBtn.click();
  await page.waitForTimeout(4000);
  console.log('Saved settings successfully!');

  await page.screenshot({ path: 'tools/c3_settings_final_saved.png' });
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
