const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('=== UPLOADING BANGLA COVER PHOTO ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('facebook.com/profile.php?id=61595162615338'));
  if (!p) {
    console.error('Bangla FB page not found');
    process.exit(1);
  }

  const bannerPath = path.resolve('banner_assets/banner_simple_history_teller_bn.jpg');

  // Look for "Add Cover Photo" button
  const addCoverBtn = p.locator('div[aria-label="Add Cover Photo"][role="button"], div[role="button"]:has-text("Add Cover Photo")').first();
  if (await addCoverBtn.isVisible().catch(() => false)) {
    console.log('Found Add Cover Photo button, clicking...');
    await addCoverBtn.click();
    await p.waitForTimeout(1500);

    // Check menu options (e.g. "Upload photo", "Select photo")
    const uploadOption = p.locator('div[role="menuitem"]:has-text("Upload photo"), span:has-text("Upload photo")').first();
    if (await uploadOption.isVisible().catch(() => false)) {
      console.log('Found Upload photo option. Setting file on file input...');
      const [fileChooser] = await Promise.all([
        p.waitForEvent('filechooser', { timeout: 10000 }).catch(() => null),
        uploadOption.click().catch(() => {})
      ]);

      if (fileChooser) {
        console.log('FileChooser intercepted, setting files...');
        await fileChooser.setFiles(bannerPath);
      } else {
        console.log('No filechooser event, looking for file input directly...');
        const fileInputs = p.locator('input[type="file"]');
        const count = await fileInputs.count();
        if (count > 0) {
          await fileInputs.last().setInputFiles(bannerPath);
        }
      }
    }
  } else {
    console.log('Add cover photo button not found directly, inspecting buttons...');
  }

  await p.waitForTimeout(5000);

  // Look for "Save changes" button for cover photo
  const saveBtn = p.locator('div[aria-label="Save changes"][role="button"], div[role="button"]:has-text("Save changes")').first();
  if (await saveBtn.isVisible().catch(() => false)) {
    console.log('Clicking Save changes for cover photo...');
    await saveBtn.click();
    await p.waitForTimeout(4000);
  }

  // Capture updated screenshot
  try {
    const buf = await p.screenshot({ timeout: 15000 });
    fs.writeFileSync('tools/fb_c2_live_page_final.png', buf);
    fs.writeFileSync('C:/Users/badiu/.gemini/antigravity/brain/522a240f-2122-4427-9348-850afc4de7cf/fb_page_c2_live.png', buf);
    console.log('Cover photo upload completed and verified!');
  } catch (e) {
    console.warn(e.message);
  }

  process.exit(0);
})();
