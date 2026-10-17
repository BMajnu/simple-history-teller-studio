const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.resolve('references/mascot_logo_ref.jpg');

async function updatePageProfile(p, pageName, pageUrl) {
  console.log(`\n======================================================`);
  console.log(`UPDATING PROFILE PHOTO FOR: "${pageName}"`);
  console.log(`Page URL: ${pageUrl}`);

  // 1. Navigate directly to the page URL
  await p.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(5000);

  // 2. If there is a Switch button, click it to act as the page
  console.log('Checking for Switch button...');
  const switchBtns = p.locator('div[role="button"]:has-text("Switch")');
  const count = await switchBtns.count();
  for (let i = 0; i < count; i++) {
    const text = (await switchBtns.nth(i).innerText().catch(() => '')).trim();
    if (text === 'Switch' || text.startsWith('Switch into')) {
      console.log(`Found switch button: "${text}", clicking...`);
      await switchBtns.nth(i).click();
      console.log('Waiting 8s for profile switch...');
      await p.waitForTimeout(8000);
      break;
    }
  }

  // Dismiss any tours / overlays
  await p.keyboard.press('Escape');
  await p.waitForTimeout(1000);

  // 3. Click the profile picture camera icon
  console.log('Clicking profile picture camera icon...');
  const cameraClicked = await p.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="button"]'));
    const cam = btns.find(b => {
      const a = (b.getAttribute('aria-label') || '').toLowerCase();
      return a.includes('profile') && (a.includes('picture') || a.includes('photo') || a.includes('update') || a.includes('actions'));
    });
    if (cam) {
      cam.click();
      return true;
    }
    return false;
  });
  console.log('Camera icon clicked:', cameraClicked);
  await p.waitForTimeout(2500);

  // 4. Click "Choose profile picture"
  console.log('Clicking "Choose profile picture"...');
  const chooseClicked = await p.evaluate(() => {
    const items = Array.from(document.querySelectorAll('div[role="menuitem"], span, div[role="button"]'));
    const c = items.find(i => i.innerText && i.innerText.trim() === 'Choose profile picture');
    if (c) {
      c.click();
      return true;
    }
    return false;
  });
  console.log('Choose profile picture clicked:', chooseClicked);
  await p.waitForTimeout(3000);

  // 5. In the "Choose profile picture" dialog, click "+ Upload Photo" with filechooser
  console.log('Locating "+ Upload Photo" in dialog...');
  const uploadBtn = p.locator('div[role="dialog"] div[role="button"]:has-text("Upload Photo"), div[role="dialog"] span:has-text("Upload Photo")').first();

  if (await uploadBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Found "+ Upload Photo", intercepting filechooser...');
    const [fileChooser] = await Promise.all([
      p.waitForEvent('filechooser', { timeout: 10000 }),
      uploadBtn.click()
    ]);
    console.log('Setting mascot logo file...');
    await fileChooser.setFiles(LOGO_PATH);
  } else {
    console.log('Trying evaluate click for Upload Photo...');
    const [fileChooser] = await Promise.all([
      p.waitForEvent('filechooser', { timeout: 10000 }),
      p.evaluate(() => {
        const dialog = document.querySelector('div[role="dialog"]');
        if (!dialog) return false;
        const b = Array.from(dialog.querySelectorAll('div[role="button"], span')).find(el => el.innerText && el.innerText.includes('Upload Photo'));
        if (b) {
          b.click();
          return true;
        }
        return false;
      })
    ]);
    await fileChooser.setFiles(LOGO_PATH);
  }

  console.log('File selected! Waiting 6s for crop modal...');
  await p.waitForTimeout(6000);

  // 6. Click Save on the crop modal
  console.log('Clicking Save button on crop modal...');
  const saved = await p.evaluate(() => {
    const dialog = document.querySelector('div[role="dialog"]');
    if (!dialog) return false;
    const btns = Array.from(dialog.querySelectorAll('div[role="button"], button'));
    const s = btns.find(b => b.innerText && b.innerText.trim() === 'Save');
    if (s) {
      s.click();
      return true;
    }
    return false;
  });

  console.log('Save button clicked:', saved);
  console.log('Waiting 10s for avatar to update on Facebook...');
  await p.waitForTimeout(10000);

  const shotPath = path.join(ARTIFACTS_DIR, `fb_ONLY_AVATAR_SAVED_${pageName.replace(/\s+/g, '_')}.png`);
  await p.screenshot({ path: shotPath });
  console.log(`Saved screenshot: ${shotPath}`);
}

(async () => {
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
    console.log('Launched persistent Chrome');
  }

  const p = ctx.pages()[0] || await ctx.newPage();

  // 1. Process English page: Simple History Teller (61595615845321)
  await updatePageProfile(p, 'Simple History Teller', 'https://www.facebook.com/61595615845321');
  await p.waitForTimeout(4000);

  // 2. Process Hindi page: Simple History Teller Hindi (61595609815699)
  await updatePageProfile(p, 'Simple History Teller Hindi', 'https://www.facebook.com/61595609815699');
  await p.waitForTimeout(4000);

  // 3. Final verification on Pages overview
  console.log('\nNavigating to Pages overview for final verification...');
  await p.goto('https://www.facebook.com/pages/?category=your_pages', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(6000);

  const allPagesShot = path.join(ARTIFACTS_DIR, 'fb_ALL_THREE_PAGES_WITH_NEW_LOGO.png');
  await p.screenshot({ path: allPagesShot });
  console.log(`FINAL SCREENSHOT SAVED: ${allPagesShot}`);

  process.exit(0);
})();
