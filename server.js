const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');
const PORT = process.env.PORT || 3000, MAX = 12, rooms = new Map();
const page = path.join(__dirname, 'public', 'index.html');

const srv = http.createServer((req, res) => {
  if (req.url === '/healthz') return res.end('ok');
  fs.readFile(page, (e, b) => {
    if (e) { res.writeHead(500); return res.end('erro'); }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(b);
  });
});

const wss = new WebSocketServer({ server: srv, maxPayload: 64 * 1024 });
let seq = 0;
const list = r => [...r].map(([id, c]) => ({ id, p: c.p }));
function bcast(r) {
  const m = JSON.stringify({ t: 'peers', peers: list(r) });
  for (const c of r.values()) if (c.ws.readyState === 1) c.ws.send(m);
}

wss.on('connection', ws => {
  const id = Math.random().toString(36).slice(2, 10) + (++seq);
  let room = null, r = null;
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (m.t === 'join' && !r) {
      const n = String(m.room || '').toLowerCase().replace(/[^a-z0-9_.-]/g, '-').slice(0, 40) || 'geral';
      const x = rooms.get(n) || new Map();
      if (x.size >= MAX) { ws.send(JSON.stringify({ t: 'full' })); ws.close(); return; }
      r = x; room = n; rooms.set(n, r); r.set(id, { ws, p: {} });
      ws.send(JSON.stringify({ t: 'hello', id }));
      bcast(r);
    } else if (!r) return;
    else if (m.t === 'pres' && m.p) {
      const p = m.p;
      r.get(id).p = { name: String(p.name || 'Amigo').slice(0, 20), live: !!p.live, mic: p.mic | 0 };
      bcast(r);
    } else if (m.t === 'sig') {
      const c = r.get(m.to);
      if (c && c.ws.readyState === 1) c.ws.send(JSON.stringify({ t: 'sig', from: id, d: m.d }));
    }
  });
  ws.on('close', () => {
    if (!r) return;
    r.delete(id);
    if (r.size) bcast(r); else rooms.delete(room);
  });
});

setInterval(() => wss.clients.forEach(w => {
  if (!w.isAlive) return w.terminate();
  w.isAlive = false; w.ping();
}), 30000);

srv.listen(PORT, () => console.log('Telão rodando em http://localhost:' + PORT));
