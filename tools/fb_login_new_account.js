const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const EMAIL = 'badiuzzaman.majnu@gmail.com';
const PASS = 'BMajnu78650';

async function main() {
  console.log('=== FACEBOOK LOGIN: NEW ACCOUNT ===');
  console.log('Target Email:', EMAIL);

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  console.log('Navigating to Facebook...');
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  const initialShot = path.join(ARTIFACT_DIR, 'fb_login_initial.png');
  await page.screenshot({ path: initialShot });
  console.log('Initial screenshot saved:', initialShot);

  // Check if already logged in
  const isFeed = await page.locator('[role="feed"], [aria-label*="Facebook"], [aria-label*="Stories"]').first().isVisible({ timeout: 3000 }).catch(() => false);
  const avatarBtn = await page.locator('div[role="button"][aria-label*="Your profile"], svg[aria-label*="Your profile"]').first().isVisible({ timeout: 2000 }).catch(() => false);

  if (isFeed || avatarBtn) {
    console.log('Detected active session on Facebook. Checking user name...');
    const userShot = path.join(ARTIFACT_DIR, 'fb_active_session.png');
    await page.screenshot({ path: userShot });
    // Let's check who is logged in
    const profileText = await page.evaluate(() => {
      return document.body.innerText.substring(0, 500);
    });
    console.log('Session text snippet:', profileText.replace(/\n+/g, ' '));
  }

  // Look for email and password fields
  const emailInput = page.locator('input[name="email"], #email').first();
  const passInput = page.locator('input[name="pass"], #pass').first();
  const loginBtn = page.locator('button[name="login"], button[type="submit"]:has-text("Log In"), button:has-text("Log in")').first();

  if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Login form found. Entering credentials...');
    await emailInput.click();
    await emailInput.fill(EMAIL);
    await page.waitForTimeout(1000);

    await passInput.click();
    await passInput.fill(PASS);
    await page.waitForTimeout(1000);

    const filledShot = path.join(ARTIFACT_DIR, 'fb_credentials_filled.png');
    await page.screenshot({ path: filledShot });
    console.log('Credentials filled screenshot saved:', filledShot);

    console.log('Clicking Log In button...');
    await loginBtn.click();
    console.log('Waiting for response...');
    await page.waitForTimeout(8000);

    const afterLoginShot = path.join(ARTIFACT_DIR, 'fb_after_login_attempt.png');
    await page.screenshot({ path: afterLoginShot });
    console.log('After login screenshot saved:', afterLoginShot);
  } else {
    console.log('No login form visible on landing page.');
  }

  // Check current URL and state
  console.log('Current URL:', page.url());
  const finalShot = path.join(ARTIFACT_DIR, 'fb_login_final_state.png');
  await page.screenshot({ path: finalShot });
  console.log('Final screenshot saved:', finalShot);

  // Keep browser open for a few seconds to verify
  await page.waitForTimeout(5000);
  await ctx.close();
  console.log('Done.');
}

main().catch(err => {
  console.error('Login error:', err);
  process.exit(1);
});
