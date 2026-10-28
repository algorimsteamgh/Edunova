# LearnSphere Operations & Site Reliability Runbook

## 1. Routine Database Maintenance

SQLite in production requires systematic hygiene to maintain peak query performance and bounded disk usage.

### 1.1 Online Integrity Verification
To verify that no disk corruption or unreferenced B-Tree pages exist:
```bash
npm run db:integrity
# Underlying command:
sqlite3 /mnt/data/learnsphere.sqlite "PRAGMA integrity_check;"
# Expected output: ok
```

### 1.2 WAL Checkpointing
In high-throughput environments, the WAL file (`learnsphere.sqlite-wal`) can grow if long-running readers hold open transactions:
```bash
sqlite3 /mnt/data/learnsphere.sqlite "PRAGMA wal_checkpoint(TRUNCATE);"
```

### 1.3 Disk Space Optimization (`VACUUM`)
Defragment storage and reclaim unused pages after heavy deletions:
```bash
sqlite3 /mnt/data/learnsphere.sqlite "VACUUM;"
```

---

## 2. Backup & Disaster Recovery Procedures

### 2.1 Atomic Online Backup
Never copy an active SQLite database with `cp` while transactions may be writing, as this can produce torn pages. Always use the SQLite `.backup` command or the programmatic backup API:
```bash
npm run db:backup
# Executes:
# sqlite3 /mnt/data/learnsphere.sqlite ".backup '/mnt/backups/backup_$(date +%Y%m%d_%H%M%S).sqlite'"
```

### 2.2 Point-In-Time Restoration Procedure
1. Stop the application container / service to sever all active connections:
   ```bash
   docker compose stop backend
   ```
2. Archive the current damaged database file for forensic audit:
   ```bash
   mv /mnt/data/learnsphere.sqlite /mnt/data/learnsphere.sqlite.corrupt_$(date +%s)
   ```
3. Copy the verified backup image into position:
   ```bash
   cp /mnt/backups/backup_20261013_120000.sqlite /mnt/data/learnsphere.sqlite
   ```
4. Verify relational integrity of the restored image:
   ```bash
   sqlite3 /mnt/data/learnsphere.sqlite "PRAGMA integrity_check; PRAGMA foreign_key_check;"
   ```
5. Restart the backend container and monitor health endpoints:
   ```bash
   docker compose start backend
   curl http://localhost:5000/health/ready
   ```

---

## 3. Incident Response Playbooks

### Playbook 1: High `SQLITE_BUSY` Error Rate
- **Symptom**: Logs show multiple HTTP 500 or 503 errors with `SqliteError: database is locked`.
- **Root Cause**: A long-running write transaction or concurrent processes writing to the SQLite file exceeding `busy_timeout`.
- **Immediate Mitigation**:
  1. Check for zombie Node processes: `ps aux | grep node`.
  2. Ensure WAL mode is active: `sqlite3 /mnt/data/learnsphere.sqlite "PRAGMA journal_mode;"` (must return `wal`).
  3. Increase busy timeout in backend config: `DATABASE_BUSY_TIMEOUT=10000`.
  4. Ensure Cloud Run instance count is constrained to `max-instances: 1` if using a single file mount.

### Playbook 2: Schema Migration Incomplete or Stuck
- **Symptom**: Backend startup fails with `MigrationFailedError`.
- **Mitigation**:
  1. Inspect `schema_migrations` table:
     ```bash
     sqlite3 /mnt/data/learnsphere.sqlite "SELECT * FROM schema_migrations ORDER BY applied_at DESC;"
     ```
  2. Because all LearnSphere migrations run inside atomic transactions, a failed migration automatically rolls back cleanly without leaving partial tables.
  3. Correct the SQL script syntax error in `backend/migrations/` and restart the service.
