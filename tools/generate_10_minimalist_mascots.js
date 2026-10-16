const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const CONCEPTS = [
  {
    name: 'mascot_01_modern_chronicler_sht',
    title: 'Concept 1: Modern Chronicler with Glasses & Feather Quill (SHT Monogram)',
    prompt: 'Minimalist modern vector mascot logo of a single character cartoon history chronicler. Sleek minimalist art style: a friendly young scholar mascot head with round spectacles and a cheerful smile, holding a golden feather quill. Integrated bold modern typography with the initials "SHT" at the bottom. Clean vector graphics, sharp solid outlines, flat navy blue, gold, and cream colors, centered in a circular crest badge, professional brand logo --no photographic realism, 3d, clutter, background scene'
  },
  {
    name: 'mascot_02_wise_owl_history_teller',
    title: 'Concept 2: Wise Owl Scholar with Spectacles (SIMPLE HISTORY TELLER)',
    prompt: 'Minimalist modern vector mascot logo of a single character: a cute wise cartoon owl history scholar wearing round vintage spectacles and holding an antique pocket watch. Clean bold lines, modern esports/tech mascot style, flat colors with royal navy blue, golden yellow, and white. Arc banner typography below reading "SIMPLE HISTORY TELLER". Centered badge icon, 1:1 square --no photographic realism, 3d, realistic textures'
  },
  {
    name: 'mascot_03_time_traveler_goggles_sht',
    title: 'Concept 3: Time-Traveler Boy with Vintage Brass Goggles (SHT Badge)',
    prompt: 'Modern minimalist vector mascot logo of a single character: a charismatic cartoon boy time-traveler wearing vintage aviator explorer goggles pushed up on his forehead, giving a confident wink and thumbs up. Bold minimalist vector shapes, thick clean outlines, vibrant colors. Integrated bold letters "SHT" in a modern geometric shield emblem below the character, professional YouTube channel icon, 1:1 --no photographic realism, 3d, clutter'
  },
  {
    name: 'mascot_04_wise_elder_chronicler_sht',
    title: 'Concept 4: Wise Elder Time Chronicler (SHT Crest)',
    prompt: 'Minimalist 2D vector mascot logo of a single character: the iconic wise cartoon Time Chronicler (elderly scholar with bald top, white beard, and round glasses) smiling gently, holding a glowing golden history scroll. OverSimplified cartoon character turned into a modern clean mascot logo badge, bold clean lines, royal blue and gold circular ring with the monogram "SHT" boldly anchored at the base, 1:1 --no 3d, photorealism, complexity'
  },
  {
    name: 'mascot_05_studio_narrator_history',
    title: 'Concept 5: Modern Storyteller with Studio Headphones (SIMPLE HISTORY TELLER)',
    prompt: 'Modern professional mascot logo of a single character history storyteller: a sleek minimalist cartoon narrator wearing studio over-ear headphones, smiling warmly, holding an ancient rolled parchment scroll. Bold modern vector art, clean sharp lines, circular navy and warm gold emblem with clean modern typography "SIMPLE HISTORY TELLER" in an elegant arc, 1:1 --no 3d, photographic textures'
  },
  {
    name: 'mascot_06_hourglass_guardian_sht',
    title: 'Concept 6: Hourglass Guardian Mascot (SHT Monogram)',
    prompt: 'Extremely creative minimalist modern mascot logo of a single character: a stylized cartoon Time Guardian character whose head and body creatively integrate the shape of a golden hourglass with smiling cartoon eyes and a sleek hooded scholar cloak. Modern esports / tech mascot logo style, sharp geometric curves, bold lettering "SHT" integrated into the pedestal, dark blue and electric gold palette, 1:1 --no photorealism, 3d'
  },
  {
    name: 'mascot_07_cool_pharaoh_history_teller',
    title: 'Concept 7: Cool Ancient Pharaoh Mascot (SIMPLE HISTORY TELLER)',
    prompt: 'Minimalist modern cartoon mascot logo of a single character: a friendly stylized cartoon ancient Egyptian pharaoh wearing a golden nemes headdress and modern trendy round glasses, smiling cheerfully. Clean flat vector illustration, bold outlines, warm gold and lapis lazuli blue colors, circular badge with clean modern text "SIMPLE HISTORY TELLER", 1:1 square --no 3d, photographic textures'
  },
  {
    name: 'mascot_08_monogram_scholar_fusion',
    title: 'Concept 8: Monogram "H" & Scholar Character Fusion',
    prompt: 'Highly creative minimalist vector mascot logo: the capital letter "H" creatively transformed into the silhouette and face of a smiling cartoon history scholar with glasses, holding an illuminated quill that dots the letter. Modern minimalist branding, bold geometric typography with "SHT" underneath, royal blue and metallic gold, clean vector mascot icon, 1:1 --no photorealism, 3d'
  },
  {
    name: 'mascot_09_archaeologist_explorer_sht',
    title: 'Concept 9: Cartoon Archaeologist with Torch of History (SHT)',
    prompt: 'Modern minimalist vector mascot logo of a single character: an adventurous cartoon archaeologist explorer wearing a vintage fedora hat, smiling as he holds a glowing torch illuminating the mysteries of history. Clean bold vector lineart, flat color blocks, set inside a modern diamond shield badge with the bold initials "SHT" at the base, warm ochre and navy blue, 1:1 --no 3d, photorealism'
  },
  {
    name: 'mascot_10_cosmic_portal_chronicler',
    title: 'Concept 10: Cosmic Portal Chronicler (SIMPLE HISTORY TELLER)',
    prompt: 'Minimalist 2D cartoon mascot logo badge of a single character: a cute cartoon history storyteller peeking out from a circular golden time portal ring, waving cheerfully with one hand and holding a pocket watch with the other. Clean minimalist vector mascot design, circular dark navy ring with clean bold circular typography "SIMPLE HISTORY TELLER", 1:1 square --no photorealism, 3d, clutter'
  }
];

async function generateAll() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('aistudio')) || await ctx.newPage();

  console.log(`Starting generation of ${CONCEPTS.length} minimalist mascot logos...`);

  for (let i = 0; i < CONCEPTS.length; i++) {
    const item = CONCEPTS[i];
    const outPath = path.join(ARTIFACTS_DIR, `${item.name}.jpg`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
      console.log(`[${i + 1}/${CONCEPTS.length}] Already exists: ${item.name}`);
      continue;
    }

    console.log(`\n========================================`);
    console.log(`[${i + 1}/${CONCEPTS.length}] Generating: ${item.title}`);
    console.log(`Prompt: ${item.prompt.slice(0, 100)}...`);

    try {
      // Ensure we are on the image generation page
      if (!page.url().includes('gemini-3.1-flash-image')) {
        await page.goto('https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-flash-image', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);

      // Verify Aspect ratio 1:1
      const arSelect = page.locator('mat-select[aria-label="Aspect ratio"]').first();
      if (await arSelect.count() > 0) {
        const currentAr = await arSelect.innerText();
        if (!currentAr.includes('1:1')) {
          await arSelect.click();
          await page.waitForTimeout(500);
          const opt11 = page.locator('mat-option:has-text("1:1")').first();
          if (await opt11.count() > 0) await opt11.click();
          await page.waitForTimeout(300);
        }
      }

      const prevImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).map(img => img.src));

      const textarea = page.locator('textarea').first();
      await textarea.fill(item.prompt);
      await page.waitForTimeout(400);

      const runBtn = page.locator('button:has-text("Run")').last();
      await runBtn.click();

      let elapsed = 0;
      let newImgSrc = null;
      while (elapsed < 60000) {
        await page.waitForTimeout(2000);
        elapsed += 2000;
        process.stdout.write(`.${elapsed / 1000}s `);

        const isGenerating = await page.locator('button:has-text("Stop"), [aria-label*="Stop"]').count() > 0;
        const currentImgs = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('img'))
            .filter(img => img.naturalWidth >= 200)
            .map(img => img.src);
        });
        const diff = currentImgs.filter(src => !prevImgs.includes(src));
        if (diff.length > 0 && !isGenerating) {
          newImgSrc = diff[diff.length - 1];
          console.log('\nFound image!');
          break;
        }
      }

      if (newImgSrc) {
        const base64Data = await page.evaluate(async (src) => {
          const img = document.querySelector(`img[src="${src}"]`) || document.querySelector('img[src*="blob:"], img[src*="googleusercontent"]');
          if (!img) return null;
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          return {
            data: canvas.toDataURL('image/jpeg', 0.95).replace(/^data:image\/jpeg;base64,/, ''),
            w: img.naturalWidth,
            h: img.naturalHeight
          };
        }, newImgSrc);

        if (base64Data && base64Data.data) {
          const buf = Buffer.from(base64Data.data, 'base64');
          fs.writeFileSync(outPath, buf);
          console.log(`Saved: ${outPath} (${base64Data.w}x${base64Data.h}, ${buf.length} bytes)`);
        }
      } else {
        console.log(`Failed to generate ${item.name}, refreshing page...`);
        await page.goto('https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-flash-image', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);
      }

      // Small cooldown between generations
      await page.waitForTimeout(2000);
    } catch (err) {
      console.error(`Error generating ${item.name}:`, err.message);
      await page.waitForTimeout(3000);
    }
  }

  console.log('\nGeneration batch complete!');
  process.exit(0);
}

generateAll().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
