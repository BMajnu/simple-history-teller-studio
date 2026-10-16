const http = require('http');

async function trigger() {
  console.log('Sending render request for simple_itihash_002_first_language to Production Studio (http://127.0.0.1:4000)...');
  const payload = JSON.stringify({
    langs: ['bn', 'en', 'hi'],
    bgmDb: -20,
    duck: true,
    useBgm: true
  });

  const req = http.request('http://127.0.0.1:4000/api/project/simple_itihash_002_first_language/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Render trigger response status:', res.statusCode);
      console.log('Response body:', data);
    });
  });

  req.on('error', (err) => {
    console.error('Render request failed:', err.message);
  });

  req.write(payload);
  req.end();
}

trigger();
