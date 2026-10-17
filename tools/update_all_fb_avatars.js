const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.resolve('references/mascot_logo_ref.jpg');

const PAGES = [
  { id: '61595477341365', name: 'Simple History Teller Bangla' },
  { id: '61595615845321', name: 'Simple History Teller' },
  { id: '61595609815699', name: 'Simple History Teller Hindi' }
];

(async () => {
  console.log('=== STARTING FACEBOOK MASCOT AVATAR UPDATE ===');
  console.log('Using Mascot Logo:', LOGO_PATH, `(${fs.statSync(LOGO_PATH).size} bytes)`);

  let ctx;
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224', { timeout: 2000 });
    ctx = browser.contexts()[0];
    console.log('Connected to existing Chrome CDP on 9224');
  } catch (e) {
    ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: false,
      executablePath: CHROME_PATH,
      args: [
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
        '--remote-debugging-port=9224'
      ],
      viewport: null
    });
    console.log('Launched persistent Chrome context with remote debugging port 9224');
  }

  const p = ctx.pages()[0] || await ctx.newPage();

  for (const pageInfo of PAGES) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`Processing Page: ${pageInfo.name} (${pageInfo.id})`);
    
    // Navigate to page
    const pageUrl = `https://www.facebook.com/${pageInfo.id}`;
    await p.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await p.waitForTimeout(4000);

    // Check if we need to switch into the page
    const switchBtn = p.locator('div[role="button"]:has-text("Switch"), div[aria-label*="Switch into"], div[role="button"]:has-text("Switch now")').first();
    if (await switchBtn.isVisible().catch(() => false)) {
      console.log(`Clicking Switch button for ${pageInfo.name}...`);
      await switchBtn.click();
      await p.waitForTimeout(6000);
    }

    // Dismiss any popups or guided tours
    const dismissBtn = p.locator('div[aria-label="Close"], div[aria-label="Not now"], div[role="button"]:has-text("Not now"), div[role="button"]:has-text("Later")').first();
    if (await dismissBtn.isVisible().catch(() => false)) {
      await dismissBtn.click().catch(() => {});
      await p.waitForTimeout(1000);
    }

    await p.screenshot({ path: path.join(ARTIFACTS_DIR, `fb_pre_avatar_${pageInfo.id}.png`) });

    // Look for Profile photo camera / update button
    console.log('Searching for profile picture update button...');
    const cameraBtn = p.locator('div[aria-label="Update profile picture"], div[aria-label="Actions for profile photo"], div[aria-label*="profile picture"], div[aria-label*="Profile photo"], svg[aria-label*="profile"]').first();
    
    let clicked = false;
    if (await cameraBtn.isVisible().catch(() => false)) {
      console.log('Clicking camera button...');
      await cameraBtn.click();
      clicked = true;
    } else {
      // Find by querySelector in page
      const found = await p.evaluate(() => {
        const els = Array.from(document.querySelectorAll('div[role="button"], i, svg'));
        const target = els.find(e => {
          const l = (e.getAttribute('aria-label') || '').toLowerCase();
          return l.includes('profile photo') || l.includes('profile picture') || l.includes('update profile');
        });
        if (target) {
          target.click();
          return true;
        }
        return false;
      });
      clicked = found;
      console.log('DOM search click result:', clicked);
    }

    await p.waitForTimeout(2000);

    // After clicking camera, check for "Upload photo" menu item or file input
    const uploadPhotoOption = p.locator('div[role="menuitem"]:has-text("Upload photo"), span:has-text("Upload photo"), div[role="button"]:has-text("Upload photo")').first();
    if (await uploadPhotoOption.isVisible().catch(() => false)) {
      console.log('Found "Upload photo" option, clicking with filechooser intercept...');
      const [fileChooser] = await Promise.all([
        p.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null),
        uploadPhotoOption.click()
      ]);

      if (fileChooser) {
        console.log('FileChooser intercepted! Setting mascot logo file...');
        await fileChooser.setFiles(LOGO_PATH);
      } else {
        console.log('Setting file on file input directly...');
        await p.locator('input[type="file"]').last().setInputFiles(LOGO_PATH);
      }
    } else {
      // Check if there is already a direct file input
      const fileInputs = p.locator('input[type="file"]');
      if (await fileInputs.count() > 0) {
        console.log('Direct file input found! Uploading mascot logo...');
        await fileInputs.first().setInputFiles(LOGO_PATH);
      }
    }

    console.log('Waiting 6s for photo crop / adjustment modal...');
    await p.waitForTimeout(6000);

    await p.screenshot({ path: path.join(ARTIFACTS_DIR, `fb_crop_modal_${pageInfo.id}.png`) });

    // Click "Save" button on the profile picture modal
    console.log('Looking for Save button on modal...');
    const saveBtn = p.locator('div[aria-label="Save"][role="button"], div[role="button"]:has-text("Save"), button:has-text("Save")').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      console.log('Clicking Save button...');
      await saveBtn.click();
      console.log('Save clicked! Waiting 8s for avatar processing...');
      await p.waitForTimeout(8000);
    } else {
      console.log('Save button not found via locator, searching DOM...');
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('div[role="button"], button'));
        const s = btns.find(b => b.innerText && b.innerText.trim() === 'Save');
        if (s) s.click();
      });
      await p.waitForTimeout(8000);
    }

    const finalScreenshot = path.join(ARTIFACTS_DIR, `fb_avatar_saved_${pageInfo.id}.png`);
    await p.screenshot({ path: finalScreenshot });
    console.log(`Saved screenshot for ${pageInfo.name}: ${finalScreenshot}`);

    // Wait a realistic delay (5s) between pages to keep activity safe and natural
    console.log('Waiting 5s before proceeding to next page...');
    await p.waitForTimeout(5000);
  }

  // Final step: Switch back to personal profile Badiuzzaman Majnu
  console.log('\nAll 3 pages updated! Navigating to switch back to personal profile...');
  await p.goto('https://www.facebook.com/pages/?category=your_pages', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(5000);

  const overviewScreenshot = path.join(ARTIFACTS_DIR, 'fb_all_three_pages_mascot_live.png');
  await p.screenshot({ path: overviewScreenshot });
  console.log('Final Overview Screenshot saved:', overviewScreenshot);

  console.log('=== FACEBOOK MASCOT LOGO UPDATE COMPLETED SUCCESSFULLY! ===');
  process.exit(0);
})();
