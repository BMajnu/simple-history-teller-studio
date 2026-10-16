const { chromium } = require('playwright-core');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  console.log('Navigating to http://localhost:4000...');
  await page.goto('http://localhost:4000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Switch to sample_first_king
  await page.selectOption('#projectSelect', 'sample_first_king');
  await page.waitForTimeout(2000);

  // Check scene 1 (Host: Somoyer Shakkhi)
  await page.click('.scene-card[data-i="0"]');
  await page.waitForTimeout(400);
  const badge1 = await page.$eval('#pvSpeakerBadge', el => ({
    text: el.innerText.trim(),
    classes: el.className,
    visible: !el.classList.contains('hidden')
  }));
  console.log('Scene 1 Badge:', badge1);
  await page.screenshot({ path: path.join(__dirname, 'clean_scene1_host.png') });

  // Click scene 2
  await page.click('.scene-card[data-i="1"]');
  await page.waitForTimeout(400);
  const badge2 = await page.$eval('#pvSpeakerBadge', el => ({
    text: el.innerText.trim(),
    classes: el.className,
    visible: !el.classList.contains('hidden')
  }));
  console.log('Scene 2 Badge:', badge2);
  await page.screenshot({ path: path.join(__dirname, 'clean_scene2_cut.png') });

  // Click scene 3 (Narrator)
  await page.click('.scene-card[data-i="2"]');
  await page.waitForTimeout(400);
  const badge3 = await page.$eval('#pvSpeakerBadge', el => ({
    text: el.innerText.trim(),
    classes: el.className,
    visible: !el.classList.contains('hidden')
  }));
  console.log('Scene 3 Badge:', badge3);
  await page.screenshot({ path: path.join(__dirname, 'clean_scene3_narrator.png') });

  // Check that portal overlay and transition overlay are NOT in DOM
  const hasPortalOverlay = await page.$('#pvPortalOverlay');
  const hasTransOverlay = await page.$('#pvTransitionOverlay');
  console.log('Portal overlay in DOM?', hasPortalOverlay !== null);
  console.log('Transition overlay in DOM?', hasTransOverlay !== null);

  console.log('Console/Page Errors:', errors);

  await browser.close();
})();
