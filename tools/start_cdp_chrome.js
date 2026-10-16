const { chromium } = require('playwright-core');
const path = require('path');

const profileDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Launching Chrome with persistent context...');
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    executablePath: chromePath,
    args: [
      '--remote-debugging-port=9224',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://aistudio.google.com/u/3/prompts/new_chat?model=gemini-omni-1.1-flash');
  console.log('Navigated to Omni 1.1 Flash. Keeping alive...');

  // Keep alive indefinitely with active timer
  setInterval(() => {
    // heartbeat
  }, 10000);
})().catch(console.error);
