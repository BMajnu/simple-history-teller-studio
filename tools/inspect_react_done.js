const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = ctx.pages().find(page => page.url().includes('convert_to_professional_account'));
  if (!p) {
    console.log('No convert page found');
    process.exit(1);
  }

  p.on('console', msg => console.log('Console:', msg.type(), msg.text()));
  p.on('response', resp => {
    if (resp.url().includes('instagram.com/api')) {
      console.log('API Resp:', resp.status(), resp.url());
    }
  });

  // Let's inspect React props on the Done button
  const buttonProps = await p.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Done');
    if (!btn) return 'Done button not found';
    const keys = Object.keys(btn);
    const reactKey = keys.find(k => k.startsWith('__reactFiber') || k.startsWith('__reactProps'));
    return {
      keys,
      reactKey,
      props: reactKey ? Object.keys(btn[reactKey]) : null
    };
  });
  console.log('Button props:', buttonProps);

  // Trigger onClick via React props
  await p.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Done');
    const propKey = Object.keys(btn).find(k => k.startsWith('__reactProps'));
    if (propKey && btn[propKey].onClick) {
      console.log('Invoking React onClick handler!');
      btn[propKey].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
    }
  });

  await p.waitForTimeout(5000);
  console.log('URL after React invoke:', p.url());
  const bodyText = await p.evaluate(() => document.body.innerText.slice(0, 400));
  console.log('Body text now:', bodyText);

  process.exit(0);
})();
