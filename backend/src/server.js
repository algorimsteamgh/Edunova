import { createApp } from './app.js';
import { config } from './config/index.js';
import { getDatabase, closeDatabase } from './database/index.js';
import { runMigrations } from './database/migrator.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    // 1. Initialize DB and apply migrations
    const db = getDatabase();
    runMigrations(db);

    // Auto-seed initial catalog and courses if starting with empty database (e.g. fresh Cloud Run container)
    const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;
    if (courseCount === 0) {
      logger.info('Database courses table is empty; auto-seeding courses, topics, and lessons...');
      const { seedDatabase } = await import('./database/seed.js');
      await seedDatabase(db);
    }

    // 2. Instantiate Express application
    const app = createApp();

    // 3. Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info({ port: config.port, env: config.env }, 'LearnSphere API server is running');
    });

    // 4. Graceful Shutdown Handlers
    const shutdown = (signal) => {
      logger.info({ signal }, 'Termination signal received; shutting down gracefully');
      server.close(() => {
        logger.info('HTTP server closed');
        closeDatabase();
        process.exit(0);
      });

      // Force exit if hanging
      setTimeout(() => {
        logger.error('Graceful shutdown timed out; forcing process termination');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.fatal({ err }, 'Failed to initialize LearnSphere backend');
    process.exit(1);
  }
}

startServer();
