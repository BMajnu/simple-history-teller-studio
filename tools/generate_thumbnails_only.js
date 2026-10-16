const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const METADATA_DIR = path.join(__dirname, '..', 'projects', 'simple_itihash_002_first_language', 'metadata');
fs.mkdirSync(METADATA_DIR, { recursive: true });

const thumbnails = [
  {
    name: 'bn_thumbnail.jpg',
    outFile: path.join(METADATA_DIR, 'bn_thumbnail.jpg'),
    prompt: 'YouTube Thumbnail 16:9: Large bold dramatic text "প্রথম ভাষা!" with stickman caveman shouting with funny charade hand gestures vs ancient Pharaoh on throne with golden cobra crown, high contrast, vibrant saturated yellow and red rim lighting, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, eye-catching 4k composition.'
  },
  {
    name: 'en_thumbnail.jpg',
    outFile: path.join(METADATA_DIR, 'en_thumbnail.jpg'),
    prompt: 'YouTube Thumbnail 16:9: Large bold dramatic text "THE FIRST LANGUAGE!" with stickman caveman shouting with funny charade hand gestures vs ancient Pharaoh on throne with golden cobra crown, high contrast, vibrant saturated yellow and red rim lighting, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, eye-catching 4k composition.'
  },
  {
    name: 'hi_thumbnail.jpg',
    outFile: path.join(METADATA_DIR, 'hi_thumbnail.jpg'),
    prompt: 'YouTube Thumbnail 16:9: Large bold dramatic text "इंसानों की पहली भाषा!" with stickman caveman shouting with funny charade hand gestures vs ancient Pharaoh on throne with golden cobra crown, high contrast, vibrant saturated yellow and red rim lighting, OverSimplified cartoon sticky meme style, clean flat 2D vector, bold solid outlines, eye-catching 4k composition.'
  }
];

async function run() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages().find(p => p.url().includes('aistudio.google.com/prompts'));
  if (!page) {
    console.error('No prompt tab found');
    process.exit(1);
  }

  for (let i = 0; i < thumbnails.length; i++) {
    const thumb = thumbnails[i];
    if (fs.existsSync(thumb.outFile) && fs.statSync(thumb.outFile).size > 50000) {
      console.log(`SKIP: ${thumb.name} already exists`);
      continue;
    }

    console.log(`Generating thumbnail [${i + 1}/${thumbnails.length}]: ${thumb.name}...`);
    try {
      const initialImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).filter(el => el.naturalWidth >= 200).map(el => el.src)).catch(() => []);

      const ta = page.locator('textarea[aria-label="Enter a prompt"], textarea').first();
      await ta.click({ force: true });
      await ta.fill(thumb.prompt);
      await page.waitForTimeout(300);

      const runBtn = page.locator('button:has-text("Run")').last();
      await runBtn.click({ force: true });

      let elapsed = 0;
      while (elapsed < 60000) {
        await page.waitForTimeout(2500);
        elapsed += 2500;
        const isGenerating = await page.locator('button:has-text("Stop"), [aria-label*="Stop"]').count() > 0;
        const curImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).filter(el => el.naturalWidth >= 200).map(el => el.src)).catch(() => []);
        const diff = curImgs.filter(s => !initialImgs.includes(s));
        if (diff.length > 0 && !isGenerating) break;
      }

      await page.waitForTimeout(1000);

      const b64Data = await page.evaluate(async (oldList) => {
        const allLarge = Array.from(document.querySelectorAll('img')).filter(el => el.naturalWidth >= 200);
        const newOnly = allLarge.filter(el => !oldList.includes(el.src));
        const target = newOnly.length > 0 ? newOnly[newOnly.length - 1] : allLarge[allLarge.length - 1];
        if (!target) return null;
        const res = await fetch(target.src);
        const blob = await res.blob();
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve({
            data: reader.result.split(',')[1],
            w: target.naturalWidth,
            h: target.naturalHeight
          });
          reader.readAsDataURL(blob);
        });
      }, initialImgs);

      if (b64Data && b64Data.data) {
        const buf = Buffer.from(b64Data.data, 'base64');
        fs.writeFileSync(thumb.outFile, buf);
        console.log(`SUCCESS: Saved ${thumb.name} (${b64Data.w}x${b64Data.h}, ${(buf.length / 1024).toFixed(1)} KB)`);
      }
    } catch (e) {
      console.error(`Error on ${thumb.name}:`, e.message);
    }
  }

  console.log('Thumbnails generation process finished.');
  process.exit(0);
}

run().catch(console.error);
