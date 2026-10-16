const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('generate-speech'));

  console.log('Clicking play-block-btn or runBtn...');
  const playBtn = page.locator('.play-block-btn').first();
  if (await playBtn.count() > 0) {
    await playBtn.click();
    console.log('Clicked playBtn');
  }

  for (let i = 0; i < 15; i++) {
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
    if (s.hasAudio && s.dur > 0) {
      console.log('Success! Audio is ready:', s.dur);
      break;
    }
  }
  process.exit(0);
})().catch(console.error);
