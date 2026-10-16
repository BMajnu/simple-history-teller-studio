const { chromium } = require('playwright-core');

(async () => {
  const ctx = await chromium.launchPersistentContext('C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3', {
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://www.facebook.com/groups/1803711656387813/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);

  // Check composer button
  const composers = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('div[role="button"], span')).filter(el => {
      const t = el.innerText || '';
      return t.includes('Write something') || t.includes('Create a public post');
    }).map(el => ({ tag: el.tagName, text: el.innerText.trim(), role: el.getAttribute('role'), aria: el.getAttribute('aria-label') }));
  });
  console.log('Composers found:', JSON.stringify(composers, null, 2));

  // Click the top composer
  const btn = page.locator('div[role="button"]:has-text("Write something..."), div[role="button"]:has-text("Create a public post...")').first();
  await btn.click({ force: true });
  await page.waitForTimeout(4000);

  // Inspect dialog
  const dialogInfo = await page.evaluate(() => {
    const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
    return dialogs.map(d => ({
      header: (d.innerText || '').slice(0, 100),
      textboxes: Array.from(d.querySelectorAll('[role="textbox"], div[contenteditable="true"]')).map(tb => ({
        tagName: tb.tagName,
        role: tb.getAttribute('role'),
        contenteditable: tb.getAttribute('contenteditable'),
        ariaLabel: tb.getAttribute('aria-label')
      })),
      buttons: Array.from(d.querySelectorAll('div[role="button"], button')).map(b => (b.innerText || '').trim()).filter(Boolean)
    }));
  });
  console.log('Dialogs info:', JSON.stringify(dialogInfo, null, 2));

  await page.screenshot({ path: 'tools/test_composer_dialog.png' });
  await ctx.close();
})().catch(console.error);
