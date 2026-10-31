const os = require('node:os');
const config = require('./config');
const { openDatabase } = require('./db');
const { createApp } = require('./app');

const db = openDatabase(config.dbPath);
const app = createApp({ db, config });

// Express 5 passes listen errors (like a busy port) to this callback.
const server = app.listen(config.port, config.host, (err) => {
  if (err) {
    const reason = err.code === 'EADDRINUSE'
      ? `Port ${config.port} is already in use. Stop the other server, or start this one with PORT=${config.port + 1}.`
      : err.message;
    console.error(`Halal Finder API could not start: ${reason}`);
    db.close();
    process.exit(1);
  }
  const lan = Object.values(os.networkInterfaces()).flat()
    .find((i) => i && i.family === 'IPv4' && !i.internal)?.address;
  console.log(`Halal Finder API running at http://localhost:${config.port}`);
  if (lan) console.log(`On your network:            http://${lan}:${config.port}`);
});

const shutdown = () => server.close(() => { db.close(); process.exit(0); });
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
