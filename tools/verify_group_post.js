const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

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
  await page.bringToFront();

  console.log('Navigating to Group 1: ইতিহাস, তথ্য ও তর্ক...');
  await page.goto('https://www.facebook.com/groups/1803711656387813/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  const composer = page.locator('div[role="button"]:has-text("Write something..."), div[role="button"]:has-text("Create a public post..."), span:has-text("Write something..."), span:has-text("Create a public post...")').first();
  await composer.click({ force: true });
  await page.waitForTimeout(3000);

  const postText = `মানুষের প্রথম রাজা কে ছিল? ৩ লক্ষ বছর ধরে কোনো রাজা ছাড়া মানুষ কীভাবে বেঁচে ছিল? 👑

কালাহারির শিকারিদের অদ্ভুত ঐতিহ্য থেকে শুরু করে কৃষিকাজের ফাঁদ, মেসোপটেমিয়ার প্রথম কর আদায় এবং সুমেরীয় সম্রাটদের ইতিহাস। অ্যানিমেটেড স্টাইলে পুরো ইতিহাসটি তুলে ধরা হয়েছে।

👑 সম্পূর্ণ ১৫ মিনিটের তথ্যচিত্রটি ইউটিউবে দেখুন: https://youtu.be/ibG0M13m7I0

#ইতিহাস #প্রথম_রাজা #সুমেরীয় #অ্যানিমেশন #ইতিহাসের_গল্প #banglahistory #documentary`;

  console.log('Typing post into dialog textbox...');
  await page.evaluate((text) => {
    const el = document.querySelector('div[role="dialog"] div[role="textbox"]');
    if (el) {
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
    }
  }, postText);

  // Press escape to close any hashtag popup
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  console.log('Waiting 6s for link preview...');
  await page.waitForTimeout(6000);

  // Click Post
  const postBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Post"), div[role="dialog"] button:has-text("Post")').last();
  console.log('Clicking Post button with force: true...');
  await postBtn.click({ force: true });
  await page.waitForTimeout(10000);

  await page.screenshot({ path: 'tools/debug_post_success.png' });
  console.log('Saved tools/debug_post_success.png');

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
