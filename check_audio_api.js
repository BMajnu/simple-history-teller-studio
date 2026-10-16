const http = require('http');

http.get('http://localhost:4000/api/project/simple_itihash_002_first_language', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const p = JSON.parse(d);
    console.log('Audio channels recognized:');
    for (const [k, v] of Object.entries(p.audio)) {
      console.log(`- ${k}: ${v ? v.url + ' (' + v.duration + 's)' : 'missing'}`);
    }
  });
});
