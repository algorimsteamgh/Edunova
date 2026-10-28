# LearnSphere — Learning Management System with Legacy Modernization, Database Migration, and GCP Deployment

[![CI](https://github.com/learnsphere/learnsphere/actions/workflows/ci.yml/badge.svg)](https://github.com/learnsphere/learnsphere/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js: v22 LTS](https://img.shields.io/badge/Node.js-v22%20LTS-green.svg)](https://nodejs.org/)
[![Database: SQLite WAL](https://img.shields.io/badge/Database-SQLite%203%20(WAL)-blue.svg)](https://sqlite.org/)

**LearnSphere** is an enterprise-grade, production-minded Learning Management System (LMS) built with React 19, Node.js v22, Express.js, and SQLite with Write-Ahead Logging (WAL). It demonstrates a complete modernization journey from an insecure, unmaintainable legacy monolith to a clean three-tier architecture featuring strict relational data integrity, role-based access control, an 8-step database migration pipeline, automated test suites, and Google Cloud Platform (GCP) deployment readiness.

> [!IMPORTANT]
> Zero AI dependencies and zero paid third-party APIs. All capabilities are implemented with pure production engineering principles.

---

## 1. System Architecture

```
learnsphere/
  frontend/          # React 19 SPA bootstrapped with Vite
    src/
      components/    # Reusable UI elements (ConfirmModal, YouTubePlayer, VideoModal)
      context/       # Centralized AuthContext & session handling
      layouts/       # AppLayout with sticky navigation & responsive footer
      pages/         # 15 views (Catalog, Details, CoursePlayer, Dashboard, Reports, etc.)
      services/      # Axios client with interceptors & endpoint bindings
  backend/           # Modular Express.js REST API
    src/
      config/        # Environment configurations & defaults
      database/      # SQLite singleton (WAL mode, FKs enabled, busy_timeout)
      middleware/    # Auth guards, role guards, Zod validators, rate limiters, error handling
      modules/       # Domain modules (auth, courses, lessons, enrollments, progress, admin)
      utils/         # Pino logger, RFC 7807 problem details, YouTube parser, audit logger
    migrations/      # Version-controlled SQL schema migrations (001, 002)
    tests/           # Vitest + Supertest integration & unit test suites
  legacy-app/        # Isolated reference legacy monolith with deliberate anti-patterns
    data/            # Synthetic dirty legacy SQLite database
    src/             # Insecure legacy server & database generator
  migration/         # Repeatable 8-Step Relational Migration Pipeline
    scripts/         # Migration runner (migrate.js) & benchmark runner (benchmark.js)
    reports/         # Machine-readable validation reports (JSON & Markdown)
    tests/           # Automated migration validation & recovery tests
  docs/              # Architectural specifications & operational runbooks
  docker-compose.yml # Container orchestration
```

---

## 2. YouTube Video Lessons & Course Player Architecture

LearnSphere integrates genuine, verified educational YouTube video lessons into individual courses with in-app embedded playback.

### 2.1 Key Capabilities:
- **Direct In-Catalog Video Playback**: Students can click "Watch Preview" directly in the Course Catalog and watch the embedded video inside an in-page modal without being redirected to YouTube or any external site.
- **Topic & Channel Segregation**: Curriculums and YouTube channels are segregated into distinct engineering topics:
  - **Web Development & React**: freeCodeCamp.org, Web Dev Simplified, Traversy Media
  - **Backend & Node.js**: freeCodeCamp.org, Web Dev Simplified, Dave Gray
  - **Database Engineering & SQL**: Hussein Nasser (Database Indexing, SQLite WAL), freeCodeCamp.org, Alex The Analyst
  - **Cloud Architecture & DevOps**: TechWorld with Nana (Docker, Kubernetes), Fireship (GCP Cloud Run)
  - **Distributed Systems & System Design**: ByteByteGo (Alex Xu), Hussein Nasser
  - **Computer Science & JavaScript**: Programming with Mosh, Web Dev Simplified
  - **Software Engineering & Clean Architecture**: Continuous Delivery (Dave Farley), ArjanCodes
- **Dedicated Learning Classroom (`/courses/:id/learn`)**:
  - Responsive 16:9 embedded player powered by `https://www.youtube-nocookie.com/embed/VIDEO_ID`
  - Sequential curriculum syllabus sidebar with active lesson highlight and completion checkmarks
  - Real-time lesson progress percentage and fraction calculation
  - "Mark as Completed" / "Mark as Incomplete" toggle with backend audit logging
  - Previous / Next lesson navigation controls
  - Fallback error state with direct YouTube link if client-side network or ad-blockers restrict iframe playback
- **Admin Video Lesson Management**:
  - Administrators can input YouTube URLs in all standard formats (`watch?v=`, `youtu.be/`, `shorts/`, `embed/`)
  - Server and client-side extraction and validation rejecting invalid domains and malformed IDs
  - Live embedded preview before publishing
  - Configurable duration, channel attribution, and free preview access flags
### 2.2 Seeded YouTube Educational Courses:
1. **Course 1: React.js Fundamentals & Modern Frontend Architecture (`c-react-01`)**
   - Lesson 1: Introduction to React & Project Setup (`bMknfKXIFA8` — freeCodeCamp.org) [Preview]
   - Lesson 2: Components and Props Architecture (`k32voqQhODc` — Programming with Mosh)
   - Lesson 3: State and React Hooks (useState & useEffect) (`O6P86uwfdR0` — Web Dev Simplified)
   - Lesson 4: Single-Page Navigation with React Router (`Ul3y1LXxzdU` — Web Dev Simplified)
   - Lesson 5: Building a Full-Featured React Project (`w7ejDZ8SWv8` — Traversy Media)
2. **Course 2: Node.js and Express.js Backend Architecture (`c-node-02`)**
   - Lesson 1: Introduction to Node.js & Architecture (`Oe421EPjeBE` — freeCodeCamp.org) [Preview]
   - Lesson 2: Express.js Fundamentals & Middleware (`SccSCuHhOw0` — Web Dev Simplified)
   - Lesson 3: REST API Development & Route Handling (`pKd0Rpw7O48` — freeCodeCamp.org)
   - Lesson 4: Authentication and Authorization with JWT (`mbsmsi7l3r4` — Web Dev Simplified)
   - Lesson 5: Enterprise Error Handling & Logging (`7H_QH9niggk` — Dave Gray)
3. **Course 3: SQL and Relational Database Engineering Fundamentals (`c-db-03`)**
   - Lesson 1: SQL Basics & Relational Modeling (`HXV3zeRR3h4` — freeCodeCamp.org) [Preview]
   - Lesson 2: SELECT, INSERT, UPDATE, and DELETE (`7S_tz1z_5bA` — Programming with Mosh)
   - Lesson 3: Joins, Normalization and Relationships (`9yeOJ0ZMUYw` — Alex The Analyst)
   - Lesson 4: Database Normalization (1NF to BCNF) (`GFQaEYEc8_8` — freeCodeCamp.org)
   - Lesson 5: B-Tree Indexes and Query Optimization (`clvir_bDDgk` — Hussein Nasser)
4. **Course 4: Modern JavaScript Deep Dive & ES Modules (`c-js-04`)**
   - Lesson 1: Variables, Types & Execution Context (`W6NZfCO5SIk` — Programming with Mosh) [Preview]
   - Lesson 2: Functions, Scope & Closures (`xUI5Tsl2Jyo` — freeCodeCamp.org)
   - Lesson 3: Arrays, Objects & Immutable Patterns (`R8rmfD9Y5-c` — Web Dev Simplified)
   - Lesson 4: Promises, Async/Await & Event Loop (`PoRJizFvM7s` — Fireship)
   - Lesson 5: ES Modules & Modern Project Tooling (`cRHQNNcYf6s` — Web Dev Simplified)

---

## 3. Default Test Credentials

`npm run seed` (and a fresh database in development) loads these demo accounts. **They never exist in production:** the demo seed refuses to run when `NODE_ENV=production` (unless `SEED_DEMO_DATA=true`), and on startup the server deactivates any account still using one of these passwords.

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Administrator** | `admin@learnsphere.io` | `AdminPass123!` | Full platform administration, course authoring, reports, user oversight |
| **Instructor** | `elena.rostova@learnsphere.io` | `TeacherPass123!` | Curriculum authoring, syllabus management |
| **Student (Alex)** | `alex.mercer@learnsphere.io` | `StudentPass123!` | Course catalog browsing, active enrollments, progress tracking |
| **Student (Maria)** | `maria.santos@learnsphere.io` | `StudentPass123!` | Completed curriculum with 100% verified progress milestone |

In production the first administrator comes from `ADMIN_EMAIL` and `ADMIN_PASSWORD` (12+ characters, upper, lower and digit), applied on startup when no active admin exists, or from `ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed:admin`. `JWT_SECRET` (32+ random characters) is mandatory; the server will not start without it.

---

## 3. Quickstart Guide (Local Development)

### 3.1 Prerequisites
- Node.js `v20+` or `v22 LTS` (`node -v`)
- npm `v10+` (`npm -v`)
- SQLite 3 (`sqlite3 --version`)

### 3.2 Install Dependencies
Install dependencies across backend, frontend, and migration packages:
```bash
npm run setup
```

### 3.3 Apply Migrations & Seed Baseline Data
```bash
# 1. Apply versioned schema migrations
npm run migrate

# 2. Seed realistic synthetic courses, lessons, and student enrollments
npm run seed

# 3. (Optional) Bootstrap or reset an administrator account via CLI
npm run seed:admin
```

### 3.4 Start Local Development Servers
In separate terminal tabs, or run concurrently:
```bash
# Start backend API (runs on port 5001)
npm run dev:backend

# Start frontend web app (runs on port 3000)
npm run dev:frontend
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to access LearnSphere.

---

## 4. Testing & Verification

LearnSphere includes 56 automated tests spanning unit logic, Supertest API integration, YouTube video lesson validation and playback verification, database transactions, migration integrity, and end-to-end workflows.

```bash
# Execute all backend and integration tests (52 tests across 8 suites)
npm run test:backend

# Execute migration pipeline and recovery tests (4 tests)
npm run test:migration

# Run all test suites (56 tests)
npm test
```

### Verified Test Scenarios:
1. **Student Registration & Login**: Validates password complexity, Bcrypt hashing, duplicate email rejection (HTTP 409), and JWT token claims.
2. **Admin-Only Course Authoring**: Verifies HTTP 201 for admins; HTTP 403 Forbidden for students and unauthenticated requests.
3. **Published Course Enrollment**: Enrolls students in published tracks; prevents enrollment in unpublished drafts.
4. **Duplicate Enrollment Prevention**: Handles concurrent and repeated enrollments safely using SQLite unique constraints.
5. **Progress Modification Authorization**: Prevents students from tampering with peer enrollments (HTTP 403).
6. **Cross-Course Safety Enforcement**: Prohibits recording progress for lessons belonging to unrelated courses (HTTP 400 `CROSS_COURSE_PROGRESS_FORGERY`).
7. **Deterministic Progress Calculation**: Accurately computes $0\%$, partial percentages, and $100\%$ completion milestones.
8. **Invalid Record Detection**: Migration pipeline quarantines dirty emails and orphaned lesson keys.
9. **Relational Preservation**: Preserves foreign keys; `PRAGMA foreign_key_check` returns 0 violations.
10. **Migration Idempotency**: Re-running migration produces 0 duplicate records.
11. **Rollback & Recovery**: Simulated database write failure triggers transactional rollback.
12. **Auditable Reporting Accuracy**: Aggregated completion CSV records match relational rows without leaking secrets.
13. **YouTube URL & Video ID Validation**: Normalizes `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, and `youtube.com/embed/` formats; validates 11-character regex; rejects invalid hostnames, malicious javascript URLs, and malformed identifiers with HTTP 400.
14. **Free Preview Bypass & Protected Content Guard**: Unenrolled students and guests can view free preview video lessons; non-preview lessons return HTTP 403 Forbidden until authenticated enrollment.
15. **In-App Embedded Playback & Zero External Redirects**: Verified that video preview and classroom players embed official `youtube-nocookie.com/embed/VIDEO_ID` with restrictive sandbox attributes without redirecting users out of the LMS.

---

## 5. Database Hygiene & Disaster Recovery

```bash
# Verify SQLite B-Tree disk and foreign key integrity
npm run db:integrity

# Create an atomic online SQLite backup image
npm run db:backup
```

---

## 6. The 8-Step Relational Migration Pipeline

To transform the legacy database into the normalized schema:
```bash
# Generate dirty legacy test database
npm --prefix legacy-app run seed

# Execute 8-step migration pipeline
npm --prefix migration run migrate

# Measure empirical performance comparison
node migration/scripts/benchmark.js
```
Migration reports are generated at:
- `migration/reports/migration_validation_report.json`
- `migration/reports/migration_validation_report.md`
- `docs/modernization-benchmark-results.md`

---

## 7. Docker & GCP Cloud Run Deployment

### 7.1 Docker Compose Local Orchestration
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5001/api/v1`
- Health Liveness: `http://localhost:5001/health/live`
- Health Readiness: `http://localhost:5001/health/ready`

### 7.2 Cloud Run Persistence Reality & Strategy
> [!CAUTION]
> Cloud Run instances use an ephemeral container filesystem that is destroyed on container restart or scale-down. Additionally, SQLite is a single-writer database that cannot be safely mounted across multiple autoscaling instances ($N > 1$).

For GCP deployment:
1. **Single-Instance Demo**: Deploy with `gcloud run deploy --max-instances=1` mounting Cloud Storage FUSE or a persistent disk volume.
2. **Production Enterprise Target**: Transition the database access layer (`backend/src/database/index.js` and repositories) to managed **Google Cloud SQL PostgreSQL**. LearnSphere's repository abstraction isolates all SQL queries, ensuring a seamless migration path.

Detailed GCP deployment architecture and instructions: **[docs/deployment-guide.md](docs/deployment-guide.md)**.

---

## 8. Documentation Index

- **[System Architecture](docs/architecture.md)**: 3-tier layout, concurrency model, WAL mode, domain rules.
- **[ER Diagram & Data Dictionary](docs/er-diagram.md)**: Complete database schema, constraints, cascading rules.
- **[Modernization Assessment](docs/modernization-assessment.md)**: Comparative analysis of legacy flaws vs. modern architecture.
- **[Migration Plan](docs/migration-plan.md)**: The 8-step data migration protocol and mapping specification.
- **[Security & Threat Model](docs/security.md)**: Password hashing, JWT strategy, RBAC, Zod sanitization, rate limiting.
- **[Testing Strategy](docs/testing-strategy.md)**: Testing pyramid and scenario matrix.
- **[GCP Deployment Guide](docs/deployment-guide.md)**: Cloud Run containerization and storage persistence decisions.
- **[Operations Runbook](docs/operations-runbook.md)**: Backup, restore, WAL checkpointing, and incident response playbooks.
- **[OpenAPI 3.0 Specification](docs/openapi.yaml)**: Comprehensive REST API contract.
