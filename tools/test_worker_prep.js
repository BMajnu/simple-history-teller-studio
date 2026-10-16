const { chromium } = require('playwright-core');

async function testWorkerPrep() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  
  console.log('Navigating to generate-speech...');
  await page.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  
  await page.keyboard.press('Escape');
  
  const createCard = page.locator('text="Create new dialog"').first();
  if (await createCard.isVisible().catch(() => false)) {
    console.log('Clicking "Create new dialog"...');
    await createCard.click();
    await page.waitForTimeout(2000);
  }
  
  const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
  await textarea.waitFor({ timeout: 10000 });
  console.log('✓ Textarea is ready and visible!');
  
  // Test typing a phrase
  await textarea.fill('পরীক্ষা চলছে');
  await page.waitForTimeout(500);
  
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  console.log('Run button visible:', await runBtn.isVisible());
  
  await page.close();
  console.log('Worker test complete.');
}

testWorkerPrep().catch(console.error);
