const { chromium } = require('playwright-core');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const THUMB_PATH = 'D:\\Developing Projects\\Itihash Explainer Video\\projects\\sample_first_king\\metadata\\shorts_full\\thumb_full_part3.jpg';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled'
    ],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://studio.youtube.com/video/jg48SOofyDk/edit', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Scroll down
  await page.evaluate(() => {
    const m = document.querySelector('main#main');
    if (m) m.scrollTop = 450;
  });
  await page.waitForTimeout(1000);

  // Set file on input#file-loader
  const fileLoader = page.locator('input#file-loader').first();
  await fileLoader.setInputFiles(THUMB_PATH);
  await page.waitForTimeout(3000);

  // Click NEXT button in dialog
  const nextBtn = page.locator('button:has-text("Next"), ytcp-button:has-text("Next"), #next-button, ytcp-button#next-button').first();
  console.log('Next button visible:', await nextBtn.isVisible({ timeout: 5000 }).catch(() => false));
  await nextBtn.click({ force: true });
  await page.waitForTimeout(4000);

  // Take screenshot of step 2
  await page.screenshot({ path: 'tools/verification_step2_details.png' });
  console.log('Saved tools/verification_step2_details.png');

  const dialogText = await page.locator('ytcp-dialog, [role="dialog"]').first().innerText().catch(() => '');
  console.log('Step 2 Dialog text:\n', dialogText);

  await ctx.close();
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
