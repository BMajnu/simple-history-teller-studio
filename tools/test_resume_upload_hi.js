const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const PROFILE_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\scratch\\chrome_aistudio_profile_3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = path.join(__dirname, '..');
const VIDEO_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'renders', 'video_hi.mp4');

(async () => {
  console.log('=== RESUMING HINDI MASTER VIDEO UPLOAD ===');
  console.log('Video path:', VIDEO_PATH);

  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
    viewport: null
  });

  const page = ctx.pages()[0] || await ctx.newPage();
  await page.bringToFront();

  // Navigate to Hindi channel content page
  await page.goto('https://studio.youtube.com/channel/UCkG4y9NJQ5yCys3jxFDUOcg/videos/upload', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Look for "Resume upload" button
  console.log('Looking for Resume upload button...');
  const resumeBtn = page.locator('button:has-text("Resume upload"), ytcp-button:has-text("Resume upload"), [aria-label*="Resume upload"]').first();
  const isResumeVisible = await resumeBtn.isVisible({ timeout: 5000 }).catch(() => false);
  console.log('Resume upload button visible:', isResumeVisible);

  if (isResumeVisible) {
    console.log('Setting up file chooser or input listener...');
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 10000 }).catch(() => null),
      resumeBtn.click()
    ]);

    if (fileChooser) {
      console.log('File chooser intercepted! Setting file:', VIDEO_PATH);
      await fileChooser.setFiles(VIDEO_PATH);
    } else {
      console.log('No file chooser event. Trying CDP fallback on file input...');
      const session = await page.context().newCDPSession(page);
      const doc = await session.send('DOM.getDocument', { depth: 0 });
      const { nodeIds } = await session.send('DOM.querySelectorAll', {
        nodeId: doc.root.nodeId,
        selector: 'input[type="file"]'
      });
      if (nodeIds && nodeIds.length > 0) {
        await session.send('DOM.setFileInputFiles', {
          files: [VIDEO_PATH],
          nodeId: nodeIds[0]
        });
        console.log('File attached via CDP!');
      }
    }

    console.log('Waiting 10s after selecting file...');
    await page.waitForTimeout(10000);
    await page.screenshot({ path: 'tools/yt_hi_after_resume_click.png' });

    // Monitor upload progress
    console.log('Monitoring upload progress...');
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(5000);
      const statusText = await page.evaluate(() => {
        const dialog = document.querySelector('ytcp-uploads-dialog, ytcp-video-upload-progress, ytcp-progress-label');
        if (dialog) return dialog.innerText.replace(/\n+/g, ' ');
        const progress = document.querySelector('[class*="progress"], [class*="status"]');
        return progress ? progress.innerText.replace(/\n+/g, ' ') : '';
      });
      console.log(`[${i+1}/60] Upload status: ${statusText}`);

      const pageText = await page.evaluate(() => document.body.innerText);
      if (pageText.includes('Upload complete') || pageText.includes('Processing') || pageText.includes('Checks complete')) {
        console.log('Upload reached completion / processing state!');
        break;
      }
    }
  } else {
    console.log('Resume button not found. Taking screenshot...');
    await page.screenshot({ path: 'tools/yt_hi_no_resume_btn.png' });
  }

  await page.screenshot({ path: 'tools/yt_hi_resume_final.png' });
  await ctx.close();
  process.exit(0);
})().catch(err => {
  console.error('Fatal error in resume script:', err);
  process.exit(1);
});
