const fs = require('fs');

async function checkApiKey() {
  const code = `
    const pages = browser.contexts()[0].pages();
    const page = pages.find(p => p.url().includes('generate-speech')) || pages[0];
    
    // Navigate to apikey page to see if an API key exists
    await page.goto('https://aistudio.google.com/apikey', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'd:/Graphics Projects/Agentics/daemon/current_screen.png' });
    const text = await page.locator('body').innerText();
    return { title: await page.title(), snippet: text.substring(0, 500) };
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

checkApiKey();
