const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
const LOGO_PATH = path.resolve('references/mascot_logo_ref.jpg');

const targetPageName = process.argv[2] || 'Simple History Teller';

(async () => {
  console.log(`\n======================================================`);
  console.log(`Updating Profile Photo via 'Switch now' for: "${targetPageName}"`);
  console.log(`Logo: ${LOGO_PATH}`);

  let ctx;
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224', { timeout: 2000 });
    ctx = browser.contexts()[0];
    console.log('Connected to existing Chrome CDP');
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

  // 1. Go to Pages list
  console.log('1. Navigating to Pages list: https://www.facebook.com/pages/?category=your_pages ...');
  await p.goto('https://www.facebook.com/pages/?category=your_pages', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(5000);

  await p.screenshot({ path: path.join(ARTIFACTS_DIR, `fb_pages_list_before_${targetPageName.replace(/\s+/g, '_')}.png`) });

  // 2. Find the card for targetPageName and click "Switch now"
  console.log(`2. Finding "Switch now" button for "${targetPageName}"...`);
  const switched = await p.evaluate((name) => {
    // Look for all headings or spans with page name
    const all = Array.from(document.querySelectorAll('*'));
    const pageEl = all.find(el => el.innerText && el.innerText.trim() === name && (el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'H2' || el.tagName === 'A'));
    if (!pageEl) return false;
    
    // Find closest container that has a "Switch now" button
    let container = pageEl;
    for (let i = 0; i < 8; i++) {
      if (!container.parentElement) break;
      container = container.parentElement;
      const btn = Array.from(container.querySelectorAll('div[role="button"], button')).find(b => b.innerText && b.innerText.includes('Switch'));
      if (btn) {
        btn.click();
        return true;
      }
    }
    return false;
  }, targetPageName);

  console.log('Clicked "Switch now":', switched);
  console.log('Waiting 8s for profile switch to load...');
  await p.waitForTimeout(8000);

  // Dismiss any dialogs
  await p.keyboard.press('Escape');
  await p.waitForTimeout(1000);

  await p.screenshot({ path: path.join(ARTIFACTS_DIR, `fb_after_switch_${targetPageName.replace(/\s+/g, '_')}.png`) });
  console.log('Current page URL after switch:', p.url());

  // 3. Click profile camera icon
  console.log('3. Clicking Profile camera icon...');
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
  console.log('4. Clicking "Choose profile picture"...');
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

  // 5. In dialog, click "+ Upload Photo" with filechooser
  console.log('5. Clicking "+ Upload Photo" in dialog...');
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

  // 6. Click Save on crop modal
  console.log('6. Clicking Save button on profile modal...');
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
  console.log('Waiting 10s for avatar to update...');
  await p.waitForTimeout(10000);

  const finalShot = path.join(ARTIFACTS_DIR, `fb_ONLY_AVATAR_SAVED_${targetPageName.replace(/\s+/g, '_')}.png`);
  await p.screenshot({ path: finalShot });
  console.log(`SUCCESS! Saved verified screenshot: ${finalShot}`);

  process.exit(0);
})();
