const { chromium } = require('playwright-core');
const path = require('path');
const AVATAR_PATH = path.join(__dirname, '..', 'projects', 'simple_itihash_002_first_language', 'branding', 'avatar_simple_history_teller.jpg');

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('editing')) || context.pages()[0];
  
  // Find all file inputs
  const fileInputs = page.locator('input[type="file"]');
  const count = await fileInputs.count();
  console.log('File inputs count:', count);

  // In Channel 2 earlier, which file input worked? Let's check how Channel 2 uploaded the avatar!
  // Let's inspect the Upload button near "Your profile picture will appear"
  const uploadBtns = page.locator('button:has-text("Upload"), ytcp-button:has-text("Upload")');
  const uCount = await uploadBtns.count();
  console.log('Upload buttons count:', uCount);

  // Let's see what each file input is associated with
  for (let i = 0; i < count; i++) {
    const id = await fileInputs.nth(i).getAttribute('id').catch(() => '');
    const cls = await fileInputs.nth(i).getAttribute('class').catch(() => '');
    const accept = await fileInputs.nth(i).getAttribute('accept').catch(() => '');
    console.log(`Input ${i}: id="${id}", class="${cls}", accept="${accept}"`);
  }

  // Set file on input 1
  console.log('Setting file on input 1...');
  await fileInputs.nth(1).setInputFiles(AVATAR_PATH);
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: 'tools/c3_after_input1.png' });
  
  // Check if dialog is visible
  const dialogVisible = await page.locator('ytcp-image-cropper, tp-yt-paper-dialog, ytcp-dialog').first().isVisible().catch(() => false);
  console.log('Dialog visible:', dialogVisible);

  const doneBtn = page.locator('#done-button, button:has-text("Done"), ytcp-button:has-text("Done")').first();
  console.log('Done button visible:', await doneBtn.isVisible().catch(() => false));
  if (await doneBtn.isVisible()) {
    await doneBtn.click({ force: true });
    await page.waitForTimeout(2000);
    console.log('Clicked Done button!');
  }

  await page.screenshot({ path: 'tools/c3_after_done.png' });
  await browser.disconnect();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
