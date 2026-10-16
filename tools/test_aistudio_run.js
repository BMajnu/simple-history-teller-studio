const fs = require('fs');

async function testRun() {
  const code = `
    const pages = browser.contexts()[0].pages();
    const page = pages.find(p => p.url().includes('generate-speech')) || pages[0];

    // Find the Run button
    const runBtn = page.locator('button:has-text("Run"), button.ctrl-enter-submits, button[aria-label*="Run"]').first();
    console.log('Run button text:', await runBtn.innerText().catch(() => 'none'));
    
    // Click Run
    await runBtn.click();
    console.log('Clicked Run, waiting for generation...');
    
    // Wait up to 30s for generation to complete (audio player or download button to appear)
    let finished = false;
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000);
      
      // Check for audio element or download button or play button
      const audio = page.locator('audio');
      const downloadBtn = page.locator('button[aria-label*="Download" i], button:has-text("Download"), [download]');
      const playBtn = page.locator('button[aria-label*="Play" i], mat-icon:has-text("play_arrow")');
      const errorMsg = page.locator('.error, [role="alert"], .snackbar');
      
      const audioCount = await audio.count();
      const dlCount = await downloadBtn.count();
      const playCount = await playBtn.count();
      const errCount = await errorMsg.count();
      
      let errText = '';
      if (errCount > 0) {
        errText = await errorMsg.first().innerText().catch(() => '');
      }

      if (dlCount > 0 || audioCount > 0 || playCount > 0 || errText) {
        console.log(\`Check \${i}s: audio=\${audioCount}, dl=\${dlCount}, play=\${playCount}, err=\${errText}\`);
        if (dlCount > 0 || audioCount > 0) {
          finished = true;
          break;
        }
      }
    }
    
    await page.screenshot({ path: 'd:/Graphics Projects/Agentics/daemon/current_screen.png' });
    
    // List all buttons on page for inspection
    const buttons = await page.locator('button').evaluateAll(elements => 
      elements.map(el => ({
        ariaLabel: el.getAttribute('aria-label'),
        text: el.innerText.trim(),
        className: el.className
      })).filter(b => b.ariaLabel || b.text)
    );
    
    return { finished, buttons: buttons.slice(-20) };
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

testRun();
