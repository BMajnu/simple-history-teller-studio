const fs = require('fs');

async function test() {
  const code = `
    const pages = browser.contexts()[0].pages();
    const page = pages.find(p => p.url().includes('generate-speech')) || pages[0];
    
    // Press escape twice to dismiss overlays
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Or click close button with force: true inside overlay
    const closeBtn = page.locator('.cdk-overlay-container button').filter({ hasText: /close/i });
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click({ force: true }).catch(() => {});
    }
    
    // Check if there is an 'x' icon or button
    const xBtn = page.locator('.cdk-overlay-pane button[aria-label*="Close"], .cdk-overlay-pane mat-icon:text("close")');
    if (await xBtn.count() > 0) {
      await xBtn.first().click({ force: true }).catch(() => {});
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'd:/Graphics Projects/Agentics/daemon/current_screen.png' });
    return { ok: true, url: page.url() };
  `;
  try {
    const res = await fetch('http://127.0.0.1:9333/run-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    console.log('Result:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
