/**
 * Through – generic local bridge client (Node, no dependencies).
 * Any local app (our studio :4000, FlowKit-style :8100, plain script) can drive
 * the extension without coupling: the extension is the dumb executor, the caller
 * owns domain logic (video, research, upload, QA…).
 *
 * Usage:
 *   const { ThroughClient, bulkFromText } = require('./through-client');
 *   const t = new ThroughClient({ wsUrl: 'ws://127.0.0.1:9223' });
 *   await t.connect();
 *   const jobs = bulkFromText('prompt one\n\nprompt two', { siteId: 'flow', url: 'https://flow.google.com/' });
 *   const res = await t.startJobs(jobs);
 *
 * Server-side (example Express snippet — paste into ANY server, port is yours):
 *   const WebSocket = require('ws');
 *   const wss = new WebSocket.Server({ port: 9223 });
 *   // extension opens ws to YOU? No — engine.js uses chrome.runtime messaging for the
 *   // panel; for server-driven mode add a tiny native-host or ws relay here that
 *   // forwards THROUGH_START_JOBS via chrome.runtime.sendMessage. See README §Bridge.
 */

class ThroughClient {
  constructor({ wsUrl } = {}) {
    this.wsUrl = wsUrl || process.env.THROUGH_WS || 'ws://127.0.0.1:9223';
    this.ws = null;
    this.pending = new Map();
    this.seq = 0;
  }

  connect() {
    let WS;
    try { WS = require('ws'); } catch { throw new Error('npm i ws  (ThroughClient needs the ws package)'); }
    return new Promise((resolve, reject) => {
      this.ws = new WS(this.wsUrl);
      this.ws.on('open', () => resolve(true));
      this.ws.on('error', (e) => reject(e));
      this.ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(String(raw));
          if (msg.seq && this.pending.has(msg.seq)) {
            const { resolve: r } = this.pending.get(msg.seq);
            this.pending.delete(msg.seq);
            r(msg);
          }
          if (this.onEvent) this.onEvent(msg);
        } catch {}
      });
    });
  }

  send(type, data = {}) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== 1) return reject(new Error('ws-not-connected'));
      const seq = ++this.seq;
      this.pending.set(seq, { resolve });
      this.ws.send(JSON.stringify({ seq, type, ...data }));
      setTimeout(() => {
        if (this.pending.has(seq)) { this.pending.delete(seq); reject(new Error('bridge-timeout: ' + type)); }
      }, 30000);
    });
  }

  startJobs(jobs, options) { return this.send('THROUGH_START_JOBS', { jobs, options }); }
  enqueue(jobs) { return this.send('THROUGH_ENQUEUE', { jobs }); }
  stop() { return this.send('THROUGH_STOP'); }
  cont() { return this.send('THROUGH_CONTINUE'); }
  status() { return this.send('THROUGH_STATUS'); }
}

/** Split blank-line-separated bulk text into universal jobs (any payload type). */
function bulkFromText(text, { siteId = 'generic', url = '', actionBuilder } = {}) {
  const chunks = String(text).split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  return chunks.map((chunk, i) => ({
    id: `bulk-${Date.now()}-${i}`,
    label: chunk.split('\n')[0].slice(0, 80),
    siteId,
    url,
    actions: actionBuilder
      ? actionBuilder(chunk, i)
      : [{ op: 'fill', args: { selector: 'textarea', text: chunk } }],
    meta: { payload: chunk.slice(0, 2000) },
  }));
}

module.exports = { ThroughClient, bulkFromText };
