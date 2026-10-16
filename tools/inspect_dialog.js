const { chromium } = require('playwright-core');

async function inspectDialog() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];
  
  const dialogInfo = await page.evaluate(() => {
    const dialog = document.querySelector('mat-dialog-container, .cdk-overlay-pane, [role="dialog"]');
    if (!dialog) return { hasDialog: false };
    
    return {
      hasDialog: true,
      html: dialog.innerHTML.substring(0, 500),
      buttons: Array.from(dialog.querySelectorAll('button')).map(b => ({
        text: b.innerText.trim(),
        ariaLabel: b.getAttribute('aria-label'),
        class: b.className,
        rect: b.getBoundingClientRect()
      }))
    };
  });
  
  console.log('Dialog Info:', JSON.stringify(dialogInfo, null, 2));

  // If dialog has buttons, click the first one or click top right X
  if (dialogInfo.hasDialog && dialogInfo.buttons.length > 0) {
    console.log('Clicking dialog button...');
    const dlg = page.locator('mat-dialog-container, [role="dialog"]').first();
    // Usually the close X is a button with an svg or mat-icon
    const xBtn = dlg.locator('button').first();
    await xBtn.click();
    console.log('Clicked first button in dialog.');
  } else if (dialogInfo.hasDialog) {
    // Click outside
    console.log('Clicking outside backdrop...');
    await page.mouse.click(50, 50);
  }
}

inspectDialog().catch(console.error);
