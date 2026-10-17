// Adds ONE Google account session into a persistent Chrome profile (default:
// chrome_aistudio_profile_2). Usage:
//   node tools/add_single_session_profile.js <email> <password> [profile_dir]
const { chromium } = require('playwright-core');
const path = require('path');

const EMAIL = process.argv[2];
const PASS = process.argv[3];
const PROFILE_DIR = process.argv[4]
  || process.env.LOGIN_PROFILE_DIR
  || path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile_2');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

if (!EMAIL || !PASS) {
  console.error('usage: node tools/add_single_session_profile.js <email> <password> [profile_dir]');
  process.exit(1);
}

async function humanType(page, text) {
  for (const char of text) {
    await page.keyboard.type(char, { delay: Math.floor(Math.random() * 60) + 30 });
  }
}

(async () => {
  console.log(`Adding session for ${EMAIL} into profile: ${PROFILE_DIR}`);
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
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

  let ok = false;
  try {
    await page.goto('https://accounts.google.com/AddSession?hl=en', { waitUntil: 'networkidle', timeout: 35000 });
    await page.waitForTimeout(2500);

    const emailInput = page.locator('input#identifierId, input[name="identifier"], input[type="email"]').first();
    if (await emailInput.count() === 0) {
      console.log(`Email input not found. URL: ${page.url()}`);
      await page.screenshot({ path: path.join(__dirname, `single_login_err_1.png`) });
      await ctx.close();
      process.exit(1);
    }

    await emailInput.click({ delay: 80 });
    await page.waitForTimeout(300);
    await humanType(page, EMAIL);
    await page.waitForTimeout(600);

    const nextBtn = page.locator('#identifierNext, button:has-text("Next")').first();
    await nextBtn.hover();
    await nextBtn.click({ delay: 100 });
    await page.waitForTimeout(5000);

    const passInput = page.locator('input[type="password"], input[name="Passwd"], input[name="password"]').first();
    if (await passInput.count() === 0) {
      console.log(`Password input not found. URL: ${page.url()}`);
      console.log('Page text:', (await page.evaluate(() => document.body.innerText.slice(0, 300))).replace(/\n+/g, ' '));
      await page.screenshot({ path: path.join(__dirname, `single_login_err_2.png`) });
      await ctx.close();
      process.exit(1);
    }

    await passInput.click({ delay: 80 });
    await page.waitForTimeout(300);
    await humanType(page, PASS);
    await page.waitForTimeout(600);

    const passNext = page.locator('#passwordNext, button:has-text("Next")').first();
    await passNext.hover();
    await passNext.click({ delay: 100 });
    await page.waitForTimeout(7000);

    const url = page.url();
    console.log('Post-login URL:', url);
    if (/myaccount|aistudio|gds\.google|accounts\.google\.com\/b/i.test(url) || !/signin\/challenge/.test(url)) {
      ok = true;
    }
  } catch (err) {
    console.error('Login error:', err.message.slice(0, 150));
  }

  console.log(ok ? `OK session added: ${EMAIL}` : `INCONCLUSIVE: check challenge/captcha`);
  await page.screenshot({ path: path.join(__dirname, 'single_login_result.png') });
  await ctx.close();
  process.exit(ok ? 0 : 1);
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
