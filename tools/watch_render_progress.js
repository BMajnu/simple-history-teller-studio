async function watch() {
  while (true) {
    try {
      const res = await fetch('http://127.0.0.1:4000/api/project/sample_first_king');
      const data = await res.json();
      const job = data.job;
      if (!job) {
        console.log('No active job found.');
        break;
      }
      console.log(`[${new Date().toLocaleTimeString()}] Progress: ${job.progress}% | Stage: ${job.stage} | Status: ${job.status}`);
      if (job.status === 'done') {
        console.log('\n=============================================');
        console.log('🎉 RENDER COMPLETE!');
        console.log('Outputs:', JSON.stringify(job.outputs, null, 2));
        console.log('=============================================\n');
        break;
      }
      if (job.status === 'error' || job.status === 'cancelled') {
        console.error('Job ended with error:', job.error);
        break;
      }
    } catch (e) {
      console.error('Fetch error:', e.message);
    }
    await new Promise(r => setTimeout(r, 6000));
  }
}
watch();
