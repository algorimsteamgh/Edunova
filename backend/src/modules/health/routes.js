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

router.get('/ready', (_req, res) => {
  try {
    const db = getDatabase();
    const quickCheck = db.pragma('quick_check');
    const isDbOk = quickCheck.length === 1 && quickCheck[0].quick_check === 'ok';

    const lastMigration = db.prepare('SELECT version FROM schema_migrations ORDER BY applied_at DESC LIMIT 1').get();

    if (!isDbOk) {
      return res.status(503).json({
        status: 'DOWN',
        database: 'CORRUPTED',
        details: quickCheck,
      });
    }

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
