const { chromium } = require('playwright-core');
const path = require('path');

const VIDEO_PATH = path.resolve('projects/sample_first_king/renders/video_bn.mp4');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9225');
  const page = browser.contexts()[0].pages()[0];

  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  console.log('Doc root nodeId:', doc.root.nodeId);

  // Find all file inputs via CDP
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });
  console.log('Found file inputs:', nodeIds);

  for (const nodeId of nodeIds) {
    const { attributes } = await session.send('DOM.getAttributes', { nodeId });
    console.log('Node', nodeId, 'attrs:', attributes);
  }

  // Use the last file input (or the one accepting video)
  const targetNodeId = nodeIds[nodeIds.length - 1];
  console.log('Setting file on nodeId:', targetNodeId, 'path:', VIDEO_PATH);
  await session.send('DOM.setFileInputFiles', {
    files: [VIDEO_PATH],
    nodeId: targetNodeId
  });
  console.log('Successfully set file input via CDP DOM.setFileInputFiles!');

  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tools/after_cdp_set_file.png' });
  console.log('Saved tools/after_cdp_set_file.png');

  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
