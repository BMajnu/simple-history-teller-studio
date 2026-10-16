const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const REFERENCE_IMG = 'D:\\Developing Projects\\Itihash Explainer Video\\projects\\simple_itihash_002_first_language\\visual_assets\\scene_0001.jpg';
const ARTIFACTS_DIR = 'C:\\Users\\badiu\\.gemini\\antigravity\\brain\\522a240f-2122-4427-9348-850afc4de7cf';

const CONCEPTS = [
  {
    name: 'history_mascot_01_pyramid_arch_quill',
    title: 'Concept 1: Time Chronicler with Quill, Pyramids & Ancient Stone Arch',
    prompt: 'Professional 2D cartoon mascot logo badge of the exact character from the reference image: The Wise Time Chronicler (bald on top with side gray hair, white beard, round glasses, wearing brown tunic/robe). Drawn in the exact 2D thin-line cartoon animation art style of the reference image. The chronicler is smiling gently, holding an illuminated glowing golden feather quill that leaves a swirling spiral of magical ancient runes and letters. Inside the circular badge background are iconic ancient history monuments: Egyptian pyramids and classical Roman stone columns under a starry night sky. Centered in a circular navy blue and gold emblem with stylish chiseled classical serif lettering curved along the rim reading "SIMPLE HISTORY TELLER", 1:1 square --no 3d, photorealism, modern clutter'
  },
  {
    name: 'history_mascot_02_torch_stone_arch_ruins',
    title: 'Concept 2: Time Chronicler with Ancient Torch & Giant History Book at Stone Ruins',
    prompt: '2D cartoon mascot logo badge in the exact art style of the reference image: The Wise Time Chronicler character (bald on top, white beard, round glasses, simple robe). In the circular emblem, he is holding a flaming ancient torch of truth in one hand and resting his other hand on a massive ancient leather-bound history book with golden corners. In the background inside the badge is an ancient carved stone archway and mysterious historical wall glyphs (like archaeological ruins). Centered circular badge, warm torchlight glow and deep royal navy, with elegant antique circular lettering "SIMPLE HISTORY TELLER", 1:1 square --no 3d, realistic textures'
  },
  {
    name: 'history_mascot_03_ancient_tome_pillars',
    title: 'Concept 3: Chronicler with Glowing Ancient Tome & Classical Columns',
    prompt: 'Clean 2D cartoon mascot logo badge matching the exact character and line art of the reference image: The Wise Time Chronicler leaning over a giant open ancient history tome on a stone pedestal, smiling as glowing golden ancient symbols swirl up. In the background inside the badge are ancient stone pillars and Egyptian pyramid silhouettes against a cosmic indigo sky. Centered circular crest with chiseled Roman font around the circular border: "SIMPLE HISTORY TELLER", 1:1 square --no photorealism, 3d'
  },
  {
    name: 'history_mascot_04_pure_monument_emblem_notext',
    title: 'Concept 4: Pure Icon Emblem (No Text) - Chronicler with Torch, Hourglass & Pyramids',
    prompt: 'Pure minimalist 2D cartoon mascot emblem (WITHOUT ANY TEXT) in the exact art style of the reference image: The Wise Time Chronicler (bald top, beard, glasses, robe) holding an ancient golden torch and a glowing hourglass. In the circular background are iconic silhouettes of the Great Pyramids of Giza and ancient classical Roman pillars under starlight. Clean circular gold and navy frame, pure visual logo icon, 1:1 square, highly recognizable at small avatar size --no text, no letters, no words, no 3d'
  },
  {
    name: 'history_mascot_05_antique_gold_coin_seal',
    title: 'Concept 5: Antique Historical Medallion Seal with Chronicler & Ancient Wonders',
    prompt: '2D cartoon mascot logo badge styled as an antique historical circular seal medallion: In the center is the Wise Time Chronicler from the reference image smiling with his glowing feather quill. Surrounding him inside the circular frame are miniature ancient wonders: the Pyramids, a stone Greek temple column, and an ancient scroll. Rich antique gold and navy blue colors, with clean chiseled historic typography along the rim: "SIMPLE HISTORY TELLER", 1:1 square --no photorealism, 3d'
  },
  {
    name: 'history_mascot_06_stone_portal_scroll',
    title: 'Concept 6: Chronicler at Ancient Megalithic Portal with Unrolled Papyrus Scroll',
    prompt: '2D cartoon mascot logo badge featuring the exact Time Chronicler character from the reference image, standing in front of an ancient megalithic stone gateway. He is smiling and unrolling an ancient illuminated papyrus scroll showing historical cave paintings and maps. In the background are ancient pyramids and a glowing lantern. Circular crest badge with elegant historic font "SIMPLE HISTORY TELLER", 1:1 square --no 3d, modern clutter'
  }
];

async function generateHistoryConcepts() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('aistudio')) || await ctx.newPage();

  console.log(`Starting generation of ${CONCEPTS.length} history-focused mascot logos...`);

  for (let i = 0; i < CONCEPTS.length; i++) {
    const item = CONCEPTS[i];
    const outPath = path.join(ARTIFACTS_DIR, `${item.name}.jpg`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 10000) {
      console.log(`[${i + 1}/${CONCEPTS.length}] Already exists: ${item.name}`);
      continue;
    }

    console.log(`\n========================================`);
    console.log(`[${i + 1}/${CONCEPTS.length}] Generating: ${item.title}`);

    try {
      // Navigate clean each time
      await page.goto('https://aistudio.google.com/prompts/new_chat?model=gemini-3.1-flash-image', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);

      // Remove any overlay / modals
      await page.evaluate(() => {
        document.querySelectorAll('.cdk-overlay-container, .cdk-overlay-backdrop').forEach(el => el.remove());
      });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);

      // Set Aspect ratio 1:1
      const arSelect = page.locator('mat-select[aria-label="Aspect ratio"]').first();
      if (await arSelect.count() > 0) {
        const txt = await arSelect.innerText();
        if (!txt.includes('1:1')) {
          await arSelect.click();
          await page.waitForTimeout(500);
          const opt11 = page.locator('mat-option:has-text("1:1")').first();
          if (await opt11.count() > 0) await opt11.click();
          await page.waitForTimeout(300);
        }
      }

      // Upload reference image if available
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.count() > 0) {
        console.log('Attaching scene_0001.jpg as reference image...');
        await fileInput.setInputFiles(REFERENCE_IMG);
        await page.waitForTimeout(2500);
      }

      const prevImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).map(img => img.src));

      const textarea = page.locator('textarea').first();
      await textarea.fill(item.prompt);
      await page.waitForTimeout(500);

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
        console.log(`Generation timed out for ${item.name}`);
      }

      await page.waitForTimeout(2000);
    } catch (err) {
      console.error(`Error on ${item.name}:`, err.message);
    }
  }

  console.log('\nAll history-focused mascot concepts completed!');
  process.exit(0);
}

generateHistoryConcepts().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
