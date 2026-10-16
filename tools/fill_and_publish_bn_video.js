const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const THUMB_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'bn_thumbnail.jpg');
const SEO_PATH = path.resolve(ROOT, 'projects', 'sample_first_king', 'metadata', 'youtube_seo.json');

const seoData = JSON.parse(fs.readFileSync(SEO_PATH, 'utf8'));
const bnSeo = seoData.channels.bn;

const TITLE = bnSeo.title.substring(0, 100);
const DESCRIPTION = bnSeo.description;
const TAGS = bnSeo.tags.join(', ');

(async () => {
  console.log('Connecting to existing browser session on port 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const pages = ctx.pages();
  console.log(`Found ${pages.length} open pages.`);

  // Find the page with the YouTube Studio upload modal
  let uploadPage = pages.find(p => p.url().includes('studio.youtube.com'));
  if (!uploadPage) {
    console.error('No YouTube Studio page found!');
    process.exit(1);
  }

  console.log('Target page URL:', uploadPage.url());

  // 1. Fill Title
  console.log('Setting Title:', TITLE);
  const titleBox = uploadPage.locator('#title-textarea #textbox, [aria-label*="Title"], [aria-label*="শিরোনাম"]').first();
  await titleBox.waitFor({ state: 'visible', timeout: 15000 });
  await titleBox.click();
  await uploadPage.keyboard.press('Control+A');
  await uploadPage.keyboard.press('Backspace');
  await uploadPage.waitForTimeout(300);
  await uploadPage.evaluate((text) => {
    const el = document.querySelector('#title-textarea #textbox');
    if (el) {
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, TITLE);
  console.log('Title set!');
  await uploadPage.waitForTimeout(1000);

  // 2. Fill Description
  console.log('Setting Description...');
  const descBox = uploadPage.locator('#description-textarea #textbox, [aria-label*="Description"], [aria-label*="বিবরণ"]').first();
  await descBox.click();
  await uploadPage.keyboard.press('Control+A');
  await uploadPage.keyboard.press('Backspace');
  await uploadPage.waitForTimeout(300);
  await uploadPage.evaluate((text) => {
    const el = document.querySelector('#description-textarea #textbox');
    if (el) {
      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, DESCRIPTION);
  console.log('Description set!');
  await uploadPage.waitForTimeout(1000);

  // 3. Set Thumbnail via CDP DOM.setFileInputFiles
  console.log('Attaching Custom Thumbnail:', THUMB_PATH);
  try {
    const cdp = await ctx.newCDPSession(uploadPage);
    const { root } = await cdp.send('DOM.getDocument');
    // Find thumbnail input (inside ytcp-thumbnails-compact)
    const { nodeId } = await cdp.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: 'input#file-loader, ytcp-thumbnails-compact input[type="file"], [aria-label*="Upload thumbnail"] input[type="file"]'
    }).catch(() => ({ nodeId: 0 }));

    if (nodeId) {
      console.log('Found thumbnail input nodeId:', nodeId);
      await cdp.send('DOM.setFileInputFiles', {
        files: [THUMB_PATH],
        nodeId: nodeId
      });
      console.log('Thumbnail attached via CDP!');
      await uploadPage.waitForTimeout(3000);
    } else {
      console.log('Thumbnail input selector not found directly, looking for thumbnail button...');
      const thumbBtn = uploadPage.locator('#select-button, ytcp-thumbnail-button, [aria-label*="Upload thumbnail"], [aria-label*="থাম্বনেল"]').first();
      if (await thumbBtn.isVisible().catch(() => false)) {
        await thumbBtn.click().catch(() => {});
        await uploadPage.waitForTimeout(1000);
      }
    }
  } catch (e) {
    console.warn('Thumbnail attachment notice:', e.message);
  }

  // 4. Set Made for Kids: No
  console.log('Setting Not Made For Kids...');
  const notForKids = uploadPage.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"], [name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
  if (await notForKids.isVisible({ timeout: 5000 }).catch(() => false)) {
    await notForKids.click({ force: true });
    console.log('Audience set: Not made for kids.');
    await uploadPage.waitForTimeout(500);
  }

  // 5. Expand Show More & set Tags
  console.log('Expanding Show More for tags...');
  const showMore = uploadPage.locator('button:has-text("SHOW MORE"), button:has-text("Show more"), button:has-text("আরও দেখান"), ytcp-button#toggle-button').first();
  if (await showMore.isVisible({ timeout: 3000 }).catch(() => false)) {
    await showMore.scrollIntoViewIfNeeded();
    await showMore.click({ force: true });
    await uploadPage.waitForTimeout(1500);
  }

  console.log('Setting tags...');
  try {
    const tagsInput = uploadPage.locator('input[aria-label="Tags"], input[placeholder*="Add tag"], input[placeholder*="ট্যাগ যোগ করুন"]').first();
    if (await tagsInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tagsInput.scrollIntoViewIfNeeded();
      await tagsInput.click();
      await tagsInput.fill(TAGS);
      await uploadPage.keyboard.press('Enter');
      console.log('Tags added:', TAGS);
      await uploadPage.waitForTimeout(1000);
    }
  } catch (e) {
    console.warn('Tags notice:', e.message);
  }

  await uploadPage.screenshot({ path: 'tools/bn_upload_step1_filled.png' });
  console.log('Details step screenshot saved!');

  // 6. Navigate through Steps (Next -> Next -> Next)
  const nextBtn = uploadPage.locator('#next-button').first();

  console.log('Clicking Next to Step 2 (Video Elements)...');
  await nextBtn.click();
  await uploadPage.waitForTimeout(3000);
  await uploadPage.screenshot({ path: 'tools/bn_upload_step2_elements.png' });

  console.log('Clicking Next to Step 3 (Checks)...');
  await nextBtn.click();
  await uploadPage.waitForTimeout(3000);
  await uploadPage.screenshot({ path: 'tools/bn_upload_step3_checks.png' });

  console.log('Clicking Next to Step 4 (Visibility)...');
  await nextBtn.click();
  await uploadPage.waitForTimeout(3000);
  await uploadPage.screenshot({ path: 'tools/bn_upload_step4_visibility.png' });

  // 7. Select Public visibility
  console.log('Selecting Public visibility...');
  const publicRadio = uploadPage.locator('tp-yt-paper-radio-button[name="PUBLIC"], [name="PUBLIC"]').first();
  if (await publicRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
    await publicRadio.click({ force: true });
    console.log('Selected PUBLIC!');
    await uploadPage.waitForTimeout(1000);
  }

  // Grab the video URL from modal
  const videoLink = await uploadPage.locator('a.ytcp-video-info, a[href*="youtu.be"]').first().getAttribute('href').catch(() => null);
  console.log('>>> YOUTUBE VIDEO URL:', videoLink);

  // 8. Wait for upload to reach 100% or completion before clicking Done
  console.log('Monitoring upload status before final publish...');
  for (let poll = 0; poll < 120; poll++) {
    const statusText = await uploadPage.locator('span.progress-label, .ytcp-video-upload-progress, span:has-text("Uploading"), span:has-text("আপলোড হচ্ছে"), span:has-text("Checks complete"), span:has-text("Processing")').first().innerText().catch(() => '');
    console.log(`[Upload Poll ${poll+1}/120] Status: ${statusText || 'In progress...'}`);

    // If uploading is finished or checking/processing
    if (statusText.includes('Checks') || statusText.includes('Processing') || statusText.includes('সম্পূর্ণ') || statusText.includes('Saved as draft')) {
      console.log('Upload uploaded and entered processing phase!');
      break;
    }
    await uploadPage.waitForTimeout(5000);
  }

  // 9. Click Publish / Done
  console.log('Clicking Publish / Done button...');
  const doneBtn = uploadPage.locator('#done-button').first();
  await doneBtn.waitFor({ state: 'visible', timeout: 10000 });
  await doneBtn.click({ force: true });
  console.log('Publish button clicked!');
  await uploadPage.waitForTimeout(8000);

  await uploadPage.screenshot({ path: 'tools/bn_upload_published_final.png' });
  console.log('Final publish screenshot saved to tools/bn_upload_published_final.png');

  console.log('=== MASTER BANGLA VIDEO PUBLISHED TO SIMPLE HISTORY TELLER BANGLA! ===');
  process.exit(0);
})().catch(err => {
  console.error('Error during fill and publish:', err);
  process.exit(1);
});
