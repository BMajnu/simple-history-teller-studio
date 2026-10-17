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

  // 1. Inspect "Post to" dropdown
  const postToTrigger = await p.locator('div[role="heading"]:has-text("Post to")').locator('..').locator('..').locator('..');
  console.log('Clicking post to selector...');
  const selectorBtn = await p.locator('[aria-haspopup="listbox"], [role="combobox"], div[aria-expanded]').first();
  if (await selectorBtn.count() > 0) {
    console.log('Found selector button, clicking...');
    await selectorBtn.click();
    await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(ARTIFACTS_DIR, 'composer_post_to_open.png') });
    const options = await p.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[role="option"], [role="menuitemcheckbox"], [role="checkbox"], div[role="menuitem"]'));
      return items.map(el => ({ text: el.innerText.replace(/\n/g, ' '), role: el.getAttribute('role') }));
    });
    console.log('Post to options:', options);
  }

  // 2. Inspect Schedule section
  console.log('Looking for Schedule toggle...');
  const scheduleToggle = await p.locator('text="Set date and time"').locator('..').locator('input[type="checkbox"], [role="switch"], [role="checkbox"]').first();
  if (await scheduleToggle.count() > 0) {
    console.log('Found schedule toggle switch, clicking...');
    await scheduleToggle.click();
    await p.waitForTimeout(2000);
    await p.screenshot({ path: path.join(ARTIFACTS_DIR, 'composer_schedule_toggled.png') });
  } else {
    // Try finding by text or adjacent elements
    const toggleAlt = await p.locator('[role="switch"]').first();
    if (await toggleAlt.count() > 0) {
      console.log('Found generic switch, clicking...');
      await toggleAlt.click();
      await p.waitForTimeout(2000);
      await p.screenshot({ path: path.join(ARTIFACTS_DIR, 'composer_schedule_toggled.png') });
    }
  }

  // Inspect inputs after toggle
  const scheduleInputs = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(i => ({
      type: i.type,
      placeholder: i.placeholder,
      value: i.value,
      ariaLabel: i.getAttribute('aria-label')
    }));
  });
  console.log('Inputs on page:', scheduleInputs);

  await browser.close();
  process.exit(0);
})();
