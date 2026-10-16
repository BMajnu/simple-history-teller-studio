const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function clickUseOther() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const clicked = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*')).find(e => e.innerText && e.innerText.trim() === 'অন্য একটি অ্যাকাউন্ট ব্যবহার করুন');
    if (el) {
      el.click();
      return true;
    }
    return false;
  });
  console.log('Clicked use other:', clicked);
  await page.waitForTimeout(2500);

  const shot = await page.screenshot({ type: 'png' });
  const shotPath = path.join(__dirname, 'after_click_use_other.png');
  fs.writeFileSync(shotPath, shot);
  console.log('Current URL:', page.url());
}

clickUseOther().catch(console.error);
