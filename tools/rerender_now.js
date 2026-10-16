const http = require('http');

async function main() {
  console.log('--- TRIGGERING BN RENDER ---');
  
  const payload = JSON.stringify({
    langs: ['bn'],
    bgmDb: -20,
    duck: true,
    useBgm: true
  });

  const req = http.request({
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/project/simple_itihash_002_first_language/render',
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
  http.get('http://127.0.0.1:4000/api/project/simple_itihash_002_first_language', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const pj = JSON.parse(data);
        const job = pj.job;
        if (!job) {
          console.log('Waiting for job...');
          setTimeout(pollJobStatus, 2000);
          return;
        }
        console.log(`[Progress: ${Math.round(job.progress)}%] Stage: ${job.stage} | Status: ${job.status}`);
        if (job.status === 'done') {
          console.log('\n==================================================');
          console.log('🎉 MASTER VIDEO RENDER COMPLETE!');
          console.log('Outputs:', JSON.stringify(job.outputs, null, 2));
          console.log('==================================================\n');
          process.exit(0);
        } else if (job.status === 'error' || job.status === 'cancelled') {
          console.error('\n✗ Render failed:', job.error);
          process.exit(1);
        } else {
          setTimeout(pollJobStatus, 2500);
        }
      } catch (e) {
        console.error('Poll parse error:', e.message);
        setTimeout(pollJobStatus, 2500);
      }
    });
  }).on('error', (err) => {
    console.error('Poll connection error:', err.message);
    setTimeout(pollJobStatus, 2500);
  });
}

main().catch(console.error);
