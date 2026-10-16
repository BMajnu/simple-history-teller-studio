const http = require('http');
const { exportProjectDual } = require('./dual_render_exporter');

async function main() {
  console.log('--- TRIGGERING PRODUCTION MASTER RENDER WITH SPEAKER BADGES (sample_first_king) ---');
  
  const payload = JSON.stringify({
    langs: ['bn'],
    bgmDb: -20,
    duck: true,
    useBgm: true
  });

  const req = http.request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/project/sample_first_king/render',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Render trigger response:', data);
      pollJobStatus();
    });
  });

  req.on('error', (err) => {
    console.error('Trigger request error:', err.message);
  });

  req.write(payload);
  req.end();
}

function pollJobStatus() {
  const pollInterval = setInterval(async () => {
    try {
      const res = await fetch('http://127.0.0.1:4000/api/project/sample_first_king');
      const data = await res.json();
      const job = data.job;
      if (!job) {
        console.log('Waiting for job snapshot...');
        return;
      }
      console.log(`[${new Date().toLocaleTimeString()}] Progress: ${job.progress.toFixed(1)}% | Stage: ${job.stage} | Status: ${job.status}`);
      if (job.status === 'done') {
        clearInterval(pollInterval);
        console.log('\n==================================================');
        console.log('🎉 MASTER VIDEO RENDER COMPLETE WITH SPEAKER BADGES!');
        console.log('Outputs:', JSON.stringify(job.outputs, null, 2));
        console.log('==================================================\n');

        console.log('▶ Generating episodic vertical 9:16 Shorts/Reels/TikTok clips...');
        try {
          const shortsResult = await exportProjectDual('sample_first_king', { langs: ['bn'] });
          console.log(`\n🎉 Dual-Export completed! ${shortsResult.exports.length} viral shorts generated!`);
        } catch (sErr) {
          console.error('Error generating shorts:', sErr);
        }

        process.exit(0);
      } else if (job.status === 'error' || job.status === 'cancelled') {
        clearInterval(pollInterval);
        console.error('\n❌ Render job failed/cancelled:', job.error);
        process.exit(1);
      }
    } catch (e) {
      console.warn('Polling error:', e.message);
    }
  }, 4000);
}

main().catch(console.error);
