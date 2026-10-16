const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REF_IMAGE = path.join(ROOT, 'projects', 'simple_itihash_002_first_language', 'visual_assets', 'shot_0005.jpg');

async function main() {
  console.log('--- TEST GENERATING SAMPLE VIDEO WITH GEMINI OMNI 1.1 FLASH ---');
  console.log('Reference image:', REF_IMAGE);

  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();

  console.log('Navigating to Omni 1.1 Flash...');
  await page.goto('https://aistudio.google.com/app/prompts/new_chat?model=gemini-omni-1.1-flash', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Configure Right Drawer: Aspect ratio to 16:9
  console.log('Configuring Aspect Ratio...');
  const aspectSelect = page.locator('mat-select, [role="combobox"]').filter({ hasText: 'Auto' }).first();
  if (await aspectSelect.count() > 0) {
    await aspectSelect.click();
    await page.waitForTimeout(500);
    const option169 = page.locator('mat-option:has-text("16:9"), [role="option"]:has-text("16:9")').first();
    if (await option169.count() > 0) {
      await option169.click();
      await page.waitForTimeout(500);
      console.log('Set Aspect ratio to 16:9!');
    }
  }

  // Upload reference image
  console.log('Clicking Insert button...');
  const addBtn = page.locator('button[aria-label*="Insert images"], button:has-text("add_circle")').first();
  
  // Check if filechooser is triggered directly or via a menu
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null),
    addBtn.click()
  ]);

  if (fileChooser) {
    console.log('FileChooser triggered directly! Uploading shot_0005.jpg...');
    await fileChooser.setFiles(REF_IMAGE);
    await page.waitForTimeout(3000);
  } else {
    console.log('Checking menu after addBtn click...');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tools/after_add_btn_menu.png' });
    const uploadItem = page.locator('button:has-text("Upload"), [role="menuitem"]:has-text("Upload"), span:has-text("Upload")').first();
    if (await uploadItem.count() > 0) {
      const [fc] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 8000 }),
        uploadItem.click()
      ]);
      await fc.setFiles(REF_IMAGE);
      console.log('Uploaded image via menu!');
      await page.waitForTimeout(3000);
    }
  }

  await page.screenshot({ path: 'tools/after_image_attached.png' });
  console.log('Saved tools/after_image_attached.png');

  // Fill Prompt
  const promptText = 'Animate this 2D cartoon scene into a dynamic 24fps action clip: Two Stone Age hunters crouching low in dense foliage, stalking a massive woolly mammoth across the tundra, cold wind swaying the tall grass, 2D cartoon animation, 24fps, 16:9 widescreen.';
  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.click();
  await textarea.fill(promptText);
  await page.waitForTimeout(500);

  // Click Run
  console.log('Triggering generation...');
  const runBtn = page.locator('button:has-text("Run"), button.ctrl-enter-submits').first();
  await runBtn.click();
  console.log('Clicked Run, monitoring generation response...');

  // Monitor generation
  let elapsed = 0;
  while (elapsed < 60000) {
    await page.waitForTimeout(3000);
    elapsed += 3000;

    const status = await page.evaluate(() => {
      const vids = Array.from(document.querySelectorAll('video')).map(v => ({ src: v.src, duration: v.duration }));
      const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
      const text = document.body.innerText.slice(0, 400).replace(/\n/g, ' ');
      return { vids, hasStop: stop, textPreview: text };
    });

    console.log(`[${elapsed / 1000}s] Has stop: ${status.hasStop} | Videos: ${status.vids.length}`);
    if (status.vids.length > 0 && status.vids[0].src && !status.hasStop) {
      console.log('🎉 VIDEO GENERATED SUCCESSFULLY!');
      console.log('Video src:', status.vids[0].src);
      break;
    }
  }

  await page.screenshot({ path: 'tools/omni_video_result.png' });
  console.log('Saved tools/omni_video_result.png');
  await page.close();
}

main().catch(console.error);
