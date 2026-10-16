const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const pages = ctx.pages();
  console.log(`Total open pages: ${pages.length}`);

  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const url = p.url();
    if (url.includes('aistudio.google.com')) {
      const info = await p.evaluate(() => {
        const dialog = document.querySelector('mat-dialog-container, .cdk-overlay-pane, [role="dialog"], .dialog-backdrop-blur-overlay');
        const overlay = document.querySelector('.dialog-backdrop-blur-overlay');
        return {
          hasOverlay: !!overlay,
          dialogText: dialog ? dialog.innerText.slice(0, 200) : null
        };
      }).catch(e => ({ error: e.message }));
      console.log(`Page ${i} (${url}):`, info);
      if (info.hasOverlay) {
        await p.keyboard.press('Escape');
        await p.waitForTimeout(500);
      }
    }
  }
  process.exit(0);
})().catch(console.error);
