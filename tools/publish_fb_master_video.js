const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9225');
  const page = browser.contexts()[0].pages()[0];
  await page.bringToFront();

  console.log('Step 1: Clicking Next button...');
  const nextBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Next"), div[role="dialog"] button:has-text("Next")').first();
  if (await nextBtn.isVisible().catch(() => false)) {
    console.log('Next button found, clicking...');
    await nextBtn.click();
    await page.waitForTimeout(3000);
  } else {
    console.log('Next button not visible, checking Post button...');
  }

  await page.screenshot({ path: 'tools/after_next_click.png' });
  console.log('Saved tools/after_next_click.png');

  // Look for Post button
  const postBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Post"), div[role="button"]:has-text("Post"), button:has-text("Post")').first();
  if (await postBtn.isVisible().catch(() => false)) {
    console.log('Step 2: Clicking Post button...');
    await postBtn.click();
    console.log('Clicked Post! Monitoring upload...');
  }

  // Wait for upload / posting to finish (up to 60 seconds)
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(2000);
    const dialogs = await page.locator('div[role="dialog"]').count();
    const hasUploading = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Uploading') || text.includes('Processing') || text.includes('Posting');
    });
    console.log(`Poll ${i + 1}: dialogs=${dialogs}, uploading=${hasUploading}`);
    if (dialogs === 0 && !hasUploading) {
      console.log('Post dialog closed and uploading completed!');
      break;
    }
  }

  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'tools/fb_master_posted_state.png' });
  console.log('Saved tools/fb_master_posted_state.png');

  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
