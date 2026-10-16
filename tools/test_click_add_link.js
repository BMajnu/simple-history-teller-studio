const { chromium } = require('playwright-core');

const CHANNEL_ID = 'UCvEQdVnctkuYZw3iNDo5krg';

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes(CHANNEL_ID) && p.url().includes('editing')) || context.pages()[0];
  await page.bringToFront();

  const addLinkBtn = page.locator('button.YtcpChannelLinksAddLinkButton, button:has-text("Add link")').first();
  await addLinkBtn.scrollIntoViewIfNeeded();
  await addLinkBtn.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'tools/c1_after_add_link_click.png' });

  // Inspect the new link input fields
  const linkInputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, ytcp-form-input-container')).map(el => ({
      tag: el.tagName,
      id: el.id,
      cls: el.className,
      placeholder: el.placeholder,
      ariaLabel: el.getAttribute('aria-label')
    })).filter(x => x.placeholder || x.ariaLabel);
  });
  console.log('Inputs after Add Link:', linkInputs);

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
