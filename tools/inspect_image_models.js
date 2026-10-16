const { chromium } = require('playwright-core');

(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const p = b.contexts()[0].pages()[0];

  await p.goto('https://aistudio.google.com/u/3/prompts/new_chat');
  await p.waitForTimeout(3000);
  await p.keyboard.press('Escape');

  // Open model picker
  const modelBtn = p.locator('button.model-select-button, button:has-text("Gemini"), [aria-label*="model"]').first();
  await modelBtn.click();
  await p.waitForTimeout(1000);

  // Click "Images" category pill
  const imagesTab = p.locator('button:has-text("Images"), [role="tab"]:has-text("Images")').first();
  if (await imagesTab.count() > 0) {
    await imagesTab.click();
    await p.waitForTimeout(1500);

    const imageModels = await p.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.model-selector-item, button, [role="option"]')).map(el => el.innerText.trim()).filter(Boolean);
      return items.filter(t => /imagen|image|banana|flash/i.test(t));
    });
    console.log('Available Image Models:', imageModels);
  }
})();
