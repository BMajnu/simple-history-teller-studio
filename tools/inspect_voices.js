const fs = require('fs');

async function inspectVoices() {
  const code = `
    const pages = browser.contexts()[0].pages();
    const page = pages.find(p => p.url().includes('generate-speech')) || pages[0];

    // Click on voice chip or speaker card
    const voiceCard = page.locator('.active-voice-card-trigger, .voice-playground-chip, .voice-chip').first();
    if (await voiceCard.count() > 0) {
      await voiceCard.click();
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'd:/Graphics Projects/Agentics/daemon/current_screen.png' });
    
    // Look for voice list or options
    const voices = await page.locator('button, [role="option"], .voice-option, .mat-mdc-menu-item').evaluateAll(els => 
      els.map(e => ({ text: e.innerText.trim(), ariaLabel: e.getAttribute('aria-label') }))
         .filter(e => e.text.length > 0 && e.text.length < 50)
    );
    
    return { voices: voices.slice(0, 40) };
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

inspectVoices();
