const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VISUAL_DIR = path.join(ROOT, 'projects', 'sample_first_king', 'visual_assets');

async function testSlotU1() {
  console.log('--- TESTING OMNI 1.1 FLASH ON SLOT u/1 ---');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
  const page = browser.contexts()[0].pages()[0];

  const startImage = path.join(VISUAL_DIR, 'scene_0001.jpg');
  const endImage = path.join(VISUAL_DIR, 'scene_0001_end.jpg');

  const url = 'https://aistudio.google.com/u/1/prompts/new_chat?model=gemini-omni-1.1-flash';
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape');

  // Verify Thinking Level is High
  try {
    const thinkingSelect = page.locator('mat-select[aria-label="Thinking Level"]').first();
    if (await thinkingSelect.count() > 0) {
      const currentThinking = await thinkingSelect.innerText();
      console.log('Thinking Level:', currentThinking);
      if (!currentThinking.includes('High')) {
        await thinkingSelect.click();
        await page.waitForTimeout(400);
        const opt = page.locator('mat-option:has-text("High")').first();
        if (await opt.count() > 0) await opt.click();
      }
    }
  } catch (e) {}

  // Set Aspect Ratio to 16:9
  try {
    const aspectSelect = page.locator('mat-select[aria-label="Aspect ratio"]').first();
    if (await aspectSelect.count() > 0) {
      await aspectSelect.click();
      await page.waitForTimeout(400);
      const opt169 = page.locator('mat-option:has-text("16:9")').first();
      if (await opt169.count() > 0) await opt169.click();
    }
  } catch (e) {}

  // Set Resolution to 720p
  try {
    const resSelect = page.locator('mat-select[aria-label="Video Resolution"]').first();
    if (await resSelect.count() > 0) {
      await resSelect.click();
      await page.waitForTimeout(400);
      const opt720 = page.locator('mat-option:has-text("720p")').first();
      if (await opt720.count() > 0) await opt720.click();
    }
  } catch (e) {}

  // Upload start and end images
  console.log('Uploading start and end images...');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles([startImage, endImage]);
  await page.waitForTimeout(3500);

  // Fill prompt
  const prompt = `Keyframe Animation: Transition from Image 1 (Starting Frame) to Image 2 (Ending Frame).
The Time Chronicler (elderly wise historian, bald crown with white fluffy hair on the sides, full bushy white beard and mustache, round wire-rim spectacles, brown scholar tunic over earthy shirt) holds the glowing antique history book and gestures warmly, surrounded by floating ancient scrolls in the mystical cosmic library.
MANDATORY CHARACTER LOCK: The character MUST retain his full white beard, white mustache, spectacles, hair, and brown scholar tunic from the first frame to the last frame. Do NOT remove the beard. Do NOT morph into another character. 2D flat animation, 24fps motion, 16:9 widescreen.`;

  const textarea = page.locator('textarea.textarea, textarea').first();
  await textarea.fill(prompt);
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'tools/u1_ready_to_run.png' });
  console.log('Saved tools/u1_ready_to_run.png');

  // Check Run button
  const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
  const isDisabled = await runBtn.getAttribute('aria-disabled') || await runBtn.getAttribute('disabled');
  console.log('Run button disabled:', isDisabled);

  // Check for any alerts or tooltips
  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('Contains paid alert:', pageText.includes('requires a paid API key'));
}

testSlotU1().catch(console.error);
