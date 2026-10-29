import { createApp } from './app.js';
import { config, getConfigErrors } from './config/index.js';
import { getDatabase, closeDatabase } from './database/index.js';
import { runMigrations } from './database/migrator.js';
import { deactivateDemoAccounts, ensureAdminAccount } from './database/bootstrap.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    // 0. Refuse to start with insecure or data-losing configuration
    const configErrors = getConfigErrors();
    if (configErrors.length > 0) {
      for (const message of configErrors) {
        logger.fatal(message);
      }
      process.exit(1);
    }

    // 1. Initialize DB and apply migrations
    const db = getDatabase();
    runMigrations(db);

    // 2. Accounts: never leave published demo passwords live, never create an admin with a default password
    if (!config.seedDemoData) {
      await deactivateDemoAccounts(db);
    }
    await ensureAdminAccount(db);

    // 3. Seed an empty database: demo users + catalog outside production, catalog only in production
    const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses').get().count;
    if (courseCount === 0) {
      if (config.seedDemoData) {
        logger.info('Database courses table is empty; seeding demo users, courses and lessons...');
        const { seedDatabase } = await import('./database/seed.js');
        await seedDatabase(db);
      } else if (db.prepare("SELECT 1 FROM users WHERE role = 'admin' AND is_active = 1").get()) {
        logger.info('Database courses table is empty; seeding the course catalog (no demo accounts)...');
        const { seedNewCourses } = await import('./database/seedNewCourses.js');
        seedNewCourses(db);
      } else {
        logger.warn('Database courses table is empty and no admin exists; skipping catalog seed');
      }
    }

    // 4. Instantiate Express application
    const app = createApp();

    // 5. Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info({ port: config.port, env: config.env }, 'LearnSphere API server is running');
    });

    // 6. Graceful Shutdown Handlers
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
