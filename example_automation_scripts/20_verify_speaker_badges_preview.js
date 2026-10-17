const { chromium } = require('playwright-core');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testUI() {
  console.log('Testing Studio UI in browser...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Switch to sample_first_king
  await page.selectOption('#projectSelect', 'sample_first_king');
  await page.waitForTimeout(2000);

  // 1. Scene 1 check (Host: TIME_CHRONICLER)
  const badgeName1 = await page.locator('#pvSpeakerName').innerText();
  const badgeRole1 = await page.locator('#pvSpeakerRole').innerText();
  console.log('Scene 1 Badge:', badgeName1, '|', badgeRole1);
  await page.screenshot({ path: 'tools/badge_scene1_host.png' });

  // 2. Select Scene 3 (Narrator)
  const scene3Card = page.locator('.scene-card').nth(2);
  await scene3Card.click();
  await page.waitForTimeout(800);
  const badgeName3 = await page.locator('#pvSpeakerName').innerText();
  const badgeRole3 = await page.locator('#pvSpeakerRole').innerText();
  const sub3 = await page.locator('#pvSubtitle').innerText();
  console.log('Scene 3 Badge:', badgeName3, '|', badgeRole3);
  console.log('Scene 3 Subtitle:', sub3);
  await page.screenshot({ path: 'tools/badge_scene3_narrator.png' });

  // 3. Select Scene 5 (Hunter Chief)
  const scene5Card = page.locator('.scene-card').nth(4);
  await scene5Card.click();
  await page.waitForTimeout(800);
  const badgeName5 = await page.locator('#pvSpeakerName').innerText();
  const badgeRole5 = await page.locator('#pvSpeakerRole').innerText();
  const sub5 = await page.locator('#pvSubtitle').innerText();
  console.log('Scene 5 Badge:', badgeName5, '|', badgeRole5);
  console.log('Scene 5 Subtitle:', sub5);
  await page.screenshot({ path: 'tools/badge_scene5_hunter.png' });

  // 4. Test Language Switch to English
  const enBtn = page.locator('#previewLangSwitch button[data-lang="en"]');
  await enBtn.click();
  await page.waitForTimeout(800);
  const badgeNameEn = await page.locator('#pvSpeakerName').innerText();
  const badgeRoleEn = await page.locator('#pvSpeakerRole').innerText();
  console.log('Scene 5 EN Badge:', badgeNameEn, '|', badgeRoleEn);

  await browser.close();
  console.log('UI Verification Complete!');
}

testUI().catch(console.error);
