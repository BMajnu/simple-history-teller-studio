const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = await browser.contexts()[0].newPage();

  console.log('Testing /u/1/prompts/new_chat (without /app/)...');
  await page.goto('https://aistudio.google.com/u/1/prompts/new_chat?model=gemini-omni-1.1-flash', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  console.log('URL:', page.url());
  const user = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label*="account"], button.user-profile-button');
    return btn ? btn.innerText.replace(/\n/g, ' ') : document.body.innerText.slice(0, 150);
  });
  console.log('Logged in as:', user);
  await page.screenshot({ path: 'tools/test_u1_result.png' });
  await page.close();
}

main().catch(console.error);
