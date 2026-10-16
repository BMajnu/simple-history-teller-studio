const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];

  for (const u of [1, 2, 3]) {
    const page = await ctx.newPage();
    const url = `https://aistudio.google.com/u/${u}/prompts/new_chat?model=gemini-omni-1.1-flash`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await page.keyboard.press('Escape');
    const userText = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label*="account"], button.user-profile-button');
      return btn ? btn.innerText.replace(/\n/g, ' ') : 'NOT_FOUND';
    });
    console.log(`Slot /u/${u}/: ${userText}`);
    await page.close();
  }
}

main().catch(console.error);
