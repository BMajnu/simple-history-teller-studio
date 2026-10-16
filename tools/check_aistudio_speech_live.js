async function checkLive() {
  const code = `
    const pages = browser.contexts()[0].pages();
    let page = pages.find(p => p.url().includes('generate-speech'));
    if (!page || page.isClosed()) {
      const ctx = browser.contexts()[0];
      page = await ctx.newPage();
      await page.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);
    }
    await page.bringToFront();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'd:/Graphics Projects/Agentics/daemon/current_screen.png' });
    const title = await page.title();
    const url = page.url();
    return { title, url };
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
checkLive();
