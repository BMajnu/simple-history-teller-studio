const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const SHORT_PATH = path.resolve('projects/sample_first_king/renders/shorts_full/short_bn_full1.mp4');
const CAPTION = 'মানুষের প্রথম রাজা? শিকারিকে উপহাস! 👑 [১ম পর্ব] #Shorts #ইতিহাস #বাংলা #প্রথমরাজা #BanglaHistory';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://www.tiktok.com/tiktokstudio/upload', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Find file input
  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  console.log('TikTok file inputs count:', nodeIds.length);
  if (nodeIds.length > 0) {
    console.log('Setting file on nodeId:', nodeIds[0]);
    await session.send('DOM.setFileInputFiles', {
      files: [SHORT_PATH],
      nodeId: nodeIds[0]
    });
  }

  console.log('Waiting 10 seconds for TikTok video processing...');
  await page.waitForTimeout(10000);

  await page.screenshot({ path: 'tools/tiktok_after_file_attach.png' });
  console.log('Saved tools/tiktok_after_file_attach.png');

  // Check caption textbox and post button
  const inputs = await page.evaluate(() => {
    return {
      textareas: Array.from(document.querySelectorAll('div[contenteditable="true"], textarea, input[type="text"]')).map(el => ({
        tag: el.tagName,
        className: el.className,
        placeholder: el.getAttribute('placeholder')
      })),
      buttons: Array.from(document.querySelectorAll('button, div[role="button"]')).map(el => el.innerText.trim()).filter(Boolean)
    };
  });

  console.log('TikTok editor inputs:', JSON.stringify(inputs, null, 2));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
