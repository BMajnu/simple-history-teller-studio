const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('convert_to_professional_account'));
  const categoryDOM = await p.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, div[role="radio"], div[role="button"]'));
    return inputs.map(r => ({
      tag: r.tagName,
      type: r.type,
      checked: r.checked,
      innerText: r.innerText?.trim(),
      role: r.getAttribute('role'),
      ariaChecked: r.getAttribute('aria-checked')
    })).filter(x => x.type || x.role || x.innerText);
  });
  console.log('Category inputs:', categoryDOM);

  // Check the Done button properties
  const doneInfo = await p.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Done');
    return btn ? {
      disabled: btn.disabled,
      className: btn.className,
      ariaDisabled: btn.getAttribute('aria-disabled')
    } : null;
  });
  console.log('Done button state:', doneInfo);

  process.exit(0);
})();
