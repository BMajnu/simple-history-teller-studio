const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const ctx = browser.contexts()[0];
    const page = await ctx.newPage();
    await page.goto('https://flow.google.com/project/6b6c9890-d01a-498e-840d-d27c7ab94128', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    const tile = page.locator('flow-grid-tile-container').first();
    await tile.click();
    await page.waitForTimeout(3000);

    const headerButtons = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('button'));
      return all.map((b, i) => ({
        index: i,
        text: (b.innerText || '').slice(0, 30),
        label: b.getAttribute('aria-label') || '',
        icon: b.querySelector('mat-icon')?.innerText || ''
      })).filter(x => x.text || x.label || x.icon);
    });
    console.log('Header buttons:', JSON.stringify(headerButtons.filter(b => b.icon.includes('download') || b.label.includes('ডাউনলোড') || b.label.includes('Download')), null, 2));

    const dlBtn = page.locator('button:has(mat-icon:has-text("download")), button[aria-label*="ডাউনলোড"], button[aria-label*="Download"]').first();
    if (await dlBtn.count() > 0) {
      console.log('Clicking download button...');
      await dlBtn.click();
      await page.waitForTimeout(1000);

      // Check for menu options
      const menuOptions = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.mat-mdc-menu-item, [role="menuitem"], button')).map(el => ({
          text: (el.innerText || '').trim(),
          class: el.className
        })).filter(x => x.text.includes('720') || x.text.includes('1080') || x.text.includes('MP4') || x.text.includes('ভিডিও'));
      });
      console.log('Quality menu options:', JSON.stringify(menuOptions, null, 2));

      const menuItem = page.locator('.mat-mdc-menu-item:has-text("720p"), .mat-mdc-menu-item:has-text("1080p"), .mat-mdc-menu-item').first();
      if (await menuItem.count() > 0) {
        console.log('Clicking quality menu item...');
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 25000 }),
          menuItem.click()
        ]);
        const outPath = path.join(__dirname, '..', 'projects', 'simple_itihash_002_first_language', 'visual_assets', 'clip_shot_0005.mp4');
        await download.saveAs(outPath);
        console.log('✓ Successfully downloaded clip_shot_0005.mp4! Size:', fs.statSync(outPath).size);
      }
    }

    await page.close();
  } catch (err) {
    console.error('Download clip error:', err);
  }
  process.exit(0);
})();
