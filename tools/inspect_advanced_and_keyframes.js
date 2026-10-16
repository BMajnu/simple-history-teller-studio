const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const p = b.contexts()[0].pages()[0];

  // Click advanced settings if present
  const advBtn = p.locator('button:has-text("expand_more"), [aria-label*="advanced"]').first();
  if (await advBtn.count() > 0) {
    await advBtn.click();
    await p.waitForTimeout(1000);
  }

  const settingsInfo = await p.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('mat-select, [role="combobox"]')).map(s => ({
      ariaLabel: s.getAttribute('aria-label'),
      text: s.innerText.trim()
    }));
    const toggles = Array.from(document.querySelectorAll('mat-slide-toggle, input[type="checkbox"]')).map(t => ({
      text: t.innerText.trim(),
      checked: t.getAttribute('aria-checked') || t.checked
    }));
    const sliders = Array.from(document.querySelectorAll('mat-slider, input[type="range"]')).map(s => ({
      ariaLabel: s.getAttribute('aria-label'),
      val: s.getAttribute('aria-valuenow') || s.value
    }));
    return { selects, toggles, sliders };
  });

  console.log('Settings Info:', JSON.stringify(settingsInfo, null, 2));

  // Now test attaching TWO images: start frame and end frame
  const sampleStart = path.join(__dirname, '..', 'projects', 'sample_first_king', 'visual_assets', 'scene_0001.jpg');
  const sampleHost = path.join(__dirname, '..', 'references', 'ref_host_sticky_meme.jpg');

  console.log('Testing uploading two images: start frame + reference/end frame...');
  const fileInput = p.locator('input[type="file"]').first();
  await fileInput.setInputFiles([sampleStart, sampleHost]);
  await p.waitForTimeout(3000);

  await p.screenshot({ path: 'tools/after_two_images_uploaded.png' });
  console.log('Saved tools/after_two_images_uploaded.png');

  // Check what is displayed in the input / message area
  const attachments = await p.evaluate(() => {
    const thumbs = Array.from(document.querySelectorAll('.file-thumbnail, .image-preview, img, .attachment-card, .file-chip, .pill')).map(el => ({
      tag: el.tagName,
      className: el.className,
      src: el.src || null,
      text: el.innerText ? el.innerText.trim() : null
    }));
    return thumbs;
  });
  console.log('Attachments displayed:', JSON.stringify(attachments.slice(0, 15), null, 2));
})();
