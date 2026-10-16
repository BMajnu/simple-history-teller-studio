/**
 * yt_studio_state_check.js
 * Opens Chrome, loads YouTube Studio and captures full page state + screenshots
 * to diagnose what's happening after navigation
 */

const { chromium } = require('playwright-core');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // 1. Go to YouTube Studio
  console.log('Going to YouTube Studio...');
  await page.goto('https://studio.youtube.com/', { waitUntil: 'networkidle', timeout: 60000 });
  console.log('Current URL:', page.url());
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tools/state_studio_home.png' });

  // 2. Get all channels listed on switch page
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body text (first 600 chars):', bodyText.substring(0, 600));

  // 3. Try going to English channel
  console.log('\nNavigating to EN channel...');
  await page.goto('https://studio.youtube.com/channel/UCvEQdVnctkuYZw3iNDo5krg', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tools/state_en_channel.png' });

  const enUrl = page.url();
  const enTitle = await page.title();
  console.log('EN URL:', enUrl);
  console.log('EN Page Title:', enTitle);

  const enEntityName = await page.evaluate(() => {
    const candidates = ['#entity-name', '#channel-title', 'ytcp-channel-name', '[aria-label*="Simple History"]'];
    for (const s of candidates) {
      const el = document.querySelector(s);
      if (el && el.textContent.trim()) return `${s}: "${el.textContent.trim()}"`;
    }
    return 'No entity name found';
  });
  console.log('EN entity name:', enEntityName);

  // Check what buttons exist
  const allButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, ytcp-button'))
      .filter(b => b.offsetWidth > 0)
      .slice(0, 30)
      .map(b => ({
        id: b.id,
        label: b.getAttribute('aria-label') || '',
        text: b.textContent.trim().substring(0, 25),
        visible: b.offsetWidth > 0
      }));
  });
  console.log('\nVisible buttons on EN channel page:');
  allButtons.forEach(b => console.log(`  id="${b.id}" label="${b.label}" text="${b.text}"`));

  // 4. Try to click upload button
  console.log('\nTrying to trigger upload...');
  // First wait for the full page to load
  await page.waitForTimeout(3000);

  // Look for create/upload button specifically
  const createIconVisible = await page.locator('#create-icon').isVisible().catch(() => false);
  const uploadBtnVisible = await page.locator('[aria-label="Create"]').isVisible().catch(() => false);
  const uploadTextVisible = await page.locator('ytcp-button:has-text("Upload")').first().isVisible().catch(() => false);
  console.log('#create-icon visible:', createIconVisible);
  console.log('[aria-label=Create] visible:', uploadBtnVisible);
  console.log('ytcp-button Upload visible:', uploadTextVisible);

  if (uploadBtnVisible) {
    console.log('Clicking Create button...');
    await page.locator('[aria-label="Create"]').first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tools/state_after_create_click.png' });

    const uploadVideosVisible = await page.locator('tp-yt-paper-item:has-text("Upload videos")').isVisible().catch(() => false);
    console.log('Upload videos dropdown item visible:', uploadVideosVisible);

    if (uploadVideosVisible) {
      console.log('Clicking Upload videos...');
      await page.locator('tp-yt-paper-item:has-text("Upload videos")').click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tools/state_upload_dialog.png' });

      const fileInputVisible = await page.locator('input[type="file"]').first().evaluate(el => el.isConnected).catch(() => false);
      console.log('File input in DOM:', fileInputVisible);
    }
  }

  await page.waitForTimeout(5000);
  await ctx.close();
  console.log('\nDiagnosis complete. Check screenshots in tools/state_*.png');
  process.exit(0);
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
