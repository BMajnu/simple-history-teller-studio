const { chromium } = require('playwright-core');

const CHANNEL_ID = 'UCvEQdVnctkuYZw3iNDo5krg';

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes(CHANNEL_ID) && p.url().includes('editing')) || context.pages()[0];
  await page.bringToFront();

  // Scroll handle into view
  const handleInput = page.locator('input.YtcpChannelEditingChannelHandleHandleInput').first();
  await handleInput.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  console.log('Focusing handle input...');
  await handleInput.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('SimpleHistoryTeller');
  await page.waitForTimeout(3000);

  // Check if handle is taken or has error
  const errorText = await page.evaluate(() => {
    const err = document.querySelector('.error-message, [aria-invalid="true"], #error-message');
    return err ? err.innerText : '';
  });
  console.log('Error check for SimpleHistoryTeller:', errorText);

  // If there's an error or publish is disabled, try SimpleHistoryTellerOfficial
  let pubBtn = page.getByRole('button', { name: 'Publish' }).or(page.locator('button:has-text("Publish")')).first();
  const isPubDisabled = await pubBtn.isDisabled().catch(() => true);
  console.log('Publish disabled with SimpleHistoryTeller:', isPubDisabled);

  if (isPubDisabled || (errorText && errorText.length > 0)) {
    console.log('Trying SimpleHistoryTellerOfficial...');
    await handleInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('SimpleHistoryTellerOfficial');
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: 'tools/c1_handle_entered.png' });

  // Click Publish
  pubBtn = page.getByRole('button', { name: 'Publish' }).or(page.locator('button:has-text("Publish")')).first();
  if (!(await pubBtn.isDisabled())) {
    console.log('Clicking Publish...');
    await pubBtn.click();
    await page.waitForTimeout(6000);
    console.log('Publish clicked and saved!');
  } else {
    console.log('Publish still disabled, inspecting status...');
  }

  await page.screenshot({ path: 'tools/c1_handle_published.png' });
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
