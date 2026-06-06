const http = require('http');

/**
 * Minimal HTTP server for Fly.io health checks.
 * Discord bots don't serve traffic, but Fly needs a listening port.
 */
function startHealthServer(port = Number(process.env.PORT) || 8080) {
  const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, service: 'wgg-ticket-bot', uptime: process.uptime() }));
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

module.exports = { startHealthServer };
