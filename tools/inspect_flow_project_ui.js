const { chromium } = require('playwright-core');

(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = b.contexts()[0];
  const p = await ctx.newPage();

  console.log('Navigating to Google Flow project...');
  await p.goto('https://flow.google.com/project/6b6c9890-d01a-498e-840d-d27c7ab94128', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await p.waitForTimeout(5000);

  console.log('Current URL:', p.url());
  await p.screenshot({ path: 'tools/flow_project_screen.png' });
  console.log('Saved tools/flow_project_screen.png');

  const info = await p.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText.trim(),
      ariaLabel: b.getAttribute('aria-label')
    })).filter(b => b.text || b.ariaLabel);

    const inputs = Array.from(document.querySelectorAll('input, textarea')).map(i => ({
      type: i.type,
      placeholder: i.placeholder,
      ariaLabel: i.getAttribute('aria-label'),
      id: i.id
    }));

    const text = document.body.innerText.slice(0, 500).replace(/\n/g, ' ');

    return { buttons: buttons.slice(0, 30), inputs, textPreview: text };
  });

  console.log('Flow Project Info:', JSON.stringify(info, null, 2));
  await p.close();
})();
