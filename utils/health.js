const http = require('http');

let status = { ready: false, message: 'starting' };

/**
 * @param {boolean} ready
 * @param {string} message
 */
function setHealthStatus(ready, message) {
  status = { ready, message };
}

/**
 * Fly.io liveness probe — always return 200 so the machine stays up while booting.
 * Use /ready for actual readiness (bot connected).
 */
function startHealthServer(port = Number(process.env.PORT) || 8080) {
  const server = http.createServer((req, res) => {
    const body = {
      service: 'wgg-ticket-bot',
      message: status.message,
      ready: status.ready,
      uptime: process.uptime(),
    };

    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, ...body }));
      return;
    }

    if (req.url === '/ready') {
      res.writeHead(status.ready ? 200 : 503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: status.ready, ...body }));
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`💓 Health server listening on :${port}`);
  });

  server.on('error', (error) => {
    console.error('Health server error:', error);
  });

  return server;
}

module.exports = { startHealthServer, setHealthStatus };
