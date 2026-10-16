const { chromium } = require('playwright-core');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  console.log('Navigating to English video edit page...');
  await page.goto('https://studio.youtube.com/video/lNNFHePozVs/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  // Take full screenshot
  await page.screenshot({ path: 'tools/debug_edit_page.png' });

  // Find all file inputs on the page
  const fileInputsCount = await page.locator('input[type="file"]').count();
  console.log('Count of input[type="file"]:', fileInputsCount);
  for (let i = 0; i < fileInputsCount; i++) {
    const el = page.locator('input[type="file"]').nth(i);
    const html = await el.evaluate(e => ({
      id: e.id,
      name: e.name,
      accept: e.accept,
      outerHTML: e.outerHTML
    }));
    console.log(`File input #${i}:`, html);
  }

  // Find elements with text "Upload file" or "Upload thumbnail"
  const uploadElements = await page.evaluate(() => {
    function getAllTextNodesWith(text) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      const matches = [];
      let node;
      while ((node = walker.nextNode())) {
        if (node.shadowRoot) {
          // Check inside shadow root
          const subWalker = document.createTreeWalker(node.shadowRoot, NodeFilter.SHOW_ELEMENT);
          let subNode;
          while ((subNode = subWalker.nextNode())) {
            if (subNode.innerText && subNode.innerText.includes(text)) {
              matches.push({
                tag: subNode.tagName,
                id: subNode.id,
                className: subNode.className,
                text: subNode.innerText.substring(0, 50),
                inShadow: true,
                parentTag: node.tagName
              });
            }
          }
        }
        if (node.innerText && node.innerText.includes(text) && node.children.length === 0) {
          matches.push({
            tag: node.tagName,
            id: node.id,
            className: node.className,
            text: node.innerText.substring(0, 50),
            inShadow: false
          });
        }
      }
      return matches;
    }
    return getAllTextNodesWith('Upload');
  });

  console.log('Upload matches:', JSON.stringify(uploadElements, null, 2));

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
