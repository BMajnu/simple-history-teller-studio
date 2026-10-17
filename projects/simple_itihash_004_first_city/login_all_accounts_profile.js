// Adds all Google accounts as sessions into a SEPARATE persistent Chrome
// profile, so two automation sessions can run simultaneously (one per profile).
// Default target: chrome_aistudio_profile_2 (does not touch profile / profile_3).
//
// Run:   node tools/login_all_accounts_profile.js
// Env:   LOGIN_PROFILE_DIR=path\to\profile  (optional override)
const { chromium } = require('playwright-core');
const path = require('path');

const LOGIN_PROFILE_DIR = process.env.LOGIN_PROFILE_DIR
  || path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile_2');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ACCOUNTS = [
  { email: 'bmajnu981@gmail.com', pass: 'M@jnu786' },
  { email: 'badiuzzaman.majnu1@gmail.com', pass: 'majnu786' },
  { email: 'bmajnu980@gmail.com', pass: 'M@jnu786' },
  { email: 'bmajnu9811@gmail.com', pass: 'M@jnu786' },
  { email: 'badiuzzaman.majnu123@gmail.com', pass: 'majnu786' },
  { email: 'majnu.charitabari@gmail.com', pass: 'majnu786' },
  { email: 'badiuzzaman.majnu@gmail.com', pass: 'BMajnu78650' }
];

async function humanType(page, text) {
  for (const char of text) {
    await page.keyboard.type(char, { delay: Math.floor(Math.random() * 60) + 30 });
  }
}

(async () => {
  console.log(`Logging ${ACCOUNTS.length} accounts into NEW profile: ${LOGIN_PROFILE_DIR}`);
  const ctx = await chromium.launchPersistentContext(LOGIN_PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: [
      '--headless=new',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars',
      '--window-size=1280,800',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    ],
    viewport: { width: 1280, height: 800 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    window.chrome = {
      app: { isInstalled: false },
      runtime: {},
      loadTimes: function() {},
      csi: function() {}
    };
  });

  let okCount = 0;
  for (let i = 0; i < ACCOUNTS.length; i++) {
    const acc = ACCOUNTS[i];
    console.log(`\n[Account ${i + 1}/${ACCOUNTS.length}] Adding session: ${acc.email}...`);

    try {
      await page.goto('https://accounts.google.com/AddSession?hl=en', { waitUntil: 'networkidle', timeout: 35000 });
      await page.waitForTimeout(2500);

      const emailInput = page.locator('input#identifierId, input[name="identifier"], input[type="email"]').first();
      if (await emailInput.count() === 0) {
        console.log(`Email input not found for ${acc.email}, URL: ${page.url()}`);
        continue;
      }

      await emailInput.click({ delay: 80 });
      await page.waitForTimeout(300);
      await humanType(page, acc.email);
      await page.waitForTimeout(600);

      const nextBtn = page.locator('#identifierNext, button:has-text("Next")').first();
      await nextBtn.hover();
      await nextBtn.click({ delay: 100 });
      await page.waitForTimeout(5000);

      const passInput = page.locator('input[type="password"], input[name="Passwd"], input[name="password"]').first();
      if (await passInput.count() === 0) {
        console.log(`Password input not found for ${acc.email}. URL: ${page.url()}`);
        await page.screenshot({ path: path.join(__dirname, `login_err_${acc.email.split('@')[0]}.png`) });
        continue;
      }

      await passInput.click({ delay: 80 });
      await page.waitForTimeout(300);
      await humanType(page, acc.pass);
      await page.waitForTimeout(600);

      const passNext = page.locator('#passwordNext, button:has-text("Next")').first();
      await passNext.hover();
      await passNext.click({ delay: 100 });
      await page.waitForTimeout(7000);

      console.log(`OK logged in: ${acc.email}`);
      okCount++;
    } catch (err) {
      console.error(`Failed ${acc.email}:`, err.message.slice(0, 120));
    }
  }

  console.log(`\nLogin summary: ${okCount}/${ACCOUNTS.length}`);

  console.log('Verifying AI Studio speech access on u/5 ...');
  await page.goto('https://aistudio.google.com/u/5/generate-speech?model=gemini-3.8-flash-lite-tts', { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.waitForTimeout(4000);
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  await page.screenshot({ path: path.join(__dirname, 'aistudio_profile2_speech_authenticated.png') });

  await ctx.close();
  console.log('Done!');
  process.exit(0);
})().catch(err => {
  console.error('Fatal batch login error:', err);
  process.exit(1);
});
