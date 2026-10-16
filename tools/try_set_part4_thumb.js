const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const THUMB_PATH = path.resolve('projects/sample_first_king/metadata/shorts_full/thumb_full_part4.jpg');

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  console.log('Navigating to Part 4 edit page: https://studio.youtube.com/video/Kuc5FRoYJW0/edit');
  await page.goto('https://studio.youtube.com/video/Kuc5FRoYJW0/edit', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Scroll main container to see thumbnail section
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 500;
  });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'tools/part4_edit_before.png' });
  console.log('Saved tools/part4_edit_before.png');

  // Check file input or upload button
  const fileInput = await page.$('input#file-loader, input[type="file"][accept*="image"]');
  console.log('File input found:', !!fileInput);

  if (fileInput) {
    console.log('Setting input files for Part 4 thumbnail...');
    await fileInput.setInputFiles(THUMB_PATH);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tools/part4_after_upload_try.png' });
    console.log('Saved tools/part4_after_upload_try.png');
  }

  // Check if save button is enabled
  const saveBtn = await page.$('#save-button:not([disabled])');
  console.log('Save button enabled:', !!saveBtn);
  if (saveBtn) {
    console.log('Clicking Save button...');
    await saveBtn.click();
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'tools/part4_after_save.png' });
  }

  // Check for any modal or toast
  const dialog = await page.$('ytcp-dialog, ytcp-modal-dialog');
  if (dialog) {
    console.log('Modal dialog is present!');
    const dialogText = await page.evaluate(d => d.innerText, dialog);
    console.log('Dialog text:', dialogText);
  }

  await ctx.close();
})();
