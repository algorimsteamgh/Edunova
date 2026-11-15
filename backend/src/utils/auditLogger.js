import crypto from 'node:crypto';
import { getDatabase } from '../database/index.js';
import { logger } from './logger.js';

// Pass tx to write the audit row inside the caller's transaction.
export async function logAuditEvent(actorUserId, action, entityType, entityId, metadata = {}, tx = null) {
  try {
    const db = tx || getDatabase();
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const metadataStr = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);

    await db.prepare(`
      INSERT INTO audit_logs (id, actor_user_id, action, entity_type, entity_id, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, actorUserId || null, action, entityType, entityId, metadataStr, createdAt);

    logger.debug({ action, entityType, entityId, actorUserId }, 'Audit event recorded');
  } catch (err) {
    logger.error({ err, action, entityType, entityId }, 'Failed to write audit log record');
  }
}
