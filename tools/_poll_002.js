const http = require('http');
const fs = require('fs');
const ID = 'simple_itihash_002_first_language';
const OUT = __dirname + '\\_render_state.json';
function poll() {
  http.get(`http://localhost:4000/api/project/${ID}/render-status`, (res) => {
    let buf = '';
    res.on('data', (d) => {
      buf += d.toString();
      let i;
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const chunk = buf.slice(0, i);
        buf = buf.slice(i + 2);
        const dm = chunk.match(/^data: (.*)$/m);
        if (dm) {
          try { fs.writeFileSync(OUT, dm[1]); } catch {}
          try {
            const st = JSON.parse(dm[1]);
            if (['done', 'error', 'cancelled'].includes(st.status)) process.exit(0);
          } catch {}
        }
      }
    });
    res.on('error', () => { setTimeout(poll, 4000); });
  }).on('error', () => setTimeout(poll, 4000));
}
poll();
