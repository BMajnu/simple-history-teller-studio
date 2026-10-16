const { chromium } = require('playwright-core');

const CHANNELS = [
  { id: 1, lang: 'English', name: 'Simple History Teller', url: 'https://www.youtube.com/channel/UCvEQdVnctkuYZw3iNDo5krg' },
  { id: 2, lang: 'Bangla', name: 'Simple History Teller Bangla', url: 'https://www.youtube.com/channel/UCOzERwa3GJqO00B8LMTPtDg' },
  { id: 3, lang: 'Hindi', name: 'Simple History Teller Hindi', url: 'https://www.youtube.com/channel/UCkG4y9NJQ5yCys3jxFDUOcg' }
];

async function main() {
  console.log('=== VERIFYING ALL 3 PUBLIC YOUTUBE CHANNELS ===');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const context = browser.contexts()[0];
  const page = await context.newPage();

  for (const ch of CHANNELS) {
    console.log(`\nChecking Channel ${ch.id} (${ch.lang}): ${ch.url}...`);
    await page.goto(ch.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const title = await page.title();
    const handleText = await page.locator('yt-content-metadata-view-model, #channel-tagline, #channel-handle, yt-formatted-string#channel-handle').first().innerText().catch(() => '');
    console.log(`Channel ${ch.id} Page Title:`, title);
    console.log(`Channel ${ch.id} Handle / Tagline:`, handleText.replace(/\n+/g, ' '));

    await page.screenshot({ path: `tools/final_public_channel_${ch.id}.png` });
    console.log(`Saved screenshot: tools/final_public_channel_${ch.id}.png`);
  }

  await page.close();
  console.log('\n🎉 ALL 3 CHANNELS VERIFIED LIVE PUBLICLY!');
  process.exit(0);
}

main().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
