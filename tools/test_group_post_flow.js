const { chromium } = require('playwright-core');

(async () => {
  const ctx = await chromium.launchPersistentContext('C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3', {
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('https://www.facebook.com/groups/1803711656387813/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // Click composer button
  const btn = page.locator('div[role="button"]:has-text("Write something..."), div[role="button"]:has-text("Create a public post...")').first();
  await btn.click({ force: true });
  await page.waitForTimeout(3000);

  // Focus textbox
  const textbox = page.locator('div[role="dialog"] div[role="textbox"][contenteditable="true"]').first();
  await textbox.click();
  await page.waitForTimeout(1000);

  const testText = `মানুষের প্রথম রাজা কে ছিল? ৩ লক্ষ বছর ধরে কোনো রাজা ছাড়া মানুষ কীভাবে বেঁচে ছিল? 👑

কালাহারির শিকারিদের অদ্ভুত ঐতিহ্য থেকে শুরু করে কৃষিকাজের ফাঁদ, মেসোপটেমিয়ার প্রথম কর আদায় এবং সুমেরীয় সম্রাটদের ইতিহাস। অ্যানিমেটেড স্টাইলে পুরো ইতিহাসটি তুলে ধরা হয়েছে।

👑 সম্পূর্ণ ১৫ মিনিটের তথ্যচিত্রটি ইউটিউবে দেখুন: https://youtu.be/ibG0M13m7I0

#ইতিহাস #প্রথম_রাজা #সুমেরীয় #অ্যানিমেশন #ইতিহাসের_গল্প #banglahistory #documentary`;

  console.log('Inserting text via page.keyboard.insertText...');
  await page.keyboard.insertText(testText);
  await page.waitForTimeout(1000);

  // Dismiss hashtag popup
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  console.log('Waiting 7s for link preview...');
  await page.waitForTimeout(7000);

  await page.screenshot({ path: 'tools/test_text_inserted.png' });
  console.log('Saved test_text_inserted.png');

  // Check if Post button is enabled
  const postBtn = page.locator('div[role="dialog"] div[role="button"]:has-text("Post"), div[role="dialog"] div[aria-label="Post"], div[role="dialog"] button:has-text("Post")').last();
  const isEnabled = await postBtn.isEnabled().catch(() => false);
  const ariaDisabled = await postBtn.getAttribute('aria-disabled').catch(() => null);
  console.log('Post button isEnabled:', isEnabled, 'ariaDisabled:', ariaDisabled);

  // Click Post!
  console.log('Clicking Post button...');
  await postBtn.click({ force: true });
  await page.waitForTimeout(8000);

  await page.screenshot({ path: 'tools/test_post_submitted.png' });
  console.log('Saved test_post_submitted.png');

  await ctx.close();
})().catch(console.error);
