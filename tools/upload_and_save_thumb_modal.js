const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const THUMB_PATH = path.resolve('projects/sample_first_king/metadata/bn_thumbnail_optimized.jpg');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9225');
  const page = browser.contexts()[0].pages()[0];

  console.log('Inspecting Upload and Save buttons...');
  const uploadBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Upload"), div[role="dialog"] span:has-text("Upload")').first();
  console.log('Upload visible:', await uploadBtn.isVisible().catch(() => false));

  // Find file inputs in the modal or on page
  const session = await page.context().newCDPSession(page);
  const doc = await session.send('DOM.getDocument', { depth: 0 });
  const { nodeIds } = await session.send('DOM.querySelectorAll', {
    nodeId: doc.root.nodeId,
    selector: 'input[type="file"]'
  });

  console.log('File inputs count:', nodeIds.length);
  let thumbAttached = false;
  for (const id of nodeIds) {
    const { attributes } = await session.send('DOM.getAttributes', { nodeId: id });
    const attrStr = attributes.join(' ');
    console.log('Input node', id, 'attrs:', attrStr);
    if (attrStr.includes('.jpg') || attrStr.includes('.jpeg') || attrStr.includes('image/')) {
      console.log('Attaching thumbnail to nodeId:', id);
      await session.send('DOM.setFileInputFiles', {
        files: [THUMB_PATH],
        nodeId: id
      });
      thumbAttached = true;
    }
  }

  // Also click Upload button if needed
  if (await uploadBtn.isVisible().catch(() => false)) {
    console.log('Clicking Upload button...');
    await uploadBtn.click();
    await page.waitForTimeout(2000);

    // Re-check file inputs after clicking upload
    const { nodeIds: newNodeIds } = await session.send('DOM.querySelectorAll', {
      nodeId: doc.root.nodeId,
      selector: 'input[type="file"]'
    });
    for (const id of newNodeIds) {
      const { attributes } = await session.send('DOM.getAttributes', { nodeId: id });
      const attrStr = attributes.join(' ');
      if (attrStr.includes('.jpg') || attrStr.includes('.jpeg') || attrStr.includes('image/')) {
        console.log('Attaching thumbnail to new nodeId:', id);
        await session.send('DOM.setFileInputFiles', {
          files: [THUMB_PATH],
          nodeId: id
        });
      }
    }
  }

  await page.waitForTimeout(3000);

  // Click Save button if enabled
  const saveBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Save"), div[role="dialog"] span:has-text("Save")').first();
  if (await saveBtn.isVisible().catch(() => false)) {
    console.log('Clicking Save button...');
    await saveBtn.click();
    await page.waitForTimeout(3000);
  }

  // Screenshot final preview
  const previewPath = 'tools/fb_master_preview_ready.png';
  await page.screenshot({ path: previewPath });
  console.log('Saved tools/fb_master_preview_ready.png');

  const artifactDir = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';
  fs.copyFileSync(previewPath, path.join(artifactDir, 'fb_master_preview_ready.png'));
  console.log('Copied to artifact dir!');

  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
