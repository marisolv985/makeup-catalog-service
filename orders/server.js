require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/database');
const { registerWithConsul, deregisterFromConsul } = require('./src/config/discovery');

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  await connectDB();
  await registerWithConsul();

  const server = app.listen(PORT, () => {
    console.log(`Orders Service corriendo en puerto ${PORT}`);
    console.log(`Documentación: http://localhost:${PORT}/api-docs`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} recibido. Apagando servidor...`);
    await deregisterFromConsul();
    server.close(() => {
      console.log('Servidor detenido.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
    shutdown('unhandledRejection');
  });
};

startServer();
