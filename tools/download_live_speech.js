const fs = require('fs');
const path = require('path');

async function downloadGeneratedSpeech() {
  const downloadsDir = 'C:\\Users\\badiu\\Downloads';
  const beforeFiles = new Set(fs.readdirSync(downloadsDir));

  const code = `
    const dlBtn = page.locator('button.download-button, button[aria-label*="Download" i]').first();
    if (await dlBtn.count() > 0) {
      await dlBtn.click();
      await page.waitForTimeout(3000);
    }
    return { clicked: true };
  `;

  try {
    const res = await fetch('http://127.0.0.1:9333/run-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    console.log(await res.json());

    const afterFiles = fs.readdirSync(downloadsDir);
    const newFiles = afterFiles.filter(f => !beforeFiles.has(f) && f.endsWith('.wav'));
    console.log('New downloaded wav files:', newFiles);
    
    if (newFiles.length > 0) {
      const srcFile = path.join(downloadsDir, newFiles[0]);
      const destFile = 'd:\\Developing Projects\\Itihash Explainer Video\\scratch\\aistudio_test_bengali.wav';
      fs.copyFileSync(srcFile, destFile);
      console.log('Copied to:', destFile, 'Size:', fs.statSync(destFile).size, 'bytes');
    }
  } catch (e) {
    console.error(e);
  }
}

downloadGeneratedSpeech();
