const { chromium } = require('playwright-core');

async function openGmailForEmail(email) {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();

  console.log(`Opening Account Chooser for ${email}...`);
  await p.goto('https://accounts.google.com/v3/signin/accountchooser?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&service=mail', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);

  const accItem = p.locator(`div:has-text("${email}"), li:has-text("${email}")`).last();
  if (await accItem.isVisible().catch(() => false)) {
    console.log(`Clicking account item for ${email}...`);
    await accItem.click();
    await p.waitForTimeout(5000);
    console.log(`Current URL after click:`, p.url(), await p.title());
  }

  // Check if password prompt appeared
  const pwInput = p.locator('input[type="password"]');
  if (await pwInput.isVisible().catch(() => false)) {
    console.log('Password prompt detected, filling password...');
    await pwInput.fill('***REMOVED***');
    await p.waitForTimeout(500);
    await p.keyboard.press('Enter');
    await p.waitForTimeout(6000);
    console.log('After password submission URL:', p.url());
  }

  await p.screenshot({ path: `tools/gmail_${email.split('@')[0]}_live.png` });
  console.log(`Saved screenshot tools/gmail_${email.split('@')[0]}_live.png`);
  return p.url();
}

(async () => {
  await openGmailForEmail('bmajnu981@gmail.com');
  await openGmailForEmail('bmajnu9811@gmail.com');
  process.exit(0);
})();
