const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REF_DIR = path.join(ROOT, 'references');
const LOGO_REF = path.join(REF_DIR, 'mascot_logo_ref.jpg');

const MASCOT_TASKS = [
  {
    styleId: 2,
    presetName: 'PRESET_SIMPLE_HISTORY',
    userSlot: 'u/1',
    outFile: path.join(REF_DIR, 'ref_host_simple_history.jpg'),
    prompt: `The attached image is the official channel logo mascot: an elderly wise historian scholar with a balding head, fluffy white hair around the sides and back, a full bushy white beard and mustache, small wire-rim glasses, and an earthy brown scholar's robe/tunic, carrying an ancient history book with a golden emblem and a flaming torch.

TASK: Redraw this EXACT mascot character in the Classic Simple History 2D Documentary Animation style (Style 2 Benchmark):
- Head & Face: Balding with fluffy white hair on sides, full bushy white groomed beard and mustache, small round spectacles on his nose, thoughtful, friendly, intelligent scholar expression.
- Body & Attire: 2D animated graphic novel character proportions, wearing an authentic earthy brown medieval/ancient historian scholar's robe and hooded mantle over an olive-green undertunic.
- Pose: Standing full-body character model sheet showing front and 3/4 angles, holding his thick antique leather history book with golden rune emblem in one hand and a glowing flaming wooden torch in the other.
- Background: Clean warm parchment paper studio backdrop (#EFE8DD), character turnaround sheet, 16:9 widescreen.
- Style: Crisp solid black outlines, clean cel-shaded 2D vector fills, vibrant historical documentary aesthetic, 100% faithful to the attached logo reference.

--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, photorealism, 3D render`
  },
  {
    styleId: 3,
    presetName: 'PRESET_MYSTERY_NOIR',
    userSlot: 'u/2',
    outFile: path.join(REF_DIR, 'ref_host_mystery_noir.jpg'),
    prompt: `The attached image is the official channel logo mascot: an elderly wise historian scholar with a balding head, fluffy white hair around the sides and back, a full bushy white beard and mustache, small wire-rim glasses, and an earthy brown scholar's robe/tunic, carrying an ancient history book with a golden emblem and a flaming torch.

TASK: Redraw this EXACT mascot character in the Dark Mystery Noir Historical style (Style 3 Benchmark):
- Atmosphere: Dramatic high-contrast chiaroscuro lighting, deep mysterious shadows with rich warm torchlight glowing across his face, beard, and spectacles.
- Head & Face: Balding head with white hair fringe, voluminous white textured beard, gleaming spectacles reflecting firelight, intense, investigative, knowing gaze.
- Body & Attire: Wearing a weathered, heavy dark brown hooded scholar's robe with deep folds, clutching his mysterious antique leather history tome with glowing occult/historical symbols.
- Pose: Full body character reference standing in dramatic noir lighting, holding a crackling flaming wooden torch that casts flickering golden light.
- Background: Moody dark studio stone archway background with deep shadows and subtle dust motes, 16:9 widescreen.
- Style: Atmospheric cinematic digital graphic novel illustration, gritty textures, deep black shadows, warm golden rim light.

--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, photorealism, 3D render`
  },
  {
    styleId: 4,
    presetName: 'PRESET_ISLAMIC_REVERENT',
    userSlot: 'u/3',
    outFile: path.join(REF_DIR, 'ref_host_islamic_reverent.jpg'),
    prompt: `The attached image is the official channel logo mascot: an elderly wise historian scholar with a balding head, fluffy white hair around the sides and back, a full bushy white beard and mustache, small wire-rim glasses, and an earthy brown scholar's robe/tunic, carrying an ancient history book with a golden emblem and a flaming torch.

TASK: Redraw this EXACT mascot character in the Dignified Islamic Golden Age & Classical Illuminated style (Style 4 Benchmark):
- Atmosphere: Majestic, serene, enlightened scholarly dignity with subtle golden arabesque ornamental motifs and soft radiant light.
- Head & Face: Wise dignified elderly polymath historian, balding with neat white hair on sides, majestic full white beard, small wire-rim spectacles, serene benevolent wisdom.
- Body & Attire: Elegant traditional scholar's robe (Jubba/Thobe) in warm camel brown and deep desert sand tones, fine embroidered gold trim on collar, holding an ornate antique manuscript with illuminated golden binding.
- Pose: Full body character turnaround model sheet, holding the illuminated historical manuscript and a brass oil lamp / lantern casting warm light.
- Background: Elegant warm neutral illuminated parchment background with delicate golden geometric border filigree, 16:9 widescreen.
- Style: Classical refined historical 2D illustration, rich warm colors, noble dignified aesthetic.

--no text, typography, labels, numbers, titles, subtitles, words, speech bubbles, watermarks, photorealism, 3D render`
  }
];

async function generateSingleMascot(task, browser) {
  const ctx = browser.contexts()[0];
  const page = await ctx.newPage();
  console.log(`[Style ${task.styleId}] Starting ${task.presetName} on slot ${task.userSlot}...`);

  try {
    const url = `https://aistudio.google.com/${task.userSlot}/prompts/new_chat?model=gemini-3.1-flash-image`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(3000);
    await page.keyboard.press('Escape');

    // 16:9 Aspect Ratio
    const arSelect = page.locator('mat-select[aria-label*="Aspect ratio"], mat-select[aria-label*="aspect"]').first();
    if (await arSelect.count() > 0) {
      await arSelect.click();
      await page.waitForTimeout(400);
      const opt = page.locator('mat-option:has-text("16:9")').first();
      if (await opt.count() > 0) await opt.click();
      await page.waitForTimeout(300);
    }

    // 1K Resolution
    const resSelect = page.locator('mat-select[aria-label*="Resolution"], mat-select[aria-label*="resolution"]').first();
    if (await resSelect.count() > 0) {
      await resSelect.click();
      await page.waitForTimeout(400);
      const opt1k = page.locator('mat-option:has-text("1K")').first();
      if (await opt1k.count() > 0) await opt1k.click();
      await page.waitForTimeout(300);
    }

    // Attach logo reference image
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(LOGO_REF);
    await page.waitForTimeout(3000);

    // Fill prompt
    const textarea = page.locator('textarea, div[contenteditable="true"]').first();
    await textarea.fill(task.prompt);
    await page.waitForTimeout(500);

    const prevImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).map(i => i.src));

    // Run
    const runBtn = page.locator('button:has-text("Run"), button.ctrl-enter-submits').last();
    await runBtn.click();

    let newSrc = null;
    for (let t = 0; t < 25; t++) {
      await page.waitForTimeout(2000);
      const isGenerating = (await page.locator('button:has-text("Stop"), [aria-label*="Stop"]').count()) > 0;
      const currentImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).filter(i => i.naturalWidth >= 300).map(i => i.src));
      const diff = currentImgs.filter(s => !prevImgs.includes(s));
      if (diff.length > 0 && !isGenerating) {
        newSrc = diff[diff.length - 1];
        console.log(`[Style ${task.styleId}] ✓ Image generated in ${(t + 1) * 2}s!`);
        break;
      }
    }

    if (!newSrc) throw new Error(`Timed out for ${task.presetName}`);

    // Extract base64
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
    }, newSrc);

    if (base64Data && base64Data.data) {
      fs.writeFileSync(task.outFile, Buffer.from(base64Data.data, 'base64'));
      console.log(`[Style ${task.styleId}] ✓ Saved: ${path.basename(task.outFile)} (${base64Data.w}x${base64Data.h}, ${fs.statSync(task.outFile).size} bytes)`);
    }

  } catch (err) {
    console.error(`[Style ${task.styleId}] Error:`, err.message);
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  console.log('Connecting to Chrome on port 9224...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');

  console.log(`Dispatching ${MASCOT_TASKS.length} mascot style generation tasks in parallel...`);
  await Promise.all(MASCOT_TASKS.map(t => generateSingleMascot(t, browser)));
  console.log('All mascot style generations completed!');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
