const { chromium } = require('playwright-core');

async function switchAccount(targetEmail) {
  console.log(`--- SWITCHING TO ACCOUNT: ${targetEmail} ---`);
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  await page.goto('https://aistudio.google.com/prompts/new_chat', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  const profileBtn = page.locator('button[aria-label*="account"], button:has-text("PRO"), button:has-text("majnu")').first();
  await profileBtn.click();
  await page.waitForTimeout(1000);

  const switchBtn = page.locator('button:has-text("Switch account")').first();
  await switchBtn.click();
  await page.waitForTimeout(2500);

  console.log('Account chooser opened:', page.url());
  const targetItem = page.locator(`div:has-text("${targetEmail}"), [data-email="${targetEmail}"]`).first();
  if (await targetItem.count() > 0) {
    console.log(`Clicking target account: ${targetEmail}`);
    await targetItem.click();
    await page.waitForTimeout(4000);
    console.log('Redirected to:', page.url());
    await page.screenshot({ path: `tools/after_switch_${targetEmail.split('@')[0]}.png` });
  } else {
    console.log(`Target account ${targetEmail} not found in chooser list!`);
  }

  await page.close();
}

const target = process.argv[2] || 'msrosyafrin@gmail.com';
switchAccount(target).catch(console.error);
