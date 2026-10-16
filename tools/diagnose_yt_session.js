/**
 * diagnose_yt_session.js
 * Check YouTube Studio login state and UI elements
 */

const { chromium } = require('playwright-core');
const path = require('path');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('=== DIAGNOSING YOUTUBE STUDIO SESSION ===');

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // 1. Go to YouTube Studio
  console.log('1. Going to YouTube Studio...');
  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000);

  // Take screenshot
  await page.screenshot({ path: 'tools/diag_studio_home.png' });
  console.log('Screenshot saved: tools/diag_studio_home.png');

  // Check current URL
  const url = page.url();
  console.log('Current URL:', url);

  // Check if logged in
  const pageText = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('Page text preview:', pageText.substring(0, 300));

  // Check for channel title
  const channelTitle = await page.evaluate(() => {
    const selectors = [
      '#channel-title',
      'ytcp-entity-page-header .title',
      '#entity-name',
      '[id="channel-title"]',
      'ytcp-channel-name',
      '.ytcp-channel-name-wrapper'
    ];
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el) return `[${s}]: ${el.textContent.trim()}`;
    }
    return 'Not found';
  });
  console.log('Channel title:', channelTitle);

  // Check for create button
  const createBtn = await page.evaluate(() => {
    const selectors = ['#create-icon', 'button[aria-label*="Create"]', 'ytcp-button'];
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el) return `[${s}]: ${el.textContent.trim() || el.getAttribute('aria-label') || 'found'}`;
    }
    return 'Not found';
  });
  console.log('Create button:', createBtn);

  // Check if there's a sign-in button (not logged in)
  const signInBtn = await page.evaluate(() => {
    const el = document.querySelector('a[href*="signin"], button:has-text("Sign in"), ytd-button-renderer a[href*="accounts.google.com"]');
    return el ? 'SIGN IN BUTTON FOUND - NOT LOGGED IN!' : 'No sign-in button (logged in or unknown)';
  });
  console.log('Login status:', signInBtn);

  // List visible buttons
  const buttons = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, ytcp-button, tp-yt-paper-button'));
    return btns.slice(0, 20).map(b => ({
      tag: b.tagName,
      text: b.textContent.trim().substring(0, 30),
      id: b.id || '',
      ariaLabel: b.getAttribute('aria-label') || ''
    }));
  });
  console.log('Visible buttons (first 20):');
  buttons.forEach(b => console.log(`  ${b.tag}#${b.id} "${b.text}" [${b.ariaLabel}]`));

  // 2. Try navigating to English channel
  console.log('\n2. Navigating to English channel...');
  await page.goto('https://studio.youtube.com/channel/UCvEQdVnctkuYZw3iNDo5krg', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'tools/diag_en_channel.png' });
  console.log('English channel URL:', page.url());

  const enChannelTitle = await page.evaluate(() => {
    const selectors = ['#channel-title', 'ytcp-entity-page-header .title', '#entity-name', 'ytcp-channel-name'];
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el && el.textContent.trim()) return `[${s}]: ${el.textContent.trim()}`;
    }
    return 'Not found';
  });
  console.log('EN channel title:', enChannelTitle);

  // Check for Create button
  const createBtnEn = await page.evaluate(() => {
    const el = document.querySelector('#create-icon, ytcp-button:contains("Upload"), ytcp-button');
    return el ? `Found: ${el.id || el.textContent.trim().substring(0, 30)}` : 'Not found';
  });
  console.log('Create button on EN channel:', createBtnEn);

  // Try clicking create
  console.log('Attempting to click Create button...');
  const createIconEl = page.locator('#create-icon').first();
  const isVisible = await createIconEl.isVisible({ timeout: 3000 }).catch(() => false);
  console.log('#create-icon visible:', isVisible);

  if (isVisible) {
    await createIconEl.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tools/diag_after_create_click.png' });
    console.log('Clicked create icon, screenshot saved');
  }

  await ctx.close();
  console.log('\n=== DIAGNOSIS COMPLETE ===');
  process.exit(0);
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
