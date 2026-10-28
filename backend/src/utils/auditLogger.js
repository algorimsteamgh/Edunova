import crypto from 'node:crypto';
import { getDatabase } from '../database/index.js';
import { logger } from './logger.js';

export function logAuditEvent(actorUserId, action, entityType, entityId, metadata = {}) {
  try {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const metadataStr = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);

    db.prepare(`
      INSERT INTO audit_logs (id, actor_user_id, action, entity_type, entity_id, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, actorUserId || null, action, entityType, entityId, metadataStr, createdAt);

    logger.debug({ action, entityType, entityId, actorUserId }, 'Audit event recorded');
  } catch (err) {
    logger.error({ err, action, entityType, entityId }, 'Failed to write audit log record');
  }
}
