const { chromium } = require('playwright-core');

(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const p = b.contexts()[0].pages()[0];
  await p.screenshot({ path: 'tools/omni_error_check.png' });
  console.log('Saved tools/omni_error_check.png');

  const text = await p.evaluate(() => document.body.innerText.slice(0, 500).replace(/\n/g, ' '));
  console.log('Text preview:', text);

  const errors = await p.evaluate(() => {
    const errEls = Array.from(document.querySelectorAll('.error-message, mat-error, [role="alert"], .mat-mdc-dialog-container, .inline-dialog'));
    return errEls.map(e => e.innerText.trim()).filter(Boolean);
  });
  console.log('Errors/Dialogs:', errors);
})();
