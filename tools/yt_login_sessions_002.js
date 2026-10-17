const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE_DIR = path.resolve(__dirname, '..', 'chrome_yt_sessions');
const OUT = path.join(__dirname, '_yt_evidence');
fs.mkdirSync(OUT, { recursive: true });

const ACCOUNTS = [
  { email: 'bmajnu981@gmail.com', pass: 'M@jnu786', lang: 'bn' },
  { email: 'bmajnu980@gmail.com', pass: 'M@jnu786', lang: 'en' },
  { email: 'bmajnu9811@gmail.com', pass: 'M@jnu786', lang: 'hi' },
];

async function humanType(page, text) {
  for (const char of text) await page.keyboard.type(char, { delay: Math.floor(Math.random() * 60) + 30 });
}

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, executablePath: CHROME_PATH,
    args: [
      '--headless=new', '--disable-blink-features=AutomationControlled', '--no-sandbox',
      '--disable-infobars', '--window-size=1280,800',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    ],
    viewport: { width: 1280, height: 800 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    window.chrome = { app: { isInstalled: false }, runtime: {}, loadTimes: function () {}, csi: function () {} };
  });

  const results = [];
  for (const acc of ACCOUNTS) {
    const r = { lang: acc.lang, email: acc.email, status: 'unknown', url: '' };
    try {
      await page.goto('https://accounts.google.com/AddSession?hl=en', { waitUntil: 'networkidle', timeout: 35000 });
      await page.waitForTimeout(2500);
      const emailInput = page.locator('input#identifierId, input[name="identifier"], input[type="email"]').first();
      if (await emailInput.count() === 0) {
        r.status = 'no_email_input'; r.url = page.url();
        await page.screenshot({ path: path.join(OUT, `login_err_${acc.lang}.png`) });
      } else {
        await emailInput.click({ delay: 80 });
        await page.waitForTimeout(300);
        await humanType(page, acc.email);
        await page.waitForTimeout(600);
        const nextBtn = page.locator('#identifierNext, button:has-text("Next")').first();
        await nextBtn.hover(); await nextBtn.click({ delay: 100 });
        await page.waitForTimeout(5000);
        const passInput = page.locator('input[type="password"], input[name="Passwd"], input[name="password"]').first();
        if (await passInput.count() === 0) {
          r.status = 'no_password_input'; r.url = page.url();
          await page.screenshot({ path: path.join(OUT, `login_err_${acc.lang}.png`) });
        } else {
          await passInput.click({ delay: 80 });
          await page.waitForTimeout(300);
          await humanType(page, acc.pass);
          await page.waitForTimeout(600);
          const passNext = page.locator('#passwordNext, button:has-text("Next")').first();
          await passNext.hover(); await passNext.click({ delay: 100 });
          await page.waitForTimeout(8000);
          r.url = page.url();
          r.status = /signin\/(v2\/)?challenge|deniedsigninrejected|signin\/oauth/i.test(r.url) ? 'challenge_or_rejected' : 'ok';
          if (r.status !== 'ok') await page.screenshot({ path: path.join(OUT, `login_challenge_${acc.lang}.png`) });
        }
      }
    } catch (err) {
      r.status = 'error'; r.url = page.url(); r.err = String(err.message).slice(0, 200);
    }
    results.push(r);
    console.log(`[${acc.lang}] ${r.status} :: ${r.url.slice(0, 110)}`);
  }

  fs.writeFileSync(path.join(OUT, 'login_sessions.json'), JSON.stringify(results, null, 2));
  const ok = results.filter((r) => r.status === 'ok').length;
  console.log(`SESSIONS: ${ok}/3 ok`);
  await ctx.close();
  process.exit(ok === 3 ? 0 : 2);
})().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
