const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const slots = ['u/0', 'u/1', 'u/2', 'u/3', 'u/4', 'u/5', 'u/6'];
  const workingSlots = [];

  for (const s of slots) {
    try {
      console.log(`Checking slot ${s}...`);
      await page.goto(`https://aistudio.google.com/${s}/generate-speech?model=gemini-3.8-flash-tts`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2500);
      await page.keyboard.press('Escape');

      // Check if upgrade modal is already there
      const modal = page.locator('text="Upgrade to unlock more"').first();
      if (await modal.isVisible().catch(() => false)) {
        console.log(`❌ [${s}] Modal visible on load`);
        continue;
      }

      const createCard = page.locator('text="Create new dialog"').first();
      if (await createCard.isVisible().catch(() => false)) {
        await createCard.click();
        await page.waitForTimeout(1500);
      }

      const textarea = page.locator('textarea:visible').first();
      if (await textarea.count() === 0) {
        console.log(`❌ [${s}] No visible textarea`);
        continue;
      }

      await textarea.fill('Test');
      await page.waitForTimeout(300);

      const runBtn = page.locator('button:has-text("Run")').last();
      const ariaDisabled = await runBtn.getAttribute('aria-disabled');
      if (ariaDisabled === 'true') {
        console.log(`❌ [${s}] Run button disabled`);
        continue;
      }

      await runBtn.click();
      await page.waitForTimeout(2000);

      if (await modal.isVisible().catch(() => false)) {
        console.log(`❌ [${s}] Modal appeared after Run`);
        continue;
      }

      const state = await page.evaluate(() => {
        const aud = document.querySelector('audio');
        const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
        return { aud: !!aud, stop };
      });

      console.log(`✅ [${s}] Working! State:`, state);
      workingSlots.push(s);
    } catch (e) {
      console.log(`❌ [${s}] Error: ${e.message}`);
    }
  }

  console.log('\n=======================================');
  console.log('SUMMARY OF WORKING SLOTS:', workingSlots);
  console.log('=======================================');
})();
