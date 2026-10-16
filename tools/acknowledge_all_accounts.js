const { chromium } = require('playwright-core');

async function acknowledgeAll() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const slots = ['u/5', 'u/4', 'u/2', 'u/1', 'u/3'];

  for (const slot of slots) {
    console.log(`Checking modal on ${slot}...`);
    try {
      await page.goto(`https://aistudio.google.com/${slot}/prompts/new_chat?model=gemini-omni-1.1-flash`, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(3000);

      const ackBtn = page.locator('button:has-text("Acknowledge"), button:has-text("Accept"), button:has-text("I agree"), button:has-text("Got it")').first();
      if (await ackBtn.isVisible().catch(() => false)) {
        console.log(`Found modal on ${slot}, clicking Acknowledge...`);
        await ackBtn.click();
        await page.waitForTimeout(1500);
        console.log(`✓ Acknowledged on ${slot}!`);
      } else {
        console.log(`No modal on ${slot}.`);
      }
    } catch (e) {
      console.warn(`Error on ${slot}:`, e.message);
    }
  }

  console.log('Finished acknowledging all accounts!');
}

acknowledgeAll().catch(console.error);
