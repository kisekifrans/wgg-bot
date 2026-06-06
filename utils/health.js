const http = require('http');

let status = { ok: true, message: 'starting', uptime: 0 };

/**
 * @param {boolean} ok
 * @param {string} message
 */
function setHealthStatus(ok, message) {
  status = { ok, message, uptime: process.uptime() };
}

/**
 * Minimal HTTP server for Fly.io health checks.
 * Starts immediately so Fly doesn't timeout before the bot finishes booting.
 */
function startHealthServer(port = Number(process.env.PORT) || 8080) {
  const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
      const body = {
        ok: status.ok,
        service: 'wgg-ticket-bot',
        message: status.message,
        uptime: process.uptime(),
      };
      res.writeHead(status.ok ? 200 : 503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(body));
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`💓 Health server listening on :${port}`);
  });

  return server;
}

module.exports = { startHealthServer, setHealthStatus };
