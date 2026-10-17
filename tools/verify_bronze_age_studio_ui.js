const { chromium } = require('playwright-core');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('Testing Studio UI with Bronze Age Collapse project...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 960 } });

  await page.goto('http://localhost:4000/?project=simple_itihash_004_bronze_age_collapse', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Switch project dropdown if needed
  try {
    const sel = page.locator('#projectSelect');
    if (await sel.count() > 0) {
      await sel.selectOption('simple_itihash_004_bronze_age_collapse');
      await page.waitForTimeout(3000);
    }
  } catch(e) {}

  await page.screenshot({ path: path.join(__dirname, 'bronze_age_studio_overview.png') });
  console.log('Saved bronze_age_studio_overview.png');

  // Check UI badges and scene count
  const sceneCount = await page.locator('.scene-card, .timeline-scene-block, [data-scene-id]').count();
  console.log('Timeline visual scene blocks rendered:', sceneCount);

  const titleText = await page.locator('#projectTitle, .project-title, h1').first().innerText().catch(() => 'unknown');
  console.log('Studio Project Title:', titleText);

  // Switch to English language
  try {
    const enTab = page.locator('button:has-text("English"), [data-lang="en"]').first();
    if (await enTab.count() > 0) {
      await enTab.click();
      await page.waitForTimeout(1500);
      console.log('Switched to English track in studio');
      await page.screenshot({ path: path.join(__dirname, 'bronze_age_studio_en.png') });
      console.log('Saved bronze_age_studio_en.png');
    }
  } catch(e) {}

  // Switch to Hindi language
  try {
    const hiTab = page.locator('button:has-text("Hindi"), [data-lang="hi"]').first();
    if (await hiTab.count() > 0) {
      await hiTab.click();
      await page.waitForTimeout(1500);
      console.log('Switched to Hindi track in studio');
      await page.screenshot({ path: path.join(__dirname, 'bronze_age_studio_hi.png') });
      console.log('Saved bronze_age_studio_hi.png');
    }
  } catch(e) {}

  await browser.close();
  console.log('Studio UI verification completed!');
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
