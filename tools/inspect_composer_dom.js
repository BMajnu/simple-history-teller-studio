const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

(async () => {
  const browser = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const p = browser.pages()[0] || await browser.newPage();
  console.log('Navigating to Meta Business Suite Composer...');
  await p.goto('https://business.facebook.com/latest/composer', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await p.waitForTimeout(5000);

  const fileInputs = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('input[type="file"]')).map(el => ({
      accept: el.accept,
      multiple: el.multiple,
      name: el.name,
      id: el.id,
      className: el.className
    }));
  });
  console.log('File inputs on page:', fileInputs);

  // Check buttons related to add photo/video
  const mediaButtons = await p.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, div[role="button"]'));
    return btns.filter(b => (b.innerText || '').toLowerCase().includes('photo') || (b.innerText || '').toLowerCase().includes('video')).map(b => ({
      text: b.innerText,
      tag: b.tagName,
      role: b.getAttribute('role')
    }));
  });
  console.log('Media buttons:', mediaButtons);

  // Check Schedule toggle
  const scheduleElements = await p.evaluate(() => {
    const els = Array.from(document.querySelectorAll('*'));
    return els.filter(el => (el.innerText || '').toLowerCase().includes('schedule') && el.children.length === 0).map(el => ({
      text: el.innerText,
      tag: el.tagName
    })).slice(0, 10);
  });
  console.log('Schedule elements:', scheduleElements);

  // Check Post to dropdown
  const postToElements = await p.evaluate(() => {
    const postTo = Array.from(document.querySelectorAll('*')).find(el => el.innerText === 'Post to');
    return postTo ? { found: true, parentHTML: postTo.parentElement.innerHTML.slice(0, 500) } : { found: false };
  });
  console.log('Post to info:', postToElements);

  await browser.close();
  process.exit(0);
})();
