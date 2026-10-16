const { chromium } = require('playwright-core');

async function testChooser() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to account chooser...');
  await page.goto('https://accounts.google.com/v3/signin/accountchooser?continue=https%3A%2F%2Faistudio.google.com%2Fprompts%2Fnew_chat', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Look for Rosy Afrin or msrosyafrin
  console.log('Looking for msrosyafrin...');
  const rosyEntry = page.locator('li:has-text("msrosyafrin"), div:has-text("msrosyafrin"), [data-email="msrosyafrin@gmail.com"]').first();
  if (await rosyEntry.count() > 0) {
    console.log('Clicking msrosyafrin...');
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }).catch(() => {}),
      rosyEntry.click()
    ]);
  } else {
    // Try text "Rosy Afrin"
    const textEntry = page.locator('text=Rosy Afrin').first();
    console.log('Clicking text Rosy Afrin...');
    await textEntry.click();
    await page.waitForTimeout(4000);
  }

  console.log('Current URL after click:', page.url());
  await page.screenshot({ path: 'tools/after_rosy_login.png' });
  console.log('Saved tools/after_rosy_login.png');

  // Verify who is logged in now
  await page.waitForTimeout(3000);
  const userText = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label*="account"], button.user-profile-button');
    return btn ? btn.innerText.replace(/\n/g, ' ') : document.body.innerText.slice(0, 200);
  });
  console.log('Active user on page:', userText);

  await page.close();
}

testChooser().catch(console.error);
