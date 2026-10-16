const { chromium } = require('playwright-core');
const path = require('path');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to Omni 1.1 Flash...');
  await page.goto('https://aistudio.google.com/app/prompts/new_chat?model=gemini-omni-1.1-flash', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Auto-dismiss any banners
  await page.keyboard.press('Escape');

  // Inspect attachment buttons and file inputs
  const info = await page.evaluate(() => {
    const fileInputs = Array.from(document.querySelectorAll('input[type="file"]')).map(i => ({
      accept: i.accept,
      id: i.id,
      name: i.name
    }));
    const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText.trim(),
      ariaLabel: b.getAttribute('aria-label'),
      icon: b.querySelector('mat-icon')?.innerText
    })).filter(b => b.text || b.ariaLabel || b.icon);
    const textareas = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"]')).map(t => ({
      tag: t.tagName,
      placeholder: t.getAttribute('placeholder'),
      className: t.className
    }));
    return { fileInputs, buttonsCount: buttons.length, sampleButtons: buttons.slice(0, 20), textareas };
  });

  console.log('DOM Info:', JSON.stringify(info, null, 2));

  await page.screenshot({ path: 'tools/omni_input_inspect.png' });
  console.log('Saved tools/omni_input_inspect.png');
  await page.close();
})();
