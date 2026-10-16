const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const uploadPage = ctx.pages().find(p => p.url().includes('studio.youtube.com'));
  if (!uploadPage) {
    console.error('No upload page found');
    process.exit(1);
  }

  await uploadPage.screenshot({ path: 'tools/current_upload_state.png' });
  console.log('Saved tools/current_upload_state.png');

  // Let's click Public radio button to ensure it is selected
  const publicRadio = uploadPage.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
  if (await publicRadio.isVisible().catch(() => false)) {
    await publicRadio.click({ force: true }).catch(() => {});
    console.log('Public radio clicked again to ensure.');
  }

  // Click Save/Publish button (#done-button)
  const doneBtn = uploadPage.locator('#done-button').first();
  if (await doneBtn.isVisible().catch(() => false)) {
    console.log('Clicking Save / Publish button (#done-button)...');
    await doneBtn.click({ force: true });
    await uploadPage.waitForTimeout(6000);
    await uploadPage.screenshot({ path: 'tools/after_save_clicked.png' });
    console.log('Saved tools/after_save_clicked.png');
  }

  process.exit(0);
})().catch(console.error);
