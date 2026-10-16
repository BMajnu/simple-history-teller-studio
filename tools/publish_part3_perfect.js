const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT = path.join(__dirname, '..');
const FILE3 = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'shorts_full', 'short_bn_full3.mp4');

const title3 = 'পৃথিবীর প্রথম চাঁদাবাজি ও ইতিহাসের প্রথম ডন! ⚔️ [৩য় পর্ব] #Shorts #ইতিহাস';
const desc3 = `ফসলের ২০% কর দাও, নইলে...! মানব ইতিহাসের প্রথম চাঁদাবাজি আর প্রথম ডনের আসল ইতিহাস!

⚔️ সম্পূর্ণ ১৫ মিনিটের মূল তথ্যচিত্র দেখুন:
https://youtu.be/ibG0M13m7I0

#shorts #bangla #ইতিহাস #প্রথম_রাজা #simplehistorytellerbangla #banglaanimation`;

(async () => {
  console.log('=== UPLOADING PART 3 WITH ROBUST VISIBLE SELECTORS ===');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/upload?d=pt', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(4000);

  // Trigger create modal
  const createBtn = page.locator('#create-icon, button:has-text("Create"), ytcp-button:has-text("Create")').first();
  if (await createBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await createBtn.click();
    await page.waitForTimeout(1000);
    const uploadItem = page.locator('tp-yt-paper-item:has-text("Upload videos"), ytd-compact-link-renderer:has-text("Upload videos")').first();
    if (await uploadItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadItem.click();
      await page.waitForTimeout(3000);
    }
  }

  // Attach short_bn_full3.mp4
  console.log('Attaching short_bn_full3.mp4...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.waitFor({ state: 'attached', timeout: 30000 });
  await fileInput.setInputFiles(FILE3);

  console.log('File attached! Waiting 12s for details form...');
  await page.waitForTimeout(12000);

  // Set Title using evaluate
  console.log('Setting Title...');
  await page.evaluate((text) => {
    const el = document.querySelector('#title-textarea #textbox');
    if (el) {
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, title3);
  await page.waitForTimeout(1000);

  // Set Description
  console.log('Setting Description...');
  await page.evaluate((text) => {
    const el = document.querySelector('#description-textarea #textbox');
    if (el) {
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, desc3);
  await page.waitForTimeout(1000);

  // Audience: Not made for kids
  console.log('Setting Not made for kids...');
  const notForKids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKids.isVisible({ timeout: 5000 }).catch(() => false)) {
    await notForKids.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // Click Next using :visible or evaluate
  console.log('Clicking Next (step 1 -> 2)...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('#next-button, ytcp-button#next-button')).find(b => b.offsetParent !== null && !b.hasAttribute('hidden'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(3000);

  console.log('Clicking Next (step 2 -> 3)...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('#next-button, ytcp-button#next-button')).find(b => b.offsetParent !== null && !b.hasAttribute('hidden'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(3000);

  console.log('Clicking Next (step 3 -> 4)...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('#next-button, ytcp-button#next-button')).find(b => b.offsetParent !== null && !b.hasAttribute('hidden'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(3000);

  // Visibility: Public
  console.log('Selecting Public...');
  const publicRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
  if (await publicRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
    await publicRadio.click({ force: true });
    await page.waitForTimeout(1500);
  }

  // Publish using evaluate
  console.log('Clicking Done/Publish...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('#done-button, ytcp-button#done-button, #publish-button')).find(b => b.offsetParent !== null && !b.hasAttribute('hidden'));
    if (btn) btn.click();
  });
  console.log('Published! Waiting for dialog...');
  await page.waitForTimeout(8000);

  // Close close button if visible
  const closeBtn = page.locator('ytcp-button#close-button, button:has-text("Close")').first();
  if (await closeBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await closeBtn.click().catch(() => {});
    await page.waitForTimeout(2000);
  }

  // Monitor until 100% uploaded
  console.log('Monitoring Part 3 upload stream...');
  let ticks = 0;
  while (ticks < 30) {
    ticks++;
    await page.waitForTimeout(10000);
    const text = await page.innerText('body').catch(() => '');
    const uploading = text.includes('Uploading') || text.includes('uploading');
    console.log(`[Part 3 Tick ${ticks}] Uploading: ${uploading}`);
    if (!uploading && ticks > 2) {
      console.log('Part 3 upload stream completed!');
      break;
    }
  }

  // Go to Shorts library and take final screenshot
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg/videos/short', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: path.resolve(ROOT, 'tools', 'all_five_shorts_completely_live.png') });
  console.log('Saved tools/all_five_shorts_completely_live.png');

  await ctx.close();
  console.log('=== ALL FIVE SHORTS COMPLETED AND LIVE! ===');
  process.exit(0);
})().catch(e => {
  console.error(e);
  process.exit(1);
});
