const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();
  
  const imgPath = path.resolve('references/mascot_logo_ref.jpg');
  const base64 = fs.readFileSync(imgPath).toString('base64');
  const dataUri = 'data:image/jpeg;base64,' + base64;

  const resultBase64 = await page.evaluate(async (src) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const size = 1024;
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d');

        // Background
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(0, 0, size, size);

        // Radial background glow
        const bgGrad = ctx.createRadialGradient(size/2, size/2, 120, size/2, size/2, size * 0.7);
        bgGrad.addColorStop(0, '#15203a');
        bgGrad.addColorStop(0.6, '#0d1527');
        bgGrad.addColorStop(1, '#060a14');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, size, size);

        // Torch glow on the right
        const torchGlow = ctx.createRadialGradient(size * 0.65, size * 0.45, 20, size * 0.65, size * 0.45, 400);
        torchGlow.addColorStop(0, 'rgba(255, 170, 40, 0.28)');
        torchGlow.addColorStop(0.5, 'rgba(255, 140, 20, 0.08)');
        torchGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = torchGlow;
        ctx.fillRect(0, 0, size, size);

        // Top ambient glow
        const topGlow = ctx.createRadialGradient(size * 0.5, size * 0.12, 30, size * 0.5, size * 0.12, 350);
        topGlow.addColorStop(0, 'rgba(255, 220, 100, 0.25)');
        topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = topGlow;
        ctx.fillRect(0, 0, size, size);

        // Logo parameters
        const cx = size / 2;
        const cy = size / 2;
        const scale = 1.84;
        const origCx = 253.5;
        const origCy = 294.5;

        const rInner = 170 * scale;
        const rBand = 202 * scale;
        const rCream = 207 * scale;
        const rOuterGold = 214 * scale;

        // Draw original image centered
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.drawImage(img, -origCx, -origCy);
        ctx.restore();

        // Fix the bottom arc where original was cropped:
        // Angle in standard polar: 0 is 3 o'clock, PI/2 is 6 o'clock, PI is 9 o'clock
        const startAngle = Math.PI * 0.18;
        const endAngle = Math.PI * 0.82;

        // 1. Fill the bottom arc navy ribbon
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, rBand, startAngle, endAngle, false);
        ctx.arc(cx, cy, rInner, endAngle, startAngle, true);
        ctx.closePath();
        
        const bandGrad = ctx.createRadialGradient(cx, cy, rInner, cx, cy, rBand);
        bandGrad.addColorStop(0, '#0c1b3b');
        bandGrad.addColorStop(0.5, '#122652');
        bandGrad.addColorStop(1, '#0a1630');
        ctx.fillStyle = bandGrad;
        ctx.fill();
        ctx.restore();

        // 2. Draw border rings along bottom arc to complete the circle
        ctx.save();
        // Inner gold ring
        ctx.beginPath();
        ctx.arc(cx, cy, rInner, startAngle - 0.05, endAngle + 0.05);
        ctx.strokeStyle = '#e5b842';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Middle ivory/cream ring
        ctx.beginPath();
        ctx.arc(cx, cy, (rBand + rCream) / 2, startAngle - 0.05, endAngle + 0.05);
        ctx.strokeStyle = '#fbfbfa';
        ctx.lineWidth = 10;
        ctx.stroke();

        // Outer gold ring
        ctx.beginPath();
        ctx.arc(cx, cy, rOuterGold, startAngle - 0.05, endAngle + 0.05);
        ctx.strokeStyle = '#e5b842';
        ctx.lineWidth = 8;
        ctx.stroke();

        // Outer dark contour line
        ctx.beginPath();
        ctx.arc(cx, cy, rOuterGold + 4, startAngle - 0.05, endAngle + 0.05);
        ctx.strokeStyle = '#1b1204';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // 3. Complete outer golden aura
        ctx.save();
        const aura = ctx.createRadialGradient(cx, cy, rOuterGold - 5, cx, cy, rOuterGold + 50);
        aura.addColorStop(0, 'rgba(255, 215, 70, 0.45)');
        aura.addColorStop(0.25, 'rgba(255, 195, 50, 0.22)');
        aura.addColorStop(0.6, 'rgba(255, 160, 20, 0.06)');
        aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(cx, cy, rOuterGold + 55, 0, Math.PI * 2);
        ctx.fillStyle = aura;
        ctx.fill();
        ctx.restore();

        // 4. Render Curved Text: 'SIMPLE HISTORY TELLER' along bottom arc
        const rText = (rInner + rBand) / 2 - 2;
        const text = 'SIMPLE HISTORY TELLER';
        
        ctx.save();
        ctx.font = 'bold 32px "Cinzel", "Georgia", "Times New Roman", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const totalAngle = 2.14; // Span in radians (~122 degrees)
        const startRad = Math.PI / 2 + totalAngle / 2;
        const endRad = Math.PI / 2 - totalAngle / 2;
        const chars = text.split('');
        const step = (startRad - endRad) / (chars.length - 1);

        for (let i = 0; i < chars.length; i++) {
          const char = chars[i];
          const angle = startRad - i * step;
          const x = cx + rText * Math.cos(angle);
          const y = cy + rText * Math.sin(angle);

          ctx.save();
          ctx.translate(x, y);
          // Tangent rotation so characters follow circular arc
          ctx.rotate(angle - Math.PI / 2);

          // Deep shadow
          ctx.fillStyle = '#221501';
          ctx.fillText(char, 2, 2);

          // Gold base
          ctx.fillStyle = '#fad566';
          ctx.fillText(char, 0, 0);

          // Top highlight
          ctx.fillStyle = '#fff6cc';
          ctx.fillText(char, -0.6, -0.6);

          ctx.restore();
        }
        ctx.restore();

        resolve(c.toDataURL('image/png').replace(/^data:image\/png;base64,/, ''));
      };
      img.src = src;
    });
  }, dataUri);

  const outPath = path.resolve('banner_assets/official_mascot_logo_perfect_uncropped.png');
  fs.writeFileSync(outPath, Buffer.from(resultBase64, 'base64'));
  console.log('Saved uncropped logo:', outPath);
  await browser.close();
})();
