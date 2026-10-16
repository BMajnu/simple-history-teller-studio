async function inspectDownloadBtn() {
  const code = `
    const audioTags = await page.locator('audio').evaluateAll(els => els.map(e => ({ src: e.src, currentSrc: e.currentSrc })));
    const dlBtns = await page.locator('button[aria-label*="Download" i], button.download-button').evaluateAll(els => els.map(e => ({ label: e.getAttribute('aria-label'), class: e.className })));
    return { audioTags, dlBtns };
  `;
  try {
    const res = await fetch('http://127.0.0.1:9333/run-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    console.log(JSON.stringify(await res.json(), null, 2));
  } catch (e) {
    console.error(e);
  }
}
inspectDownloadBtn();
