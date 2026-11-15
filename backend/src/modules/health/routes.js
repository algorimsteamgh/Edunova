import { Router } from 'express';
import { getDatabase } from '../../database/index.js';

const router = Router();

router.get('/live', (_req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'learnsphere-api',
  });
});

router.get('/ready', async (_req, res) => {
  try {
    const db = getDatabase();
    const lastMigration = await db
      .prepare('SELECT version FROM schema_migrations ORDER BY applied_at DESC LIMIT 1')
      .get();

    res.status(200).json({
      status: 'READY',
      database: 'CONNECTED',
      lastMigration: lastMigration ? lastMigration.version : 'NONE',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'DOWN',
      database: 'UNREACHABLE',
      error: err.message,
    });
  }
});

export default router;
