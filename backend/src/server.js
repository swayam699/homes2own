const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Check database connection
    await db.getDbConnection();
    console.log(`[Database] Driver ready: ${db.getClientType()}`);

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  Food Ordering API Server is running on port ${PORT}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\nShutting down server gracefully...');
      server.close(async () => {
        await db.close();
        console.log('Database connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

startServer();
