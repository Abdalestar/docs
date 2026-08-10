// Loopback TLS bridge for this sandbox only.
// Chromium's ClientHello is reset by the egress gateway for some hosts, while
// Node's is accepted. This terminates the browser's TLS on loopback and re-opens
// a *verified* TLS connection upstream through the agent proxy (HTTPS_PROXY),
// so certificate verification is still enforced on the real network hop.
import net from 'net';
import tls from 'tls';
import http from 'http';
import fs from 'fs';

const CERT_DIR = process.env.BRIDGE_CERT_DIR;
const LISTEN = Number(process.env.BRIDGE_PORT || 38443);
const [PHOST, PPORT] = (process.env.HTTPS_PROXY || 'http://127.0.0.1:36695')
  .replace(/^https?:\/\//, '').split(':');

const secure = {
  key: fs.readFileSync(`${CERT_DIR}/key.pem`),
  cert: fs.readFileSync(`${CERT_DIR}/cert.pem`),
  ALPNProtocols: ['http/1.1'],
};

function upstream(host, port) {
  return new Promise((resolve, reject) => {
    const s = net.connect(Number(PPORT), PHOST, () =>
      s.write(`CONNECT ${host}:${port} HTTP/1.1\r\nHost: ${host}:${port}\r\n\r\n`));
    let buf = '';
    const onData = (d) => {
      buf += d.toString('latin1');
      if (!buf.includes('\r\n\r\n')) return;
      s.removeListener('data', onData);
      const status = buf.split(' ')[1];
      if (status !== '200') return reject(new Error('proxy CONNECT ' + status));
      const t = tls.connect(
        { socket: s, servername: host, ALPNProtocols: ['http/1.1'] },
        () => resolve(t));
      t.on('error', reject);
    };
    s.on('data', onData);
    s.on('error', reject);
  });
}

const srv = http.createServer((q, r) => { r.writeHead(405); r.end(); });
srv.on('connect', async (req, sock, head) => {
  const [host, port = '443'] = req.url.split(':');
  sock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
  let up;
  for (let attempt = 1; attempt <= 3 && !up; attempt++) {
    try {
      up = await upstream(host, port);
    } catch (e) {
      if (attempt === 3) {
        console.error('[bridge] upstream failed', host, e.message);
        sock.destroy();
        return;
      }
      await new Promise((r) => setTimeout(r, 250 * attempt));
    }
  }
  const down = new tls.TLSSocket(sock, { isServer: true, ...secure });
  if (head && head.length) down.push(head);
  down.on('error', () => { up.destroy(); });
  up.on('error', () => { down.destroy(); });
  down.pipe(up);
  up.pipe(down);
});
srv.listen(LISTEN, '127.0.0.1', () => console.log('[bridge] listening on', LISTEN));
