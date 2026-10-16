const { chromium } = require('playwright-core');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();
  await page.goto('https://aistudio.google.com/app/prompts/new_chat?model=gemini-omni-1.1-flash', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  console.log('--- INSPECTING RIGHT DRAWER DROPDOWNS ---');
  const selects = await page.locator('mat-select, [role="combobox"]').all();
  for (let i = 0; i < selects.length; i++) {
    const text = await selects[i].innerText();
    console.log(`Dropdown #${i}: [${text}]`);
  }

  // Find resolution dropdown
  const resSelect = page.locator('mat-select, [role="combobox"]').filter({ hasText: '360p' }).first();
  if (await resSelect.count() > 0) {
    await resSelect.click();
    await page.waitForTimeout(500);
    const options = await page.locator('mat-option, [role="option"]').allInnerTexts();
    console.log('Available resolutions:', options);
    await page.keyboard.press('Escape');
  }

  // Find fps dropdown
  const fpsSelect = page.locator('mat-select, [role="combobox"]').filter({ hasText: '24fps' }).first();
  if (await fpsSelect.count() > 0) {
    await fpsSelect.click();
    await page.waitForTimeout(500);
    const options = await page.locator('mat-option, [role="option"]').allInnerTexts();
    console.log('Available frame rates:', options);
    await page.keyboard.press('Escape');
  }

  await page.close();
}

main().catch(console.error);
