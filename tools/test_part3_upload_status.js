const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const VIDEO_PATH = path.resolve('projects/sample_first_king/renders/shorts_full/short_bn_full3.mp4');

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Check if there is an abandoned video row with "Delete video"
  const deleteBtn = page.locator('button:has-text("Delete video"), ytcp-button:has-text("Delete video")').first();
  if (await deleteBtn.isVisible().catch(() => false)) {
    console.log('Found "Delete video" button on abandoned draft. Clicking it...');
    await deleteBtn.click();
    await page.waitForTimeout(2000);

    // Confirm delete in dialog if any
    const confirmDelete = page.locator('ytcp-dialog button:has-text("Delete forever"), ytcp-dialog button:has-text("Delete video"), ytcp-dialog #confirm-button').first();
    const checkbox = page.locator('ytcp-dialog ytcp-checkbox, ytcp-dialog paper-checkbox').first();
    if (await checkbox.isVisible().catch(() => false)) {
      await checkbox.click();
      await page.waitForTimeout(1000);
    }
    if (await confirmDelete.isVisible().catch(() => false)) {
      await confirmDelete.click();
      await page.waitForTimeout(3000);
      console.log('Deleted abandoned draft.');
    }
  }

  // Now click Create -> Upload videos
  console.log('Opening Create -> Upload videos...');
  const createBtn = page.locator('#create-icon, button:has-text("Create"), ytcp-button:has-text("Create")').first();
  await createBtn.click();
  await page.waitForTimeout(1000);

  const uploadOpt = page.locator('paper-item:has-text("Upload videos"), ytcp-text-menu paper-item:first-child').first();
  await uploadOpt.click();
  await page.waitForTimeout(3000);

  // Set file
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(VIDEO_PATH);
  console.log('Selected short_bn_full3.mp4 for upload. Waiting 8s...');
  await page.waitForTimeout(8000);

  await page.screenshot({ path: 'tools/part3_upload_check.png' });
  console.log('Saved tools/part3_upload_check.png');

  // Check if Daily limit banner or next button is disabled
  const bodyText = await page.innerText('body');
  const hasDailyLimit = bodyText.includes('Daily limit reached');
  console.log('Has "Daily limit reached" banner:', hasDailyLimit);

  const nextBtn = page.locator('#next-button');
  const nextVisible = await nextBtn.isVisible().catch(() => false);
  const nextHidden = await nextBtn.getAttribute('hidden') !== null;
  console.log('Next button visible:', nextVisible, 'hidden:', nextHidden);

  await ctx.close();
})();
