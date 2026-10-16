const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('generate-speech'));

  const clicked = await page.evaluate(() => {
    // Dismiss any backdrops
    document.querySelectorAll('.cdk-overlay-backdrop').forEach(el => el.remove());
    const btn = document.querySelector('button.ctrl-enter-submits') || document.querySelector('.play-block-btn');
    if (btn) {
      btn.click();
      return { ok: true, text: btn.innerText };
    }
    return { ok: false };
  });
  console.log('Clicked in DOM:', clicked);

  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(1000);
    const s = await page.evaluate(() => {
      const aud = document.querySelector('audio');
      const stop = Array.from(document.querySelectorAll('button')).find(b => (b.innerText || '').includes('Stop'));
      return {
        hasAudio: !!aud,
        src: aud ? aud.src : null,
        dur: aud ? aud.duration : null,
        hasStop: !!stop
      };
    });
    console.log(`[${i}s] state:`, s);
    if (s.hasAudio && s.dur > 0 && !s.hasStop) {
      console.log('Success! Audio is ready:', s.dur);
      break;
    }
  }
  process.exit(0);
})().catch(console.error);
