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
  await page.bringToFront();

  console.log('Navigating to group...');
  await page.goto('https://www.facebook.com/groups/1803711656387813/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // Click composer button
  const composer = page.locator('div[role="button"]:has-text("Write something..."), div[role="button"]:has-text("Create a public post..."), span:has-text("Write something..."), span:has-text("Create a public post...")').first();
  await composer.click({ force: true });
  await page.waitForTimeout(3000);

  // Focus dialog textbox
  const dialogBox = page.locator('div[role="dialog"] div[role="textbox"]').first();
  await dialogBox.waitFor({ state: 'visible', timeout: 10000 });
  await dialogBox.click();
  await page.waitForTimeout(500);

  const testText = `মানুষের প্রথম রাজা কে ছিল? ৩ লক্ষ বছর ধরে কোনো রাজা ছাড়া মানুষ কীভাবে বেঁচে ছিল? 👑

কালাহারির শিকারিদের অদ্ভুত ঐতিহ্য থেকে শুরু করে কৃষিকাজের ফাঁদ, মেসোপটেমিয়ার প্রথম কর আদায় এবং সুমেরীয় সম্রাটদের ইতিহাস। অ্যানিমেটেড স্টাইলে পুরো ইতিহাসটি তুলে ধরা হয়েছে।

👑 সম্পূর্ণ ১৫ মিনিটের তথ্যচিত্রটি ইউটিউবে দেখুন: https://youtu.be/ibG0M13m7I0

#ইতিহাস #প্রথম_রাজা #সুমেরীয় #অ্যানিমেশন #ইতিহাসের_গল্প #banglahistory #documentary`;

  await page.evaluate((text) => {
    const el = document.querySelector('div[role="dialog"] div[role="textbox"]');
    if (el) {
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
    }
  }, testText);

  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'tools/test_composer_filled.png' });
  console.log('Saved tools/test_composer_filled.png');

  // Check Post button
  const postBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Post"), div[role="dialog"] button:has-text("Post")').last();
  const isPostEnabled = await postBtn.isEnabled().catch(() => false);
  const ariaDisabled = await postBtn.getAttribute('aria-disabled').catch(() => null);
  console.log('Post button isEnabled:', isPostEnabled, 'aria-disabled:', ariaDisabled);

  if (ariaDisabled !== 'true') {
    console.log('Clicking Post button...');
    await postBtn.click({ force: true });
    await page.waitForTimeout(6000);
    await page.screenshot({ path: 'tools/test_composer_after_post.png' });
    console.log('Saved tools/test_composer_after_post.png');
  }

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
