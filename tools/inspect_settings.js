const { chromium } = require('playwright-core');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://studio.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Click Settings
  const settingsBtn = page.locator('#settings-button, button[aria-label="Settings"], #item-settings').first();
  if (await settingsBtn.isVisible()) {
    await settingsBtn.click();
    await page.waitForTimeout(3000);

    // Click Channel
    const channelTab = page.locator('paper-tab:has-text("Channel"), #channel-item, ytcp-navigation-item:has-text("Channel")').first();
    if (await channelTab.isVisible()) {
      await channelTab.click();
      await page.waitForTimeout(2000);

      // Click Feature eligibility
      const featureTab = page.locator('paper-tab:has-text("Feature eligibility"), [tab-id="feature-eligibility"]').first();
      if (await featureTab.isVisible()) {
        await featureTab.click();
        await page.waitForTimeout(2000);
      }
    }
    await page.screenshot({ path: 'tools/feature_eligibility_status.png' });
    console.log('Saved tools/feature_eligibility_status.png');
  }

  await ctx.close();
})();
