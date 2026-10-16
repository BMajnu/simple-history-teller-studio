const { chromium } = require('playwright-core');

const TITLE = 'মানুষ কীভাবে প্রথম রাজা বানাল? 👑 সিংহাসন ও ক্ষমতার আসল ইতিহাস | Simple History Teller';
const DESCRIPTION = `আজ আমরা কোটি কোটি মানুষ রাষ্ট্রের আইন মানি, ট্যাক্স দিই এবং একজন নেতার শাসন মেনে নিই। কিন্তু হাজার হাজার বছর আগে যখন কোনো রাজা বা সিংহাসন ছিল না, তখন কীভাবে জন্ম নিল পৃথিবীর প্রথম রাজা? 

কালাহারি মরুভূমির সাম্যবাদী শিকারি সমাজ থেকে শুরু করে মেসোপটেমিয়ার শস্যভাণ্ডার এবং সুমেরীয় রাজাতালিকার রহস্য উন্মোচন।

🕒 অধ্যায়সমূহ (Chapters):
00:00 - আমি সময়ের সাক্ষী (The Hook)
01:41 - শিকারকে অপমান করার গোপন রীতি (Insulting the Meat)
03:14 - কৃষিকাজের মারণফাঁদ ও শস্যভাণ্ডার (The Agricultural Trap)
04:43 - পৃথিবীর প্রথম কর ও প্রোটেকশন র‍্যাকেট (The First Warlord)
05:59 - লুগাল ও ঐশ্বরিক রাজত্বের জন্ম (Birth of Divine Kingship)
07:24 - সুমেরীয় রাজাতালিকা ও প্রথম রাজা আলুলিম (The Sumerian King List)
08:53 - পিরামিড, ভয় ও বংশপরম্পরা (Pyramids & Dynasty)
10:40 - ক্ষমতার চিরন্তন সত্য ও আধুনিক রাষ্ট্র (Conclusion)

🔔 পেইজটি ফলো করুন এবং বন্ধুদের সাথে শেয়ার করুন!

#SimpleHistoryTellerBangla #সিম্পলইতিহাস #বাংলাডকুমেন্টারি #প্রথমরাজা #ইতিহাস #AnimatedHistory #OverSimplified #BanglaHistory`;

const FULL_TEXT = `${TITLE}\n\n${DESCRIPTION}`;

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9225');
  const page = browser.contexts()[0].pages()[0];

  const textBox = page.locator('div[role="dialog"] div[role="textbox"]').first();
  await textBox.click();
  await page.waitForTimeout(500);

  const inserted = await page.evaluate((text) => {
    const el = document.querySelector('div[role="dialog"] div[role="textbox"]');
    if (!el) return false;
    el.focus();
    return document.execCommand('insertText', false, text);
  }, FULL_TEXT);

  console.log('execCommand insertText result:', inserted);

  // If execCommand failed or returned false, try clipboard or direct key typing
  if (!inserted) {
    console.log('Trying keyboard insertText directly after focus...');
    await page.keyboard.insertText(FULL_TEXT);
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'tools/after_text_insert.png' });
  console.log('Saved tools/after_text_insert.png');

  process.exit(0);
})().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
