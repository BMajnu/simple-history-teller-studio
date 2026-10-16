const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  console.log('Navigating to u/0/generate-speech...');
  await page.goto('https://aistudio.google.com/u/0/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  const btns = await page.locator('button').allInnerTexts();
  console.log('Buttons on u/0:', btns.filter(b => b.length > 0 && b.length < 30).slice(0, 20));

  await page.screenshot({ path: 'tools/speech_u0_screenshot.png' });
  console.log('Saved tools/speech_u0_screenshot.png');
})();
