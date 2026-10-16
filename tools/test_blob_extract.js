const fs = require('fs');
const path = require('path');

async function testBlobExtract() {
  const code = `
    const b64 = await page.evaluate(async () => {
      const audio = document.querySelector('audio');
      if (!audio || !audio.src) return null;
      const resp = await fetch(audio.src);
      const arrayBuffer = await resp.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    });

    return { hasB64: !!b64, len: b64 ? b64.length : 0, b64 };
  `;

  try {
    const res = await fetch('http://127.0.0.1:9333/run-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    console.log('Result:', { hasB64: data.result?.hasB64, len: data.result?.len });
    
    if (data.result?.b64) {
      const targetFile = 'd:\\Developing Projects\\Itihash Explainer Video\\scratch\\aistudio_blob_test.wav';
      fs.writeFileSync(targetFile, Buffer.from(data.result.b64, 'base64'));
      console.log('Successfully saved blob audio to:', targetFile, 'Size:', fs.statSync(targetFile).size, 'bytes');
    }
  } catch (e) {
    console.error(e);
  }
}

testBlobExtract();
