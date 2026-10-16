const fs = require('fs');
const path = require('path');

async function testBengali() {
  const banglaText = "আমি সময়ের সাক্ষী। আজ তুমি যে ভাষায় তোমার বন্ধুদের সাথে কথা বলছো, ভেবে দেখেছো কখনো—কোথা থেকে এলো এই ভাষা?";
  const escapedText = banglaText.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
  
  const downloadsDir = 'C:\\Users\\badiu\\Downloads';
  const beforeFiles = new Set(fs.readdirSync(downloadsDir));

  const code = `
    const pages = browser.contexts()[0].pages();
    const page = pages.find(p => p.url().includes('generate-speech')) || pages[0];

    // Close any open voice drawer/modal
    const closeBtn = page.locator('button[aria-label="Close panel"], button[aria-label="Close dialog"]').first();
    if (await closeBtn.count() > 0) {
      await closeBtn.click().catch(() => {});
      await page.waitForTimeout(500);
    }

    // Set textarea text
    const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
    await textarea.focus();
    await textarea.fill("${escapedText}");
    await page.waitForTimeout(500);

    // Click Run
    const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
    await runBtn.click();
    console.log('Clicked Run for Bengali test...');

    // Wait for generation to complete (up to 45s)
    let success = false;
    for (let i = 0; i < 45; i++) {
      await page.waitForTimeout(1000);
      const stopBtn = page.locator('button:has-text("Stop")');
      if (await stopBtn.count() === 0) {
        success = true;
        break;
      }
    }
    
    await page.waitForTimeout(1000);
    
    // Click Download button
    const dlBtn = page.locator('button.download-button, button[aria-label*="Download" i]').first();
    if (await dlBtn.count() > 0) {
      await dlBtn.click();
      console.log('Clicked Download button');
      await page.waitForTimeout(3000);
    }
    
    await page.screenshot({ path: 'd:/Graphics Projects/Agentics/daemon/current_screen.png' });
    return { success };
  `;

  try {
    const res = await fetch('http://127.0.0.1:9333/run-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    console.log('Daemon response:', data);

    const afterFiles = fs.readdirSync(downloadsDir);
    const newFiles = afterFiles.filter(f => !beforeFiles.has(f) && f.endsWith('.wav'));
    console.log('New generated files:', newFiles);
    
    if (newFiles.length > 0) {
      const generatedFile = path.join(downloadsDir, newFiles[0]);
      console.log('File generated successfully at:', generatedFile);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testBengali();
