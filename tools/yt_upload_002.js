const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE_DIR = path.resolve(__dirname, '..', 'chrome_yt_sessions');
const PROJECT = path.resolve(__dirname, '..', 'projects', 'simple_itihash_002_first_language');
const OUT = path.join(__dirname, '_yt_evidence');
fs.mkdirSync(OUT, { recursive: true });

const LANGUAGE = (process.argv.slice(2).find((a) => /^(bn|en|hi)$/.test(a.toLowerCase())) || '').toLowerCase();
if (!['bn', 'en', 'hi'].includes(LANGUAGE)) { console.error('usage: node tools/yt_upload_002.js (-lang bn|en|hi)'); process.exit(1); }

const AUTHUSER = { bn: 'bmajnu981@gmail.com', en: 'bmajnu980@gmail.com', hi: 'bmajnu9811@gmail.com' }[LANGUAGE];
const seo = JSON.parse(fs.readFileSync(path.join(PROJECT, 'metadata', 'youtube_seo.json'), 'utf8'));
const M = seo[LANGUAGE].master_upload;
const VIDEO = path.join(PROJECT, M.video_file);
const THUMB = path.join(PROJECT, 'thumbnails', 'master', `master_thumbnail_${LANGUAGE}.png`);
const STATE = path.join(OUT, `upload_state_${LANGUAGE}.json`);

let stage = 0;
const setState = (obj) => fs.writeFileSync(STATE, JSON.stringify({ lang: LANGUAGE, at: new Date().toISOString(), stage: ++stage, ...obj }, null, 2));

async function humanType(page, text) {
  for (const ch of text) await page.keyboard.type(ch, { delay: Math.floor(Math.random() * 40) + 15 });
}

(async () => {
  if (!fs.existsSync(VIDEO)) { setState({ status: 'error', msg: 'video missing: ' + VIDEO }); process.exit(1); }
  fs.mkdirSync(OUT, { recursive: true });
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, executablePath: CHROME_PATH,
    args: [
      '--headless=new', '--disable-blink-features=AutomationControlled', '--no-sandbox',
      '--disable-infobars', '--window-size=1440,900',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    ],
    viewport: { width: 1440, height: 900 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    window.chrome = { app: { isInstalled: false }, runtime: {}, loadTimes: function () {}, csi: function () {} };
  });
  const shot = (n) => page.screenshot({ path: path.join(OUT, `up_${LANGUAGE}_${n}.png`) }).catch(() => {});

  // 1. open upload page, file chooser
  setState({ status: 'opening_upload_page', url: `https://www.youtube.com/upload?authuser=${AUTHUSER}&hl=en` });
  await page.goto(`https://www.youtube.com/upload?authuser=${AUTHUSER}&hl=en`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  if (/accounts\.google\.com|signin/i.test(page.url())) { setState({ status: 'error', msg: 'login gate', url: page.url() }); await shot('gate'); process.exit(1); }
  let chooserTaken = false;
  await page.waitForEvent('filechooser', { timeout: 10000 }).then(async (fc) => { await fc.setFiles(VIDEO); chooserTaken = true; }).catch(() => {});
  if (!chooserTaken) {
    const sel = page.locator('button:has-text("Select files"), ytcp-button:has-text("Select files"), tp-yt-paper-button:has-text("Select files")').first();
    const [fc2] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 12000 }),
      sel.click({ timeout: 8000 }).catch(() => {}),
    ]).catch(() => [null]);
    if (fc2) { await fc2.setFiles(VIDEO); chooserTaken = true; }
  }
  if (!chooserTaken) { setState({ status: 'error', msg: 'file chooser never opened' }); await shot('nochooser'); process.exit(1); }
  setState({ status: 'video_selected', video: path.basename(VIDEO) });
  await page.waitForTimeout(5000);
  await shot('01_dialog');

  // 2. metadata basics
  const dialog = page.locator('ytcp-uploads-dialog, ytcp-uploads-still-host, #dialog').first();
  const textboxes = page.locator('ytcp-social-sentence-text-input #textbox, ytcp-uploads-dialog #textbox, div[contenteditable="true"].textbox, #textbox');
  await page.waitForTimeout(3000);

  // title
  const tb = page.locator('#textbox');
  await tb.nth(0).click();
  await page.waitForTimeout(400);
  try { await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace'); await page.waitForTimeout(200); } catch (_) {}
  await humanType(page, M.title);
  await page.waitForTimeout(500);
  // description
  await tb.nth(1).click();
  await page.waitForTimeout(400);
  try { await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace'); await page.waitForTimeout(200); } catch (_) {}
  await humanType(page, M.description);
  await page.waitForTimeout(500);
  setState({ status: 'title_description_done', title: M.title });

  // 3. not made for kids
  try {
    const noKids = page.getByText(/^No, it'?s not made for kids/i).first();
    await noKids.click({ timeout: 6000 });
  } catch (_) {
    try { const nradios = page.locator('tp-yt-paper-radio-button').nth(1); await nradios.click({ timeout: 4000 }); } catch (e) { setState({ status: 'warn_kids_radio', msg: String(e.message).slice(0, 120) }); }
  }
  await shot('02_kids');

  // 4. thumbnail
  try {
    const imgInput = page.locator('input[type="file"][accept*="image"]').first();
    await imgInput.setInputFiles(THUMB);
    setState({ status: 'thumbnail_uploaded' });
  } catch (e) { setState({ status: 'warn_thumbnail', msg: String(e.message).slice(0, 120) }); }

  // 5. tags (show more, then tag input)
  try {
    const more = page.locator('button:has-text("Show more"), ytcp-button:has-text("Show more"), #toggle-button:has-text("more")').first();
    await more.click({ timeout: 5000 });
    await page.waitForTimeout(800);
  } catch (_) {}
  try {
    const tagBox = page.locator('#tags-container #text-input, ytcp-tag-input input, .ytcp-form-input-container input[aria-label*="tag" i]').first();
    await tagBox.click({ timeout: 5000 });
    for (const t of M.tags) { await humanType(page, t); await page.keyboard.press('Enter'); await page.waitForTimeout(150); }
    setState({ status: 'tags_done', tags: M.tags.length });
  } catch (e) { setState({ status: 'warn_tags', msg: String(e.message).slice(0, 120) }); }
  await shot('03_meta');

  // 6. Next x3 -> publish
  const nextBtn = page.locator('#next-button').first();
  for (let i = 0; i < 3; i++) {
    const t0 = Date.now();
    while (Date.now() - t0 < 45 * 60 * 1000) {
      const dis = await nextBtn.getAttribute('disabled').catch(() => null);
      const aria = await nextBtn.getAttribute('aria-disabled').catch(() => null);
      if (dis === null && aria !== 'true') break;
      if (i === 0) { if (!(stage % 6)) setState({ status: 'waiting_upload_checks', ms: Date.now() - t0, url: page.url() }); }
      await page.waitForTimeout(15000);
    }
    await nextBtn.click();
    await page.waitForTimeout(4000);
    setState({ status: `step_${i + 2}_advanced` });
    await shot(`04_step${i + 2}`);
  }

  const doneBtn = page.locator('#done-button').first();
  try { await doneBtn.click({ timeout: 60000 }); setState({ status: 'publish_clicked' }); }
  catch (e) { setState({ status: 'error_publish_btn', msg: String(e.message).slice(0, 150) }); await shot('05_publishfail'); process.exit(1); }
  await page.waitForTimeout(8000);
  await shot('06_published');

  // 7. capture watch url
  let watchUrl = '';
  try {
    const link = page.locator('a[href*="watch?v="]').first();
    watchUrl = (await link.getAttribute('href', { timeout: 15000 })) || '';
    if (watchUrl && !watchUrl.startsWith('http')) watchUrl = 'https://www.youtube.com' + watchUrl;
  } catch (_) {}
  if (!watchUrl) { const t = await page.locator('body').innerText().catch(() => ''); const m = t.match(/https?:\/\/(www\.)?youtu\.?be\S*/i); watchUrl = m ? m[0] : ''; }
  const vid = (watchUrl.match(/(?:v=|youtu\.be\/)([\w-]{6,})/) || [])[1] || '';

  // 8. close remaining dialog
  try { await page.locator('ytcp-button#close-button, #close-button').first().click({ timeout: 4000 }); } catch (_) {}
  await page.waitForTimeout(3000);
  await shot('07_after_close');

  setState({ status: 'published', watch_url: watchUrl, video_id: vid });
  fs.writeFileSync(path.join(OUT, `published_${LANGUAGE}.json`), JSON.stringify({ lang: LANGUAGE, watch_url: watchUrl, video_id: vid, at: new Date().toISOString() }, null, 2));
  await ctx.close();
  process.exit(0);
})().catch((e) => {
  try { setState({ status: 'fatal', msg: String(e.message).slice(0, 300), url: typeof page !== 'undefined' ? page.url() : '' }); } catch (_) {}
  process.exit(1);
});
