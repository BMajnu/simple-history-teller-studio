const fs = require('fs');

async function checkApiKeyList() {
  const code = `
    const pages = browser.contexts()[0].pages();
    const page = pages.find(p => p.url().includes('apikey')) || pages[0];
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'd:/Graphics Projects/Agentics/daemon/current_screen.png' });
    const keys = await page.locator('table, tr, td, .key-row, [role="row"]').allInnerTexts().catch(() => []);
    return { keys };
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

checkApiKeyList();
