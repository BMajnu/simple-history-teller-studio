const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = path.join(process.env.USERPROFILE, '.gemini', 'antigravity', 'scratch', 'chrome_aistudio_profile');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Testing New Project creation on Google Flow...');
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1366, height: 850 }
  });

  const page = ctx.pages()[0] || await ctx.newPage();

  await page.goto('https://flow.google.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Find New Project button
  const newProjBtn = page.locator('button, a').filter({ hasText: /New project|নতুন প্রোজেক্ট/i }).first();
  console.log('New project button count:', await newProjBtn.count());

  if (await newProjBtn.count() > 0) {
    console.log('Clicking New Project...');
    await newProjBtn.click();
    await page.waitForTimeout(8000);
    console.log('Current URL:', page.url());
    await page.screenshot({ path: path.join(__dirname, 'flow_new_project.png') });
    console.log('Saved flow_new_project.png');

    const controls = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, [role="button"], input, textarea, div.ProseMirror')).map(el => ({
        tag: el.tagName,
        text: (el.innerText || '').slice(0, 40).replace(/\n/g, ' '),
        ariaLabel: el.getAttribute('aria-label'),
        class: el.className ? String(el.className).slice(0, 40) : null
      })).filter(x => x.text || x.ariaLabel);
    });
    console.log('Controls in project view (sample 25):', JSON.stringify(controls.slice(0, 25), null, 2));
  } else {
    console.log('New project button not found directly.');
    await page.screenshot({ path: path.join(__dirname, 'flow_home_state.png') });
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
