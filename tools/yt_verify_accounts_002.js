const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PROFILE_DIR = path.resolve(__dirname, '..', '_desktop_profile');
const OUT = path.join(__dirname, '_yt_evidence');
fs.mkdirSync(OUT, { recursive: true });
const shot = (page, name) => page.screenshot({ path: path.join(OUT, name), fullPage: false }).catch(() => {});

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false, executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'], viewport: null,
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  const ev = { at: new Date().toISOString() };

  await page.goto('https://www.youtube.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  ev.ytUrl = page.url();
  const avatar = await page.$('#avatar-btn');
  ev.avatarBtn = !!avatar;
  ev.sids = (await ctx.cookies()).filter((c) => ['SID', 'HSID', 'SSID', 'SAPISID'].includes(c.name)).map((c) => c.name);
  await shot(page, 'yt_home.png');

  if (avatar) {
    await avatar.click();
    await page.waitForTimeout(2500);
    const pop = await page.$('ytd-popup-container');
    ev.accountMenuText = pop ? (await pop.innerText()).slice(0, 2500) : '(no popup)';
    await shot(page, 'yt_account_menu.png');
    const esc = await page.keyboard.press('Escape');
    await page.waitForTimeout(800);
  } else {
    ev.accountMenuText = '(not logged in)';
  }

  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  ev.studioUrl = page.url();
  ev.studioTitle = await page.title();
  const body = await page.$('body');
  ev.studioText = body ? (await body.innerText()).slice(0, 1800) : '(no body)';
  await shot(page, 'studio.png');

  fs.writeFileSync(path.join(OUT, 'verify.json'), JSON.stringify(ev, null, 2));
  console.log('VERIFY OK -> tools/_yt_evidence/verify.json | avatar=' + ev.avatarBtn + ' | studio=' + ev.studioUrl);
  await ctx.close();
})().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
