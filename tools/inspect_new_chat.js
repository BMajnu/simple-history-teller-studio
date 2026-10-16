const { chromium } = require('playwright-core');

(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const p = b.contexts()[0].pages()[0];
  await p.goto('https://aistudio.google.com/u/3/prompts/new_chat');
  await p.waitForTimeout(4000);
  await p.keyboard.press('Escape');

  console.log('Current URL:', p.url());
  await p.screenshot({ path: 'tools/new_chat_screen.png' });
  console.log('Saved tools/new_chat_screen.png');

  // Find model selector button
  const modelBtn = p.locator('button.model-select-button, button:has-text("Gemini"), [aria-label*="model"]').first();
  console.log('Model button count:', await modelBtn.count());
  if (await modelBtn.count() > 0) {
    console.log('Model button text:', await modelBtn.innerText());
    await modelBtn.click();
    await p.waitForTimeout(1500);
    await p.screenshot({ path: 'tools/model_picker_open.png' });
    console.log('Saved tools/model_picker_open.png');

    const items = await p.evaluate(() => {
      const all = Array.from(document.querySelectorAll('button, [role="tab"], [role="option"], .mat-mdc-menu-item, .model-option'));
      return all.map(el => el.innerText.trim()).filter(Boolean);
    });
    console.log('Picker items preview:', items.slice(0, 30));
  }
})();
