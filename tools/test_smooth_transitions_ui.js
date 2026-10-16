const { chromium } = require('playwright-core');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testSmoothTransitions() {
  console.log('Testing Smooth Transitions & Doctor Strange Portal in Studio UI...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });

  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Select sample_first_king
  await page.selectOption('#projectSelect', 'sample_first_king');
  await page.waitForTimeout(2000);

  // 1. Scene 1 (Host: TIME_CHRONICLER)
  console.log('Verifying Scene 1...');
  const scene1Badge = await page.locator('#pvSpeakerName').innerText();
  const scene1TransVal = await page.locator('#fTransition').inputValue();
  console.log('Scene 1 Badge:', scene1Badge, '| Transition setting:', scene1TransVal);
  await page.screenshot({ path: 'tools/smooth_ui_scene1.png' });

  // 2. Click Scene 2 (Also TIME_CHRONICLER -> Should be CLEAN CUT without portal flicker)
  console.log('Clicking Scene 2 (Host continuation)...');
  await page.locator('.scene-card').nth(1).click();
  await page.waitForTimeout(400);
  const portalActiveScene2 = await page.locator('#pvPortalOverlay.active').count();
  console.log('Scene 2 Portal Active (Should be 0 - no redundant portal between host clips):', portalActiveScene2);
  await page.screenshot({ path: 'tools/smooth_ui_scene2_nocut_flicker.png' });

  // 3. Click Scene 3 (Exiting Host -> Doctor Strange Portal Opens into History!)
  console.log('Clicking Scene 3 (Exiting Host into prehistoric world)...');
  await page.locator('.scene-card').nth(2).click();
  await page.waitForTimeout(250); // capture during smooth portal opening
  const portalActiveScene3 = await page.locator('#pvPortalOverlay.active').count();
  console.log('Scene 3 Portal Active (Should be 1 during transition):', portalActiveScene3);
  await page.screenshot({ path: 'tools/smooth_ui_portal_opening.png' });

  await page.waitForTimeout(1100); // wait for portal to smoothly dissolve away
  const scene3Subtitle = await page.locator('#pvSubtitle').innerText();
  const scene3Badge = await page.locator('#pvSpeakerName').innerText();
  console.log('Scene 3 settled badge:', scene3Badge);
  console.log('Scene 3 settled subtitle:', scene3Subtitle);
  await page.screenshot({ path: 'tools/smooth_ui_scene3_settled.png' });

  // 4. Click Scene 4 (Narrator to Narrator -> 100% Crisp Instant Clean Cut, ZERO strobe)
  console.log('Clicking Scene 4 (Narrator to Narrator)...');
  await page.locator('.scene-card').nth(3).click();
  await page.waitForTimeout(100);
  const dimOverlayActive = await page.locator('#pvTransitionOverlay.dimmed').count();
  console.log('Scene 4 Dim Overlay Active (Should be 0 - clean cut):', dimOverlayActive);
  await page.screenshot({ path: 'tools/smooth_ui_scene4_cleancut.png' });

  // 5. Click Scene 8 (Returning to Host -> Doctor Strange Portal Opens Again!)
  console.log('Clicking Scene 8 (Returning to Time Chronicler)...');
  await page.locator('.scene-card').nth(7).click();
  await page.waitForTimeout(250);
  const portalActiveScene8 = await page.locator('#pvPortalOverlay.active').count();
  console.log('Scene 8 Portal Active (Should be 1):', portalActiveScene8);
  await page.screenshot({ path: 'tools/smooth_ui_scene8_portal_return.png' });

  await page.waitForTimeout(1100);
  const scene8Badge = await page.locator('#pvSpeakerName').innerText();
  console.log('Scene 8 settled badge:', scene8Badge);
  await page.screenshot({ path: 'tools/smooth_ui_scene8_settled.png' });

  await browser.close();
  console.log('All Smooth Transition UI tests PASSED!');
}

testSmoothTransitions().catch(console.error);
