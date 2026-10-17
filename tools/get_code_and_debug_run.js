const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--headless=new', '--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('audio') || msg.text().includes('speech')) {
      console.log(`[Browser ${msg.type()}]`, msg.text());
    }
  });

  page.on('request', req => {
    const url = req.url();
    if (!url.includes('.js') && !url.includes('.css') && !url.includes('.png') && !url.includes('.svg') && !url.includes('fonts')) {
      console.log(`[REQ] ${req.method()} ${url.slice(0, 100)}`);
    }
  });

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('generate') || url.includes('speech') || url.includes('predict') || url.includes('streamGenerateContent')) {
      console.log(`[RES] ${res.status()} ${url.slice(0, 100)} Content-Type: ${res.headers()['content-type']}`);
    }
  });

  await page.goto('https://aistudio.google.com/u/0/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const card = page.locator('[data-testid="create-new-dialog-card"]').first();
  if (await card.count() > 0) {
    await card.click();
    await page.waitForTimeout(2000);
  }

  // Look for textarea
  const ta = page.locator('textarea').first();
  await ta.fill('আজ থেকে ৩২০০ বছর আগে, ভূমধ্যসাগরীয় পৃথিবী ছিল এক উন্নত ও সমৃদ্ধ সভ্যতা।');
  await page.waitForTimeout(1000);

  // Click Get code first to see the API structure
  const getCodeBtn = page.locator('button:has-text("Get code")').first();
  if (await getCodeBtn.count() > 0) {
    console.log('Clicking Get code...');
    await getCodeBtn.click();
    await page.waitForTimeout(2000);
    const code = await page.evaluate(() => {
      const el = document.querySelector('pre, code, .code-snippet, [role="tabpanel"]');
      return el ? el.innerText : 'No pre element found';
    });
    console.log('--- GET CODE SNIPPET ---');
    console.log(code.slice(0, 1200));
    console.log('------------------------');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  }

  // Now let's test clicking the play button inside the speech block
  // Let's find all buttons inside the block or with aria-label
  const previewBtn = page.locator('button[aria-label*="preview" i], button:has-text("play_arrow")').first();
  console.log('Preview button count:', await previewBtn.count());

  // Also check the Run button
  const runBtn = page.locator('button:has-text("Run")').first();
  console.log('Run button count:', await runBtn.count());
  console.log('Run button disabled?:', await runBtn.isDisabled());

  console.log('Clicking Run button...');
  await runBtn.click();
  await page.waitForTimeout(6000);

  // Take screenshot
  await page.screenshot({ path: path.join(__dirname, 'after_run_debug.png') });
  console.log('Screenshot saved to after_run_debug.png');

  await ctx.close();
  console.log('Debug completed.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
