const { chromium } = require('playwright-core');
const path = require('path');

const THUMB_PATH = path.resolve('projects/sample_first_king/metadata/bn_thumbnail_optimized.jpg');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9225');
  const page = browser.contexts()[0].pages()[0];

  console.log('Clicking Choose a thumbnail at (87, 536)...');
  await page.mouse.click(87, 536);
  await page.waitForTimeout(2000);

  // Look for any newly rendered dialog or file inputs
  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  console.log('Found file inputs:', nodeIds.length);
  for (const id of nodeIds) {
    const { attributes } = await session.send('DOM.getAttributes', { nodeId: id });
    const attrStr = attributes.join(' ');
    console.log('Node', id, 'attrs:', attrStr);
    if (attrStr.includes('image/') || attrStr.includes('image/*')) {
      console.log('Attaching custom thumbnail to nodeId:', id);
      await session.send('DOM.setFileInputFiles', {
        files: [THUMB_PATH],
        nodeId: id
      });
      console.log('Attached successfully to nodeId:', id);
    }
  }

  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'tools/after_thumb_attached.png' });
  console.log('Saved tools/after_thumb_attached.png');

  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
