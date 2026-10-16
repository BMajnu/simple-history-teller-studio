const { chromium } = require('playwright-core');

(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const p = b.contexts()[0].pages()[0];
  await p.goto('https://aistudio.google.com/u/3/prompts/new_chat?model=gemini-omni-1.1-flash');
  await p.waitForTimeout(4000);
  await p.keyboard.press('Escape');

  await p.screenshot({ path: 'tools/omni_ui.png' });
  console.log('Saved tools/omni_ui.png');

  const info = await p.evaluate(() => {
    const fileInputs = Array.from(document.querySelectorAll('input[type="file"]')).map(i => ({
      accept: i.accept,
      id: i.id,
      name: i.name
    }));
    const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText.trim(),
      ariaLabel: b.getAttribute('aria-label'),
      className: b.className
    })).filter(b => b.text || b.ariaLabel);

    const selects = Array.from(document.querySelectorAll('mat-select, [role="combobox"]')).map(s => ({
      text: s.innerText.trim(),
      ariaLabel: s.getAttribute('aria-label')
    }));

    const textareas = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"]')).map(t => ({
      tagName: t.tagName,
      placeholder: t.getAttribute('placeholder'),
      className: t.className
    }));

    return { fileInputs, buttons: buttons.slice(0, 30), selects, textareas };
  });

  console.log('DOM Info:', JSON.stringify(info, null, 2));
})();
