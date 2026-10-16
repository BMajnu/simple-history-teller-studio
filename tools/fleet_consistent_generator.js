const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VISUAL_DIR = path.join(ROOT, 'projects', 'sample_first_king', 'visual_assets');
// Accounts pool
const ACCOUNTS = ['u/5', 'u/4', 'u/2', 'u/1', 'u/3'];

class FleetGenerator {
  constructor() {
    this.browser = null;
    this.page = null;
    this.currentAccountIndex = 0;
  }

  async init() {
    if (!this.browser) {
      this.browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
      this.page = this.browser.contexts()[0].pages()[0];
    }
  }

  async generateImage({ prompt, referenceFiles = [], outPath, model = 'gemini-nano-banana-2.1' }) {
    await this.init();
    console.log(`\n========================================`);
    console.log(`GENERATING IMAGE: ${path.basename(outPath)}`);
    console.log(`Model: ${model} | Thinking: High`);
    console.log(`========================================`);

    for (let attempt = 0; attempt < ACCOUNTS.length; attempt++) {
      const slot = ACCOUNTS[(this.currentAccountIndex + attempt) % ACCOUNTS.length];
      console.log(`\n[Account Slot: ${slot}] Opening image prompt...`);

      try {
        const url = `https://aistudio.google.com/${slot}/prompts/new_chat?model=${model}`;
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
        await this.page.waitForTimeout(3000);
        await this.page.keyboard.press('Escape');

        // Check if account demands paid API key right away
        let pageText = await this.page.evaluate(() => document.body.innerText);
        if (pageText.includes('requires a paid API key')) {
          console.warn(`⚠️ Slot ${slot} demands paid API key. Switching slot...`);
          continue;
        }

        // Set Thinking Level to High
        try {
          const thinkingSelect = this.page.locator('mat-select[aria-label="Thinking Level"]').first();
          if (await thinkingSelect.count() > 0) {
            const current = await thinkingSelect.innerText();
            if (!current.includes('High')) {
              await thinkingSelect.click();
              await this.page.waitForTimeout(400);
              const opt = this.page.locator('mat-option:has-text("High")').first();
              if (await opt.count() > 0) await opt.click();
            }
          }
        } catch (e) {}

        // Upload reference images
        if (referenceFiles.length > 0) {
          console.log(`Attaching ${referenceFiles.length} reference file(s)...`);
          const fileInput = this.page.locator('input[type="file"]').first();
          await fileInput.setInputFiles(referenceFiles);
          await this.page.waitForTimeout(2500);

          // Handle media acknowledgment modal
          const ackBtn = this.page.locator('button:has-text("Acknowledge"), button:has-text("Accept"), button:has-text("Got it")').first();
          if (await ackBtn.isVisible().catch(() => false)) {
            console.log('Dismissing media modal...');
            await ackBtn.click();
            await this.page.waitForTimeout(500);
          }
        }

        // Fill prompt
        const textarea = this.page.locator('textarea.textarea, textarea').first();
        await textarea.fill(prompt);
        await this.page.waitForTimeout(1000);

        // Check Run button
        const runBtn = this.page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
        const isDisabled = await runBtn.getAttribute('aria-disabled') === 'true' || await runBtn.getAttribute('disabled');
        pageText = await this.page.evaluate(() => document.body.innerText);

        if (isDisabled || pageText.includes('requires a paid API key') || pageText.includes('quota')) {
          console.warn(`⚠️ Slot ${slot} unavailable for image gen. Switching slot...`);
          continue;
        }

        console.log(`Clicking Run on slot ${slot}...`);
        await runBtn.click({ force: true });

        // Monitor image generation
        let imgSrc = null;
        let failed = false;
        const t0 = Date.now();
        for (let i = 0; i < 40; i++) {
          await this.page.waitForTimeout(2500);
          const state = await this.page.evaluate(() => {
            const imgs = Array.from(document.querySelectorAll('img')).filter(img => 
              img.src && (img.src.startsWith('blob:') || img.src.includes('googleusercontent.com')) &&
              img.naturalWidth > 400
            );
            const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
            const err = document.querySelector('.error-message, mat-error, [role="alert"]');
            return {
              hasImg: imgs.length > 0,
              src: imgs.length > 0 ? imgs[imgs.length - 1].src : null,
              hasStop: stop,
              err: err ? err.innerText : null
            };
          });

          const elapsed = Math.round((Date.now() - t0) / 1000);
          console.log(`[${elapsed}s] StopBtn: ${state.hasStop} | ImageReady: ${state.hasImg}`);

          if (state.hasImg && !state.hasStop) {
            imgSrc = state.src;
            console.log(`🎉 Image generated in ${elapsed}s!`);
            break;
          }

          if (state.err) {
            console.error(`AI Studio error: ${state.err}`);
            failed = true;
            break;
          }

          if (!state.hasStop && !state.hasImg && i >= 6) {
            console.warn(`⚠️ Slot ${slot} generation did not start.`);
            failed = true;
            break;
          }
        }

        if (failed || !imgSrc) {
          console.warn(`Slot ${slot} failed, trying next slot...`);
          continue;
        }

        console.log('Extracting image base64...');
        const base64Data = await this.page.evaluate(async (src) => {
          const res = await fetch(src);
          const blob = await res.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
          });
        }, imgSrc);

        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(outPath, buffer);
        console.log(`💾 Saved: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
        this.currentAccountIndex = (this.currentAccountIndex + attempt) % ACCOUNTS.length;
        return true;

      } catch (err) {
        console.error(`Error in slot ${slot}:`, err.message);
      }
    }

    throw new Error(`Failed to generate image across all accounts for ${outPath}`);
  }

  async generateVideo({ startFrame, endFrame, prompt, outPath }) {
    await this.init();
    console.log(`\n========================================`);
    console.log(`GENERATING VIDEO: ${path.basename(outPath)}`);
    console.log(`Start Frame: ${path.basename(startFrame)}`);
    console.log(`End Frame:   ${path.basename(endFrame)}`);
    console.log(`Model: gemini-omni-1.1-flash | Thinking: High`);
    console.log(`========================================`);

    for (let attempt = 0; attempt < ACCOUNTS.length; attempt++) {
      const slot = ACCOUNTS[(this.currentAccountIndex + attempt) % ACCOUNTS.length];
      console.log(`\n[Account Slot: ${slot}] Testing video availability...`);

      try {
        const url = `https://aistudio.google.com/${slot}/prompts/new_chat?model=gemini-omni-1.1-flash`;
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
        await this.page.waitForTimeout(3000);
        await this.page.keyboard.press('Escape');

        // Thinking Level: High
        try {
          const thinkingSelect = this.page.locator('mat-select[aria-label="Thinking Level"]').first();
          if (await thinkingSelect.count() > 0) {
            const current = await thinkingSelect.innerText();
            if (!current.includes('High')) {
              await thinkingSelect.click();
              await this.page.waitForTimeout(400);
              const opt = this.page.locator('mat-option:has-text("High")').first();
              if (await opt.count() > 0) await opt.click();
            }
          }
        } catch (e) {}

        // Aspect ratio: 16:9
        try {
          const aspectSelect = this.page.locator('mat-select[aria-label="Aspect ratio"]').first();
          if (await aspectSelect.count() > 0) {
            await aspectSelect.click();
            await this.page.waitForTimeout(400);
            const opt169 = this.page.locator('mat-option:has-text("16:9")').first();
            if (await opt169.count() > 0) await opt169.click();
          }
        } catch (e) {}

        // Resolution: 720p
        try {
          const resSelect = this.page.locator('mat-select[aria-label="Video Resolution"]').first();
          if (await resSelect.count() > 0) {
            await resSelect.click();
            await this.page.waitForTimeout(400);
            const opt720 = this.page.locator('mat-option:has-text("720p")').first();
            if (await opt720.count() > 0) await opt720.click();
          }
        } catch (e) {}

        // Attach Start Frame and End Frame
        console.log('Attaching start and end keyframes...');
        const fileInput = this.page.locator('input[type="file"]').first();
        await fileInput.setInputFiles([startFrame, endFrame]);
        await this.page.waitForTimeout(2500);

        // Handle media acknowledgment modal if shown
        const ackBtn = this.page.locator('button:has-text("Acknowledge"), button:has-text("Accept"), button:has-text("Got it")').first();
        if (await ackBtn.isVisible().catch(() => false)) {
          console.log('Dismissing media modal...');
          await ackBtn.click();
          await this.page.waitForTimeout(500);
        }

        // Fill prompt
        const textarea = this.page.locator('textarea.textarea, textarea').first();
        await textarea.fill(prompt);
        await this.page.waitForTimeout(1000);

        // Check Run button
        const runBtn = this.page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
        const isDisabled = await runBtn.getAttribute('aria-disabled') === 'true' || await runBtn.getAttribute('disabled');
        const pageText = await this.page.evaluate(() => document.body.innerText);

        if (isDisabled || pageText.includes('requires a paid API key') || pageText.includes('quota')) {
          console.warn(`⚠️ Slot ${slot} unavailable for video. Skipping slot...`);
          continue;
        }

        console.log(`Clicking Run on slot ${slot}...`);
        await runBtn.click({ force: true });

        // Monitor video generation
        let videoSrc = null;
        let failed = false;
        const t0 = Date.now();
        for (let i = 0; i < 55; i++) {
          await this.page.waitForTimeout(3000);
          const state = await this.page.evaluate(() => {
            const vid = document.querySelector('video');
            const stop = Array.from(document.querySelectorAll('button')).some(b => (b.innerText || '').includes('Stop'));
            const err = document.querySelector('.error-message, mat-error, [role="alert"]');
            return {
              hasVid: !!vid && !!vid.src,
              src: vid ? vid.src : null,
              hasStop: stop,
              err: err ? err.innerText : null
            };
          });

          const elapsed = Math.round((Date.now() - t0) / 1000);
          console.log(`[${elapsed}s] StopBtn: ${state.hasStop} | VideoReady: ${state.hasVid}`);

          // Success check
          if (state.hasVid && !state.hasStop) {
            videoSrc = state.src;
            console.log(`🎉 Video successfully generated in ${elapsed}s!`);
            break;
          }

          if (state.err) {
            console.error(`AI Studio error: ${state.err}`);
            failed = true;
            break;
          }

          if (!state.hasStop && !state.hasVid && i >= 6) {
            console.warn(`⚠️ Slot ${slot} generation did not start.`);
            failed = true;
            break;
          }
        }

        if (failed || !videoSrc) {
          console.warn(`Slot ${slot} failed, switching to next slot...`);
          continue;
        }

        console.log('Extracting video blob...');
        const videoBase64 = await this.page.evaluate(async (src) => {
          const res = await fetch(src);
          const blob = await res.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
          });
        }, videoSrc);

        const buffer = Buffer.from(videoBase64, 'base64');
        fs.writeFileSync(outPath, buffer);
        console.log(`💾 Saved: ${outPath} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
        this.currentAccountIndex = (this.currentAccountIndex + attempt) % ACCOUNTS.length;
        return true;

      } catch (err) {
        console.error(`Error in slot ${slot}:`, err.message);
      }
    }

    throw new Error(`Failed to generate video across all accounts for ${outPath}`);
  }
}

module.exports = { FleetGenerator };
