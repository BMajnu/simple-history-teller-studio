const { chromium } = require('playwright-core');

async function inspectProjectSelector() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];
  
  await page.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  
  // Find project elements
  const info = await page.evaluate(() => {
    const elList = Array.from(document.querySelectorAll('*')).filter(el => {
      const txt = (el.innerText || '').toLowerCase();
      return txt.includes('master-sector') || txt.includes('project') || txt.includes('fluent-stratum');
    });
    return elList.map(e => ({ tag: e.tagName, text: e.innerText?.substring(0, 100), class: e.className })).slice(0, 10);
  });
  
  console.log('Project elements:', JSON.stringify(info, null, 2));
}

inspectProjectSelector().catch(console.error);
