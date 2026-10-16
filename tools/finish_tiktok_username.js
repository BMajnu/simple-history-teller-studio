const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const pages = ctx.pages();
  console.log(`Found ${pages.length} open pages:`);
  let ttPage = null;
  for (const p of pages) {
    const url = p.url();
    console.log(' -', url);
    if (url.includes('tiktok.com')) {
      ttPage = p;
    }
  }

  if (ttPage) {
    console.log('Found open TikTok page:', ttPage.url());
    // Type username
    const userInput = ttPage.locator('input[placeholder*="Username"], input[name="username"]').first();
    await userInput.click();
    await ttPage.keyboard.type('simplehistorytellerofficial', { delay: 40 });
    await ttPage.waitForTimeout(1000);

    // Click Sign up button
    const signUpBtn = ttPage.locator('button:has-text("Sign up"), button[type="submit"]').first();
    await signUpBtn.click();
    await ttPage.waitForTimeout(5000);

    await ttPage.screenshot({ path: 'tools/tiktok_signup_completed.png' });
    console.log('Saved tools/tiktok_signup_completed.png. URL now:', ttPage.url());
  } else {
    console.log('No open TikTok page found. Checking if logged in by opening tiktok.com...');
    const newPage = await ctx.newPage();
    await newPage.goto('https://www.tiktok.com', { waitUntil: 'domcontentloaded' });
    await newPage.waitForTimeout(4000);
    await newPage.screenshot({ path: 'tools/tiktok_homepage_status.png' });
    console.log('TikTok home URL:', newPage.url());
    await newPage.close();
  }
  process.exit(0);
})();
