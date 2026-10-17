// Audits slot->account mapping for a persistent AI Studio profile.
// For each u/0..u/7: open AI Studio, try to read the logged-in email from the
// profile chip (aria-label) or account-chooser overlay, print the map.
//
// Usage: node tools/audit_profile_slots.js [profile_dir]
const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = process.argv[2]
  || path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile_2');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const KNOWN_EMAILS = [
  'bmajnu981@gmail.com',
  'badiuzzaman.majnu1@gmail.com',
  'bmajnu980@gmail.com',
  'bmajnu9811@gmail.com',
  'badiuzzaman.majnu123@gmail.com',
  'majnu.charitabari@gmail.com',
  'badiuzzaman.majnu@gmail.com',
  'msrosyafrin@gmail.com'
];

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--headless=new', '--disable-blink-features=AutomationControlled', '--no-sandbox', '--window-size=1280,800'],
    viewport: { width: 1280, height: 800 }
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  for (let n = 0; n <= 7; n++) {
    let found = '??';
    try {
      await page.goto(`https://aistudio.google.com/u/${n}/generate-speech?model=gemini-3.8-flash-lite-tts`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3500);

      // Strategy A: aria-label carrying an email
      let label = await page.evaluate(() => {
        const el = document.querySelector('[aria-label*="@"]');
        return el ? (el.getAttribute('aria-label') || '') : '';
      }).catch(() => '');
      let m = (label || '').match(/[\w.+-]+@[\w-]+\.[\w.]+/);
      if (!m) {
        // Strategy B: open the account chip menu and scan overlay text
        const chip = page.locator('[aria-label*="Google Account"], #profile-button, img[alt*="Google Account"], img[alt*="account"]').first();
        if (await chip.count() > 0) {
          await chip.click().catch(() => {});
          await page.waitForTimeout(1200);
          const txt = await page.evaluate(() => (document.querySelector('.cdk-overlay-container, [role="menu"], [role="dialog"]') || {}).innerText || '')
            .catch(() => '');
          m = (txt || '').match(/[\w.+-]+@[\w-]+\.[\w.]+/);
          await page.keyboard.press('Escape');
        }
      }
      if (!m) {
        // Strategy C: check for sign-in wall
        const signIn = await page.evaluate(() => /Sign in|登入|登录/i.test(document.body.innerText.slice(0, 3000))).catch(() => false);
        found = signIn ? '(not signed in)' : '??';
      }
      if (m) found = m[0];
      const known = KNOWN_EMAILS.includes(found) ? '' : ' [UNKNOWN-EMAIL]';
      console.log(`u/${n}: ${found}${known}`);
    } catch (e) {
      console.log(`u/${n}: ERROR ${e.message.slice(0, 60)}`);
    }
  }

  await ctx.close();
  process.exit(0);
})();
