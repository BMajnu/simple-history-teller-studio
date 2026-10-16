const http = require('http');

function check() {
  http.get('http://127.0.0.1:4000/api/project/simple_itihash_002_first_language', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const pj = JSON.parse(data);
        const job = pj.job;
        if (!job) {
          console.log('No active job found.');
          process.exit(0);
        }
        console.log(`[Progress: ${Math.round(job.progress)}%] Stage: ${job.stage} | Status: ${job.status}`);
        if (job.status === 'done') {
          console.log('\n🎉 RENDER FINISHED SUCCESSFULLY!');
          console.log('Outputs:', JSON.stringify(job.outputs, null, 2));
          process.exit(0);
        } else if (job.status === 'error' || job.status === 'cancelled') {
          console.error('\n❌ Render failed:', job.error);
          process.exit(1);
        } else {
          setTimeout(check, 2500);
        }
      } catch (e) {
        console.error('Parse error:', e.message);
        setTimeout(check, 2500);
      }
    });
  }).on('error', (err) => {
    console.error('Request error:', err.message);
    setTimeout(check, 2500);
  });
}

check();
