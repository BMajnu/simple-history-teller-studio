const http = require('http');

const req = http.get('http://127.0.0.1:4000/api/project/simple_itihash_002_first_language/render-status', (res) => {
  res.on('data', (chunk) => {
    const text = chunk.toString();
    const lines = text.split('\n');
    for (const l of lines) {
      if (l.startsWith('data: ')) {
        try {
          const data = JSON.parse(l.slice(6));
          console.log(`[Status: ${data.status}] [Progress: ${data.progress}%] [Stage: ${data.stage}]`);
          if (data.logs && data.logs.length > 0) {
            console.log('Latest log:', data.logs[data.logs.length - 1]);
          }
          if (data.outputs && data.outputs.length > 0) {
            console.log('Outputs:', data.outputs);
          }
          if (data.status === 'completed' || data.status === 'error' || data.status === 'canceled') {
            process.exit(0);
          }
        } catch (e) {}
      }
    }
  });
});

req.on('error', (err) => {
  console.error('SSE Error:', err.message);
  process.exit(1);
});

// Auto-exit check after 6 seconds to report progress without hanging
setTimeout(() => {
  process.exit(0);
}, 6000);
