const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

(async () => {
  let ctx;
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224', { timeout: 2000 });
    ctx = browser.contexts()[0];
  } catch (e) {
    ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
      headless: false,
      executablePath: CHROME_PATH,
      args: [
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
        '--remote-debugging-port=9224'
      ],
      viewport: null
    });
  }

  const p = ctx.pages()[0] || await ctx.newPage();
  console.log('Current URL:', p.url());
  const shotPath = path.join(ARTIFACTS_DIR, 'fb_current_inspect_state.png');
  await p.screenshot({ path: shotPath });
  console.log('Saved screenshot:', shotPath);

  const info = await p.evaluate(() => {
    return {
      title: document.title,
      buttons: Array.from(document.querySelectorAll('div[role="button"], button')).map(b => ({
        text: b.innerText ? b.innerText.trim() : '',
        aria: b.getAttribute('aria-label')
      })).filter(b => b.text || b.aria)
    };
  });

  console.log('Page Title:', info.title);
  console.log('Buttons:', JSON.stringify(info.buttons.slice(0, 20), null, 2));

  process.exit(0);
})();
