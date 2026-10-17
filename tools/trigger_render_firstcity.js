const http = require('http');

const PROJECT = 'simple_itihash_004_first_city';

async function main() {
  console.log('--- TRIGGERING PRODUCTION STUDIO MASTER RENDER (First City 004) ---');

  const payload = JSON.stringify({
    langs: ['bn', 'en', 'hi'],
    bgmDb: -20,
    duck: true,
    useBgm: true,
    exportShorts: true
  });

  const req = http.request({
    hostname: '127.0.0.1',
    port: 4000,
    path: `/api/project/${PROJECT}/render`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Render trigger response:', data);
      pollJobStatus();
    });
  });

  req.on('error', (err) => console.error('Trigger request error:', err.message));
  req.write(payload);
  req.end();
}

function pollJobStatus() {
  const pollInterval = setInterval(() => {
    http.get(`http://127.0.0.1:4000/api/project/${PROJECT}/render-status`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const job = JSON.parse(data);
          if (!job) { console.log('Waiting for job...'); return; }
          console.log(`[Progress: ${job.progress}%] Stage: ${job.stage} | Status: ${job.status}`);
          if (job.status === 'done') {
            clearInterval(pollInterval);
            console.log('\n==================================================');
            console.log('MASTER VIDEO RENDER COMPLETE!');
            console.log('Outputs:', JSON.stringify(job.outputs, null, 2));
            console.log('==================================================\n');
            process.exit(0);
          } else if (job.status === 'error' || job.status === 'cancelled') {
            clearInterval(pollInterval);
            console.error('\nRender failed:', job.error);
            process.exit(1);
          }
        } catch (e) {
          console.error('Poll parse error:', e.message);
        }
      });
    }).on('error', (err) => console.error('Poll connection error:', err.message));
  }, 10000);
}

main().catch(console.error);
