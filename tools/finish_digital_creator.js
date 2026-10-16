const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const p = await ctx.newPage();
  await p.goto('https://www.instagram.com/accounts/convert_to_professional_account/', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);

  // If Creator selection needed
  const creatorBox = p.locator('div:has-text("Creator")').last();
  if (await creatorBox.isVisible().catch(() => false)) {
    console.log('Selecting Creator...');
    await creatorBox.click();
    await p.waitForTimeout(500);
    const next1 = p.locator('button:has-text("Next"), div[role="button"]:has-text("Next")').first();
    await next1.click();
    await p.waitForTimeout(1500);
  }

  // If benefits page
  const next2 = p.locator('button:has-text("Next"), div[role="button"]:has-text("Next")').first();
  if (await next2.isVisible().catch(() => false)) {
    console.log('Clicking Next on Creator benefits...');
    await next2.click();
    await p.waitForTimeout(2000);
  }

  // Check show category
  const showBox = p.locator('label:has-text("Show category on profile"), span:has-text("Show category on profile")').first();
  if (await showBox.isVisible().catch(() => false)) {
    console.log('Toggling Show category on profile...');
    await showBox.click();
    await p.waitForTimeout(500);
  }

  // Type Digital in Search
  const searchInput = p.locator('input[placeholder="Search"]').first();
  await searchInput.click();
  await p.keyboard.press('Control+A');
  await p.keyboard.press('Backspace');
  await p.keyboard.type('Digital', { delay: 100 });
  await p.waitForTimeout(2000);

  // Click Digital creator
  console.log('Selecting Digital creator option...');
  const digitalOption = p.locator('div:has-text("Digital creator"), span:has-text("Digital creator"), label:has-text("Digital creator")').last();
  await digitalOption.click();
  await p.waitForTimeout(1000);

  // Check Done button
  const doneBtn = p.locator('button:has-text("Done")').first();
  const isDoneEnabled = await doneBtn.isEnabled();
  console.log('Done button enabled:', isDoneEnabled);

  if (isDoneEnabled) {
    console.log('Clicking Done button...');
    await doneBtn.click();
    await p.waitForTimeout(6000);
  }

  await p.screenshot({ path: 'tools/ig_pro_step4_connect.png' });
  console.log('Saved tools/ig_pro_step4_connect.png. URL now:', p.url());

  const postText = await p.evaluate(() => {
    return Array.from(document.querySelectorAll('h1, h2, h3, button, span')).map(el => el.innerText?.trim()).filter(Boolean).slice(0, 30);
  });
  console.log('Next step elements:', postText);

  await p.close();
  process.exit(0);
})();
