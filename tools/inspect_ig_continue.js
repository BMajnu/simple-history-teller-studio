const { chromium } = require('playwright-core');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();
  await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const elements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a, div[role="button"]')).map(el => ({
      tag: el.tagName,
      role: el.getAttribute('role'),
      text: el.innerText,
      type: el.getAttribute('type'),
      href: el.getAttribute('href'),
      rect: el.getBoundingClientRect()
    })).filter(e => e.text && (e.text.includes('Continue') || e.text.includes('profile')));
  });

  console.log('Found buttons/links:', JSON.stringify(elements, null, 2));

  // Let's click the Continue element by exact coordinates
  const cont = elements.find(e => e.text.includes('Continue'));
  if (cont) {
    console.log(`Clicking at x=${cont.rect.x + cont.rect.width/2}, y=${cont.rect.y + cont.rect.height/2}`);
    await page.mouse.click(cont.rect.x + cont.rect.width/2, cont.rect.y + cont.rect.height/2);
    console.log('Waiting 10s after click...');
    await page.waitForTimeout(10000);
    console.log('URL after click:', page.url());
    await page.screenshot({ path: 'tools/ig_after_real_click.png' });
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
