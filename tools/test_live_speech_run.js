const fs = require('fs');
const path = require('path');

async function testLiveSpeech() {
  const code = `
    // Switch to Puck or Ludo if possible
    const voiceChip = page.locator('.voice-chip, button.voice-playground-chip').first();
    if (await voiceChip.count() > 0) {
      const cur = await voiceChip.innerText();
      if (!cur.toLowerCase().includes('ludo') && !cur.toLowerCase().includes('puck')) {
        await voiceChip.click();
        await page.waitForTimeout(500);
        const ludoBtn = page.locator('button:has-text("Ludo"), button[aria-label*="Ludo"]').first();
        if (await ludoBtn.count() > 0) {
          await ludoBtn.click();
          await page.waitForTimeout(300);
        }
        const closeBtn = page.locator('button[aria-label="Close panel"]').first();
        if (await closeBtn.count() > 0) await closeBtn.click();
      }
    }

    // Set text
    const textarea = page.locator('textarea[aria-label="Speech block text"], textarea').first();
    await textarea.focus();
    await textarea.fill("<gasp> আমি সময়ের সাক্ষী! আজ তোমাকে নিয়ে যাব মানব ইতিহাসের সেই মুহূর্তে, যখন তৈরি হয়েছিল মানুষের প্রথম ভাষা।");
    await page.waitForTimeout(500);

    // Click Run
    const runBtn = page.locator('button.ctrl-enter-submits, button:has-text("Run")').first();
    await runBtn.click();
    console.log('Clicked Run, waiting for generation response...');

    let status = 'waiting';
    let errorMessage = '';
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(1000);
      
      const modal = page.locator('mat-dialog-container, .cdk-overlay-pane, [role="dialog"]');
      if (await modal.count() > 0) {
        const text = await modal.innerText().catch(() => '');
        if (text.includes('quota') || text.includes('Upgrade') || text.includes('Failed')) {
          status = 'quota_exceeded';
          errorMessage = text;
          break;
        }
      }

      const stopBtn = page.locator('button:has-text("Stop")');
      if (await stopBtn.count() === 0 && i > 3) {
        // Stop button disappeared, generation might be done
        status = 'success';
        break;
      }
    }

    await page.screenshot({ path: 'd:/Graphics Projects/Agentics/daemon/current_screen.png' });
    return { status, errorMessage };
  `;

  try {
    const res = await fetch('http://127.0.0.1:9333/run-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    console.log(await res.json());
  } catch (e) {
    console.error(e);
  }
}

testLiveSpeech();
