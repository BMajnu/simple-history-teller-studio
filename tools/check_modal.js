const fs = require('fs');

async function checkModal() {
  const code = `
    const pages = browser.contexts()[0].pages();
    const page = pages.find(p => p.url().includes('generate-speech')) || pages[0];

    // Read the text inside the modal
    const modal = page.locator('mat-dialog-container, .cdk-overlay-pane, [role="dialog"]');
    const modalText = await modal.allInnerTexts().catch(() => []);
    
    // Dismiss it by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Let's see what is on the page
    const pageText = await page.locator('body').innerText();
    
    return { modalText, pageSnippet: pageText.substring(0, 300) };
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

checkModal();
