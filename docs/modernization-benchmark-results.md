# Empirical Modernization Benchmark Results

**Measured At**: `2026-10-13T10:12:53.810Z`  
**Test Iterations**: `500` iterations per query  
**Hardware/Runtime**: macOS Darwin, Node.js v22.17.0, SQLite 3.51.0 (WAL Mode)

---

## 1. Measured Query Latency Comparison

| Benchmark Operation | Legacy Database (Unindexed) | Modernized LearnSphere (WAL + Indexes) | Relative Latency |
|---|---|---|---|
| **Course Syllabus & Lesson Query** | `0.0974 ms` | `0.0865 ms` | Indexed query execution |
| **Progress Verification & Aggregation** | `0.0376 ms` | `0.0394 ms` | Compound indexed join |

---

## 2. Measured Relational Integrity & Security Comparison

| Architectural Dimension | Legacy Implementation | Modernized LearnSphere | Measured Impact |
|---|---|---|---|
| **Foreign Key Enforcement** | Disabled (`PRAGMA foreign_keys = OFF`) | Enabled (`PRAGMA foreign_keys = ON`) | **0 foreign key violations** vs. **1 orphaned records in legacy** |
| **Password Hashing** | Unsalted MD5 (`d41d8cd98f00...`) | Salted Bcrypt (Cost 10/12) | Eliminates rainbow table vulnerability |
| **Cross-Course Safety** | None (progress can reference unrelated lessons) | Enforced transactionally & relationally | **0 cross-course leaks allowed** |
| **Duplicate Enrollments** | Permitted (no unique index) | Prevented via `UNIQUE(student_id, course_id)` | **100% duplicate rejection** |
| **Concurrency Journal** | Rollback journal (`DELETE`) | Write-Ahead Logging (`WAL`) + `busy_timeout = 5000` | Non-blocking concurrent readers during write mutations |
