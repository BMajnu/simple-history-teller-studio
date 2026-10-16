const fs = require('fs');

async function testDownload() {
  const code = `
    const pages = browser.contexts()[0].pages();
    const page = pages.find(p => p.url().includes('generate-speech')) || pages[0];

    // Wait until Stop button turns back to Run or download is enabled
    for (let i = 0; i < 20; i++) {
      const stopBtn = page.locator('button:has-text("Stop")');
      if (await stopBtn.count() === 0) break;
      await page.waitForTimeout(500);
    }
    
    // Check audio elements
    const audioTags = await page.locator('audio').evaluateAll(els => els.map(e => ({ src: e.src, duration: e.duration })));
    
    // Setup download listener
    let downloadInfo = null;
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(e => ({ error: e.message }));
    
    const downloadBtn = page.locator('button.download-button, button[aria-label*="Download" i]').first();
    const canClick = await downloadBtn.count() > 0;
    if (canClick) {
      await downloadBtn.click();
    }
    
    const dlResult = await downloadPromise;
    if (dlResult && dlResult.saveAs) {
      const targetPath = 'd:/Developing Projects/Itihash Explainer Video/tools/test_aistudio.wav';
      await dlResult.saveAs(targetPath);
      downloadInfo = { saved: true, path: targetPath, suggestedFilename: dlResult.suggestedFilename() };
    } else {
      downloadInfo = dlResult;
    }
    
    return { audioTags, downloadInfo };
  `;
  try {
    const res = await fetch('http://127.0.0.1:9333/run-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    console.log('Result:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

testDownload();
