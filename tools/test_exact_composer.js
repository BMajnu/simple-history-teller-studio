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

  // Close any popover/notification if open
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  // Click composer
  const composer = page.locator('div[role="button"]:has-text("Write something..."), div[role="button"]:has-text("Create a public post...")').first();
  await composer.click({ force: true });
  await page.waitForTimeout(3000);

  // The Create Post dialog
  const createPostDialog = page.locator('div[role="dialog"]:has-text("Create post"), div[aria-label="Create post"]').last();
  await createPostDialog.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Create post dialog located!');

  // Focus and type into textbox inside this dialog
  const textbox = createPostDialog.locator('div[role="textbox"]').first();
  await textbox.click();

  const postText = `মানুষের প্রথম রাজা কে ছিল? ৩ লক্ষ বছর ধরে কোনো রাজা ছাড়া মানুষ কীভাবে বেঁচে ছিল? 👑

কালাহারির শিকারিদের অদ্ভুত ঐতিহ্য থেকে শুরু করে কৃষিকাজের ফাঁদ, মেসোপটেমিয়ার প্রথম কর আদায় এবং সুমেরীয় সম্রাটদের ইতিহাস। অ্যানিমেটেড স্টাইলে পুরো ইতিহাসটি তুলে ধরা হয়েছে।

👑 সম্পূর্ণ ১৫ মিনিটের তথ্যচিত্রটি ইউটিউবে দেখুন: https://youtu.be/ibG0M13m7I0

#ইতিহাস #প্রথম_রাজা #সুমেরীয় #অ্যানিমেশন #ইতিহাসের_গল্প #banglahistory #documentary`;

  await page.evaluate(({ selector, text }) => {
    const dialog = document.querySelector(selector);
    if (dialog) {
      const box = dialog.querySelector('div[role="textbox"]');
      if (box) {
        box.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        document.execCommand('insertText', false, text);
      }
    }
  }, { selector: 'div[role="dialog"]:has-text("Create post")', text: postText });

  await page.keyboard.press('Escape'); // dismiss hashtag dropdown
  await page.waitForTimeout(6000); // wait for link preview card

  // Find Post button inside createPostDialog
  const postBtn = createPostDialog.locator('div[role="button"]:has-text("Post"), div[aria-label="Post"]').last();
  console.log('Post button visible:', await postBtn.isVisible());
  console.log('Clicking Post button...');
  await postBtn.click({ force: true });

  console.log('Waiting 10s for post submission...');
  await page.waitForTimeout(10000);

  await page.screenshot({ path: 'tools/test_exact_post_success.png' });
  console.log('Saved tools/test_exact_post_success.png');

  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
