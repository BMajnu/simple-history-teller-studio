async function goToSpeech() {
  const code = `
    await page.goto('https://aistudio.google.com/generate-speech?model=gemini-3.8-flash-tts', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    return { title: await page.title(), url: page.url() };
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
goToSpeech();
