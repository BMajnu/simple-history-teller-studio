const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9224');
    const page = browser.contexts()[0].pages()[0];
    
    // Check if "Create new dialog" card is visible
    const hasCard = await page.evaluate(() => {
      return !!document.querySelector('.action-card-label');
    });
    
    if (hasCard) {
      console.log('Clicking Create new dialog card...');
      await page.mouse.click(350, 420);
      await page.waitForTimeout(2000);
    }
    
    // Find textarea
    console.log('Locating speech textarea...');
    const textarea = page.locator('textarea.textarea, textarea').first();
    await textarea.waitFor({ timeout: 10000 });
    
    const shot49Text = "কিন্তু কথা বলার জন্য মানুষের শরীরকে একটি মারাত্মক বিবর্তনীয় মূল্য দিতে হয়েছে! শিম্পাঞ্জিদের স্বরতন্ত্র গলার অনেক উপরে থাকে, তাই তারা একই সাথে পানি গিলতে ও শ্বাস নিতে পারে—তাদের কখনো বিষম খেয়ে দম বন্ধ হয় না।";
    
    console.log('Filling shot 49 text...');
    await textarea.fill(shot49Text);
    await page.waitForTimeout(500);
    
    // Check Run button
    const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
    console.log('Clicking Run...');
    await runBtn.click();
    
    // Wait for generation to complete
    console.log('Waiting for synthesis...');
    let audioFound = false;
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(1000);
      const isRunning = await page.evaluate(() => {
        const stopBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Stop'));
        const audio = document.querySelector('audio');
        return { hasStop: !!stopBtn, hasAudio: !!(audio && audio.src) };
      });
      
      process.stdout.write(`[${i}s: stop=${isRunning.hasStop}, audio=${isRunning.hasAudio}] `);
      
      if (!isRunning.hasStop && isRunning.hasAudio) {
        audioFound = true;
        break;
      }
    }
    console.log('\nAudio ready:', audioFound);
    
    await page.screenshot({ path: 'tools/after_shot49_gen.png' });
    console.log('Screenshot saved to tools/after_shot49_gen.png');
    
    if (audioFound) {
      // Extract audio blob
      const audioBase64 = await page.evaluate(async () => {
        const audio = document.querySelector('audio');
        if (!audio || !audio.src) return null;
        const res = await fetch(audio.src);
        const blob = await res.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(blob);
        });
      });
      
      if (audioBase64) {
        const buf = Buffer.from(audioBase64, 'base64');
        const outPath = path.join(__dirname, '..', 'projects', 'simple_itihash_002_first_language', 'audio', 'raw_aistudio', 'bn_shot_0049.wav');
        fs.writeFileSync(outPath, buf);
        console.log(`✓ Saved ${outPath} (${buf.length} bytes)`);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
})();
