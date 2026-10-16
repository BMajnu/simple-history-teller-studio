const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const slots = ['u/4', 'u/5', 'u/6', 'u/2'];
  for (const slot of slots) {
    console.log(`\nTesting slot ${slot}...`);
    try {
      await page.goto(`https://aistudio.google.com/${slot}/generate-speech?model=gemini-3.8-flash-tts`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      await page.keyboard.press('Escape');

      const createCard = page.locator('text="Create new dialog"').first();
      if (await createCard.isVisible().catch(() => false)) {
        await createCard.click();
        await page.waitForTimeout(2000);
      }

      const textarea = page.locator('textarea').first();
      await textarea.waitFor({ timeout: 5000 });
      await textarea.fill('Testing multi slot');
      await page.waitForTimeout(500);

      const runBtn = page.locator('button:has-text("Run")').last();
      await runBtn.click();
      await page.waitForTimeout(3000);

      const modal = page.locator('text="Upgrade to unlock more"').first();
      if (await modal.isVisible().catch(() => false)) {
        console.log(`[${slot}] Has upgrade modal`);
      } else {
        const status = await page.evaluate(() => {
          const aud = document.querySelector('audio');
          const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
          return { aud: !!aud, stop };
        });
        console.log(`[${slot}] Status:`, status);
      }
    } catch (e) {
      console.log(`[${slot}] Error: ${e.message}`);
    }
  }
})();
