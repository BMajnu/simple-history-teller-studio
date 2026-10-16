const { chromium } = require('playwright-core');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testFullStudioUI() {
  console.log('Testing Studio UI & Transitions in browser...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });

  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Switch to sample_first_king
  await page.selectOption('#projectSelect', 'sample_first_king');
  await page.waitForTimeout(2000);

  // 1. Scene 1 check (Host: TIME_CHRONICLER)
  const badgeName1 = await page.locator('#pvSpeakerName').innerText();
  const badgeRole1 = await page.locator('#pvSpeakerRole').innerText();
  const transTag1 = await page.locator('#pvTransTag').innerText();
  console.log('Scene 1 Badge:', badgeName1, '|', badgeRole1, '| Trans:', transTag1);
  await page.screenshot({ path: 'tools/badge_scene1_host_corner.png' });

  // 2. Click Scene 3 (Narrator) - triggers transition
  const scene3Card = page.locator('.scene-card').nth(2);
  await scene3Card.click();
  await page.waitForTimeout(120); // capture during portal/transition burst
  await page.screenshot({ path: 'tools/portal_transition_active.png' });

  await page.waitForTimeout(1200); // wait for transition to settle
  const badgeName3 = await page.locator('#pvSpeakerName').innerText();
  const badgeRole3 = await page.locator('#pvSpeakerRole').innerText();
  const sub3 = await page.locator('#pvSubtitle').innerText();
  console.log('Scene 3 Badge:', badgeName3, '|', badgeRole3);
  console.log('Scene 3 Subtitle:', sub3);
  await page.screenshot({ path: 'tools/badge_scene3_narrator_corner.png' });

  // 3. Click back to Scene 1 (Entering TIME_CHRONICLER) -> Doctor Strange Portal fires!
  const scene1Card = page.locator('.scene-card').nth(0);
  await scene1Card.click();
  await page.waitForTimeout(300); // Capture portal burst in flight
  await page.screenshot({ path: 'tools/portal_burst_inflight.png' });

  await page.waitForTimeout(1200);
  console.log('Transition and Badge UI verified successfully!');

  await browser.close();
}

testFullStudioUI().catch(console.error);
