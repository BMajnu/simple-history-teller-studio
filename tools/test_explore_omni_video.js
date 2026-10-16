const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to Gemini Omni 1.1 Flash on u/3...');
  await page.goto('https://aistudio.google.com/u/3/app/prompts/new_chat?model=gemini-omni-1.1-flash', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  const title = await page.title();
  const url = page.url();
  console.log('Page Title:', title);
  console.log('Page URL:', url);

  await page.screenshot({ path: 'tools/omni_flash_screen.png' });
  console.log('Saved tools/omni_flash_screen.png');

  // Inspect right drawer and controls
  const controls = await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('mat-select, select, [role="combobox"]')).map(s => ({
      text: s.innerText,
      ariaLabel: s.getAttribute('aria-label')
    }));
    const sliders = Array.from(document.querySelectorAll('mat-slider, input[type="range"]')).map(s => ({
      val: s.getAttribute('aria-valuenow') || s.value
    }));
    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
    const textarea = document.querySelector('textarea, div[contenteditable="true"]');
    return {
      selects,
      sliders,
      buttonsCount: buttons.length,
      sampleButtons: buttons.slice(0, 15),
      hasTextarea: !!textarea
    };
  });

  console.log('Controls:', JSON.stringify(controls, null, 2));
  await page.close();
})();
