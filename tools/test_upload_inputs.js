const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('editing/profile')) || ctx.pages()[0];

  if (!page.url().includes('editing/profile')) {
    await page.goto('https://studio.youtube.com/channel/UCkG4y9NJQ5yCys3jxFDUOcg/editing/profile', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
  }

  // Scroll down to branding section
  const bannerSection = page.locator('ytcp-banner-upload').first();
  if (await bannerSection.count() > 0) {
    await bannerSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tools/studio_branding_section.png' });
    console.log('Saved tools/studio_branding_section.png');

    const bannerButtons = await bannerSection.locator('button, ytcp-button').allInnerTexts();
    console.log('Banner buttons:', bannerButtons);
  }

  const profileSection = page.locator('ytcp-profile-image-upload').first();
  if (await profileSection.count() > 0) {
    const profileButtons = await profileSection.locator('button, ytcp-button').allInnerTexts();
    console.log('Profile buttons:', profileButtons);
  }

  process.exit(0);
})();
