const http = require('http');

const req = http.get('http://127.0.0.1:4000/api/project/simple_itihash_002_first_language/render-status', (res) => {
  let buffer = '';

  res.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n\n');
    buffer = lines.pop(); // keep last incomplete chunk

    for (const block of lines) {
      if (block.startsWith('event: state')) {
        const dataLine = block.split('\n').find(l => l.startsWith('data: '));
        if (dataLine) {
          try {
            const state = JSON.parse(dataLine.replace('data: ', ''));
            console.log(`[STATE] Progress: ${state.progress}% | Stage: ${state.stage} | Status: ${state.status}`);
            if (state.status === 'done') {
              console.log('\n==================================================');
              console.log('✓ RENDER COMPLETED SUCCESSFULLY!');
              console.log('Outputs:', JSON.stringify(state.outputs, null, 2));
              console.log('==================================================\n');
              process.exit(0);
            } else if (state.status === 'error' || state.status === 'cancelled') {
              console.error('\n✗ Render error:', state.error);
              process.exit(1);
            }
          } catch (e) {}
        }
      } else if (block.startsWith('event: log')) {
        const dataLine = block.split('\n').find(l => l.startsWith('data: '));
        if (dataLine) {
          try {
            const logMsg = JSON.parse(dataLine.replace('data: ', ''));
            if (logMsg.includes('Scene') || logMsg.includes('assembled') || logMsg.includes('exported') || logMsg.includes('Done')) {
              console.log(`  ${logMsg}`);
            }
          } catch (e) {}
        }
      }
    }
  });
});

req.on('error', (err) => {
  console.error('SSE Error:', err.message);
});
