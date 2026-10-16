const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = path.join(__dirname, '..');
const VIDEO_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'video_en.mp4');

(async () => {
  console.log('=== RESUMING ENGLISH MASTER VIDEO UPLOAD ===');
  console.log('Video:', VIDEO_PATH, `(${Math.round(fs.statSync(VIDEO_PATH).size / (1024*1024))} MB)`);

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // Already on English channel Studio
  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  // Click Content tab
  console.log('Navigating to Content...');
  const contentTab = page.locator('tp-yt-paper-item:has-text("Content"), a#destination-content, ytcp-navigation-drawer a[href*="videos"]').first();
  await contentTab.click();
  await page.waitForTimeout(5000);

  // Find Resume upload button
  console.log('Finding Resume upload button...');
  const resumeBtn = page.locator('ytcp-button:has-text("Resume upload"), button:has-text("Resume upload")').first();
  await resumeBtn.waitFor({ state: 'visible', timeout: 10000 });

  console.log('Clicking Resume upload and setting file...');
  // Check if it opens file chooser or input
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null),
    resumeBtn.click()
  ]);

  if (fileChooser) {
    console.log('File chooser triggered! Setting files...');
    await fileChooser.setFiles(VIDEO_PATH);
  } else {
    console.log('No direct file chooser. Checking file inputs via CDP...');
    const session = await page.context().newCDPSession(page);
    const doc = await session.send('DOM.getDocument', { depth: 0 });
    const { nodeIds } = await session.send('DOM.querySelectorAll', {
      nodeId: doc.root.nodeId,
      selector: 'input[type="file"]'
    });
    console.log('Found file inputs:', nodeIds?.length);
    if (nodeIds && nodeIds.length > 0) {
      await session.send('DOM.setFileInputFiles', {
        files: [VIDEO_PATH],
        nodeId: nodeIds[nodeIds.length - 1]
      });
      console.log('File set via CDP!');
    }
  }

  console.log('Waiting 8s to check upload status...');
  await page.waitForTimeout(8000);
  await page.screenshot({ path: 'tools/en_resume_started.png' });

  // Loop and monitor upload progress
  console.log('=== MONITORING UPLOAD PROGRESS (WILL WAIT UNTIL 100% COMPLETE) ===');
  let lastProgress = '';
  let complete = false;

  for (let minute = 0; minute < 30; minute++) { // up to 30 minutes
    for (let sec = 0; sec < 12; sec++) { // check every 5 seconds
      await page.waitForTimeout(5000);

      const status = await page.evaluate(() => {
        // Look for progress bar or upload percentage
        const progressEl = document.querySelector('ytcp-video-upload-progress, [class*="progress-label"], ytcp-progress-label');
        const text = progressEl ? progressEl.innerText.replace(/\n+/g, ' ') : '';
        const dialog = document.querySelector('ytcp-uploads-dialog');
        const dialogText = dialog ? dialog.innerText.replace(/\n+/g, ' ') : '';
        return { text, dialogText: dialogText.substring(0, 300) };
      });

      const currentStatus = status.text || status.dialogText;
      if (currentStatus && currentStatus !== lastProgress) {
        lastProgress = currentStatus;
        console.log(`[Time: ${minute}m ${sec*5}s] Status: ${lastProgress}`);
      }

      // Check if finished
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.includes('Upload complete') || bodyText.includes('Processing') || bodyText.includes('Checks complete') || bodyText.includes('Finished processing')) {
        console.log('\n>>> UPLOAD FINISHED SUCCESSFULLY! <<<');
        complete = true;
        break;
      }
    }
    if (complete) break;
    await page.screenshot({ path: `tools/en_upload_progress_${minute}m.png` });
  }

  await page.waitForTimeout(10000);
  await page.screenshot({ path: 'tools/en_upload_final_result.png' });
  console.log('English upload finished. Browser closing.');
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
