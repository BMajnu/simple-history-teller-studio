const { chromium } = require('playwright-core');

(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const p = b.contexts()[0].pages()[0];

  const modes = ['Image to Video', 'Reference to Video'];

  for (const mode of modes) {
    console.log(`\n--- Selecting Video Task: [${mode}] ---`);
    const taskSelect = p.locator('mat-select[aria-label="Video Task"]').first();
    await taskSelect.click();
    await p.waitForTimeout(500);

    const opt = p.locator(`mat-option:has-text("${mode}"), [role="option"]:has-text("${mode}")`).first();
    await opt.click();
    await p.waitForTimeout(1500);

    await p.screenshot({ path: `tools/mode_${mode.replace(/\s+/g, '_').toLowerCase()}.png` });
    console.log(`Saved screenshot tools/mode_${mode.replace(/\s+/g, '_').toLowerCase()}.png`);

    const modeInfo = await p.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, mat-select, textarea, [role="combobox"]')).map(el => ({
        tag: el.tagName,
        ariaLabel: el.getAttribute('aria-label'),
        placeholder: el.getAttribute('placeholder'),
        text: el.innerText ? el.innerText.trim() : null
      }));
      return inputs;
    });
    console.log(`Inputs for [${mode}]:`, JSON.stringify(modeInfo.slice(0, 15), null, 2));
  }
})();
