const http = require('http');
const fs = require('fs');
const path = require('path');

function sendScript(code, targetUrl) {
  return new Promise((resolve, reject) => {
    const body = targetUrl ? { code, targetUrl } : { code };
    const req = http.request('http://127.0.0.1:9333/run-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify({ code }));
    req.end();
  });
}

async function generateAIStudioImage(prompt, outFilePath, options = {}) {
  const arSetting = options.aspectRatio || '16:9';
  const resSetting = options.resolution || '2K';
  const resetChat = options.resetChat !== false;

  console.log(`[AI Studio] Starting generation for: ${path.basename(outFilePath)}`);
  console.log(`[AI Studio] Prompt: ${prompt.slice(0, 100)}...`);

  const code = `
    ${resetChat ? `
      await page.goto('https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-flash-image', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(3500);

      // Dismiss any popups
      const contBtn = page.locator('mat-dialog-container button:has-text("Continue"), .cdk-overlay-container button:has-text("Continue")');
      if (await contBtn.count() > 0) { await contBtn.first().click(); await page.waitForTimeout(1000); }

      // Set Aspect Ratio
      const ar = page.locator('[aria-label="Aspect ratio"], [aria-label*="Aspect"]');
      if (await ar.count() > 0) {
        await ar.first().click();
        await page.waitForTimeout(600);
        const opt = page.locator('[role="option"]:has-text("${arSetting}"), mat-option:has-text("${arSetting}")');
        if (await opt.count() > 0) await opt.first().click();
        await page.waitForTimeout(400);
      }

      // Set Resolution
      const res = page.locator('[aria-label="Resolution"]');
      if (await res.count() > 0) {
        await res.first().click();
        await page.waitForTimeout(600);
        const opt = page.locator('[role="option"]:has-text("${resSetting}"), mat-option:has-text("${resSetting}")');
        if (await opt.count() > 0) await opt.first().click();
        await page.waitForTimeout(400);
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    ` : ''}

    const prevSrcs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).filter(el => el.naturalWidth >= 400).map(el => el.src));

    const ta = page.locator('textarea, [contenteditable="true"]').first();
    await ta.click({ force: true });
    await ta.fill(${JSON.stringify(prompt)});
    await page.waitForTimeout(800);

    const runBtn = page.locator('button[aria-label*="Run"], button:has-text("Run")').last();
    await runBtn.click({ force: true });

    let elapsed = 0;
    let found = false;
    let failReason = null;
    while (elapsed < 90000) {
      await page.waitForTimeout(3000);
      elapsed += 3000;
      const isGenerating = await page.locator('button:has-text("Stop"), [aria-label*="Stop"]').count() > 0;
      const curSrcs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).filter(el => el.naturalWidth >= 400).map(el => el.src));
      const newOnes = curSrcs.filter(s => !prevSrcs.includes(s));
      if (newOnes.length > 0 && !isGenerating) {
        found = true;
        break;
      }
      if (!isGenerating) {
        const bt = await page.evaluate(() => document.body.innerText.slice(0, 3000)).catch(() => '');
        const m = bt.match(/Failed to generate[^.]*\.|permission denied[^.]{0,80}|paid API key[^.]{0,80}|select an API key[^.]{0,80}|quota[^.]{0,60}|rate limit[^.]{0,60}/i);
        if (m) { failReason = m[0].slice(0, 120); break; }
      }
    }

    await page.waitForTimeout(1500);

    const b64 = await page.evaluate(async (prevList) => {
      const imgs = Array.from(document.querySelectorAll('img')).filter(el => el.naturalWidth >= 400 && !prevList.includes(el.src));
      if (imgs.length === 0) {
        // Fallback to the latest large image
        const allLarge = Array.from(document.querySelectorAll('img')).filter(el => el.naturalWidth >= 400);
        if (allLarge.length === 0) return null;
        const el = allLarge[allLarge.length - 1];
        const res = await fetch(el.src);
        const blob = await res.blob();
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve({ data: reader.result.split(',')[1], w: el.naturalWidth, h: el.naturalHeight });
          reader.readAsDataURL(blob);
        });
      }
      const el = imgs[imgs.length - 1];
      const res = await fetch(el.src);
      const blob = await res.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({ data: reader.result.split(',')[1], w: el.naturalWidth, h: el.naturalHeight });
        reader.readAsDataURL(blob);
      });
    }, prevSrcs);

    return { found, elapsed, b64, failReason };
  `;

  const res = await sendScript(code, options.targetUrl);
  if (res.ok && res.result && res.result.b64 && res.result.b64.data) {
    const bytes = Buffer.from(res.result.b64.data, 'base64');
    fs.mkdirSync(path.dirname(outFilePath), { recursive: true });
    fs.writeFileSync(outFilePath, bytes);
    console.log(`[AI Studio] SUCCESS: Saved ${outFilePath} (${res.result.b64.w}x${res.result.b64.h}, ${bytes.length} bytes) in ${res.result.elapsed / 1000}s`);
    return { success: true, width: res.result.b64.w, height: res.result.b64.h, bytes: bytes.length };
  } else {
    console.error(`[AI Studio] ERROR: Failed to get image for ${outFilePath}`, (res.result && res.result.failReason) || '');
    throw new Error('Image generation failed: ' + ((res.result && res.result.failReason) || 'timed out') + ' ' + JSON.stringify(res).slice(0, 200));
  }
}

module.exports = { generateAIStudioImage };
