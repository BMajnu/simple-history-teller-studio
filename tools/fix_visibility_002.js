const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE_DIR = path.resolve(__dirname, '..', 'chrome_yt_sessions');
const OUT = path.join(__dirname, '_yt_evidence');

const LANGUAGE = (process.argv.slice(2).find((a) => /^(bn|en|hi)$/.test(a.toLowerCase())) || '').toLowerCase();
if (!LANGUAGE) { console.error('usage: node tools/fix_visibility_002.js bn|en|hi'); process.exit(1); }

const seo = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'projects', 'simple_itihash_002_first_language', 'metadata', 'youtube_seo.json'), 'utf8'));
const VID = seo.publish_log[LANGUAGE].video_id;
const AUTHUSER = seo.publish_log[LANGUAGE].account;
const STATE = path.join(OUT, `fix_state_${LANGUAGE}.json`);
const setState = (obj) => fs.writeFileSync(STATE, JSON.stringify({ lang: LANGUAGE, at: new Date().toISOString(), ...obj }, null, 2));

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, executablePath: CHROME_PATH,
    args: ['--headless=new', '--disable-blink-features=AutomationControlled', '--no-sandbox', '--window-size=1440,900',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'],
    viewport: { width: 1440, height: 900 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });
  const shot = (n) => page.screenshot({ path: path.join(OUT, `fix_${LANGUAGE}_${n}.png`) }).catch(() => {});

  setState({ status: 'opening_edit_page' });
  await page.goto(`https://studio.youtube.com/video/${VID}/edit?authuser=${AUTHUSER}&hl=en`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000);
  if (/accounts\.google\.com|signin/i.test(page.url())) { setState({ status: 'error_login_gate', url: page.url() }); await shot('gate'); process.exit(1); }
  await shot('00_initial');

  const skip = await page.getByText(/SKIP TO YOUTUBE STUDIO/i).first().count();
  if (skip) { await page.getByText(/SKIP TO YOUTUBE STUDIO/i).first().click(); await page.waitForTimeout(7000); await shot('00b_after_skip'); }

  const isDraft = await page.getByText(/draft state/i).first().count();
  if (isDraft) {
    await page.getByRole('button', { name: /Edit draft/i }).first().click({ timeout: 10000 });
    await page.waitForTimeout(7000);
    await shot('01_draft_dialog');
  }

  await page.getByText(/^Visibility$/, { exact: true }).first().click({ timeout: 25000 });
  await page.waitForTimeout(2500);
  await shot('02_visibility_step');

  let publicDone = false;
  try { await page.getByText(/^Public$/, { exact: true }).first().click({ timeout: 9000 }); publicDone = true; }
  catch (_) {
    try { await page.getByText(/Everyone can watch your video/i).first().click({ timeout: 5000 }); publicDone = true; }
    catch (e2) { setState({ status: 'error_public_radio', msg: String(e2.message).slice(0, 150) }); await shot('03_publicfail'); await ctx.close(); process.exit(1); }
  }
  await page.waitForTimeout(1200);
  await shot('04_public_selected');
  if (!publicDone) { setState({ status: 'error_public_not_selected' }); await ctx.close(); process.exit(1); }

  // done/publish button (dialog footer), wait enabled
  const done = page.locator('#done-button').first();
  const t0 = Date.now();
  let clicked = false;
  while (Date.now() - t0 < 60 * 60 * 1000) {
    const aria = (await done.getAttribute('aria-disabled').catch(() => 'true')) || 'true';
    const cls = (await done.getAttribute('class').catch(() => '')) || '';
    if (aria !== 'true' && !/disabled/i.test(cls)) {
      try { await done.click({ timeout: 6000 }); clicked = true; break; } catch (_) {}
    }
    setState({ status: 'waiting_done_enabled', ms: Date.now() - t0 });
    await page.waitForTimeout(20000);
  }
  await page.waitForTimeout(8000);
  await shot('05_after_done');
  const toast = (await page.locator('#toast, ytcp-toast-notification, .ytcp-toasts-container').first().innerText().catch(() => '')) || '';
  setState({ status: clicked ? 'published_public' : 'done_button_timeout', toast: String(toast).slice(0, 200), url: page.url() });
  await ctx.close();
  process.exit(clicked ? 0 : 2);
})().catch((e) => { try { setState({ status: 'fatal', msg: String(e.message).slice(0, 250) }); } catch (_) {} process.exit(1); });
