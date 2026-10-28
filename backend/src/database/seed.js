import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { getDatabase } from './index.js';
import { runMigrations } from './migrator.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import { normalizeYouTubeUrl } from '../utils/youtube.js';
import { seedNewCourses } from './seedNewCourses.js';

export async function seedDatabase(customDb = null) {
  // Wipes enrollments, progress and audit logs and creates accounts with published passwords.
  if (!config.seedDemoData) {
    throw new Error('Demo seeding is disabled in production; set SEED_DEMO_DATA=true only for a throwaway demo database.');
  }

  const db = customDb || getDatabase();

  // Run migrations first to ensure schema and video columns exist
  runMigrations(db);

  logger.info('Seeding database with verified educational courses and YouTube video lessons');

  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', saltRounds);
  const instructorPasswordHash = await bcrypt.hash('TeacherPass123!', saltRounds);
  const studentPasswordHash = await bcrypt.hash('StudentPass123!', saltRounds);

  const now = new Date().toISOString();

  const users = {
    admin: 'u-admin-01',
    instructor: 'u-inst-01',
    student1: 'u-stud-01',
    student2: 'u-stud-02',
    student3: 'u-stud-03',
  };

  const seedTransaction = db.transaction(() => {
    // Clean up in reverse foreign-key order
    db.prepare('DELETE FROM audit_logs').run();
    db.prepare('DELETE FROM lesson_progress').run();
    db.prepare('DELETE FROM enrollments').run();
    db.prepare('DELETE FROM lessons').run();
    db.prepare('DELETE FROM courses').run();
    // ponytail: delete only synthetic seed users to preserve registered students on re-seed. Upgrade path: seed migration versioning table.
    db.prepare("DELETE FROM users WHERE id IN ('u-admin-01', 'u-inst-01', 'u-stud-01', 'u-stud-02', 'u-stud-03')").run();

    // 1. Seed Users
    const insertUser = db.prepare(`
      INSERT INTO users (id, full_name, email, password_hash, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        password_hash = excluded.password_hash,
        updated_at = excluded.updated_at
    `);

    insertUser.run(users.admin, 'System Administrator', 'admin@learnsphere.io', adminPasswordHash, 'admin', 1, now, now);
    insertUser.run(users.instructor, 'Prof. Elena Rostova', 'elena.rostova@learnsphere.io', instructorPasswordHash, 'admin', 1, now, now);
    insertUser.run(users.student1, 'Alex Mercer', 'alex.mercer@learnsphere.io', studentPasswordHash, 'student', 1, now, now);
    insertUser.run(users.student2, 'Maria Santos', 'maria.santos@learnsphere.io', studentPasswordHash, 'student', 1, now, now);
    insertUser.run(users.student3, 'David Kim', 'david.kim@learnsphere.io', studentPasswordHash, 'student', 1, now, now);

    // 2. Seed Courses
    const insertCourse = db.prepare(`
      INSERT INTO courses (
        id, title, description, category, instructor_id,
        thumbnail_url, status, estimated_duration, preview_video_id,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const courses = {
      c_react: 'c-react-01',
      c_node: 'c-node-02',
      c_db: 'c-db-03',
      c_js: 'c-js-04',
      c_cloud: 'c-cloud-05',
      c_arch: 'c-arch-06',
      c_legacy: 'c-legacy-07',
    };

    insertCourse.run(
      courses.c_react,
      'React.js Fundamentals & Modern Frontend Architecture',
      'Master the modern React 19 ecosystem from the ground up: components, props, hooks, custom state management, React Router 7, and building scalable reactive single-page applications.',
      'Web Development',
      users.instructor,
      '/images/course-fullstack.jpg',
      'published',
      '4.5 hours',
      'bMknfKXIFA8',
      now,
      now
    );

    insertCourse.run(
      courses.c_node,
      'Node.js and Express.js Backend Architecture',
      'Build enterprise-grade server-side applications and RESTful APIs using Node.js event-driven runtime, Express middleware pipelines, JWT auth, and centralized error handling.',
      'Backend Engineering',
      users.instructor,
      '/images/course-systems.jpg',
      'published',
      '3.8 hours',
      'Oe421EPjeBE',
      now,
      now
    );

    insertCourse.run(
      courses.c_db,
      'SQL and Relational Database Engineering Fundamentals',
      'Deep dive into relational modeling, Boyce-Codd normal forms, ACID transactions, complex multi-table joins, B-Tree indexes, and SQLite WAL concurrency.',
      'Database Engineering',
      users.instructor,
      '/images/course-database.jpg',
      'published',
      '4.2 hours',
      'HXV3zeRR3h4',
      now,
      now
    );

    insertCourse.run(
      courses.c_js,
      'Modern JavaScript Deep Dive & ES Modules',
      'Understand core JavaScript mechanics from memory allocation, execution contexts, and closures to asynchronous Promises, Event Loop, and modular ES architectures.',
      'Computer Science',
      users.admin,
      '/images/course-fullstack.jpg',
      'published',
      '3.2 hours',
      'W6NZfCO5SIk',
      now,
      now
    );

    insertCourse.run(
      courses.c_cloud,
      'Cloud Native Systems & GCP Cloud Run Deployment',
      'Containerize enterprise services with Docker multi-stage builds, understand ephemeral filesystems, configure secret managers, and automate CI/CD.',
      'Cloud Architecture',
      users.admin,
      '/images/course-cloud.jpg',
      'published',
      '2.5 hours',
      'pg19Z8LL06w',
      now,
      now
    );

    insertCourse.run(
      courses.c_arch,
      'High-Concurrency Distributed Systems & Event Streaming',
      'Advanced distributed locking, message queues with Kafka, idempotent workers, and microservices decomposition.',
      'Systems Architecture',
      users.instructor,
      '/images/course-systems.jpg',
      'published',
      '3.0 hours',
      'i53Gi_K3o7I',
      now,
      now
    );

    insertCourse.run(
      courses.c_legacy,
      'Legacy Codebase Modernization & Refactoring Patterns',
      'Tactical migration patterns for unravelling monolithic spaghetti code and implementing modular boundary contracts.',
      'Software Engineering',
      users.admin,
      '/images/course-refactor.jpg',
      'published',
      '2.0 hours',
      'GBTdnxk5cHM',
      now,
      now
    );

    // 3. Seed Lessons with verified YouTube videos
    const insertLesson = db.prepare(`
      INSERT INTO lessons (
        id, course_id, title, content, position, status,
        video_id, video_url, duration, description, channel_name, is_preview,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Course 1: React.js Fundamentals (5 lessons)
    insertLesson.run(
      'l-react-01',
      courses.c_react,
      '1. Introduction to React & Project Setup',
      '# Introduction to React\n\nIn this foundational lesson, explore the virtual DOM, JSX syntax, and establishing your project scaffolding with modern tooling.\n\n### Key Takeaways:\n- Declarative vs imperative UI paradigms\n- Component-driven development workflow\n- Fast feedback loops with Hot Module Replacement',
      1,
      'published',
      'bMknfKXIFA8',
      normalizeYouTubeUrl('bMknfKXIFA8'),
      '42:15',
      'Overview of React architecture, virtual DOM mechanics, and rapid setup.',
      'freeCodeCamp.org',
      1,
      now,
      now
    );

    insertLesson.run(
      'l-react-02',
      courses.c_react,
      '2. Components and Props Architecture',
      '# Components and Props\n\nMaster component decomposition, unidirectional data flow, TypeScript interfaces, and reusable presentation elements.\n\n### Core Rules:\n- Props are read-only and immutable\n- Pure functions for deterministic render cycles',
      2,
      'published',
      'k32voqQhODc',
      normalizeYouTubeUrl('k32voqQhODc'),
      '28:40',
      'Learn how to break complex user interfaces into composable, testable components with props.',
      'Programming with Mosh',
      0,
      now,
      now
    );

    insertLesson.run(
      'l-react-03',
      courses.c_react,
      '3. State and React Hooks (useState & useEffect)',
      '# State and Hooks in Depth\n\nUnderstand state synchronization, reactive state updates, effect dependencies, and cleanup functions to avoid memory leaks.',
      3,
      'published',
      'O6P86uwfdR0',
      normalizeYouTubeUrl('O6P86uwfdR0'),
      '35:10',
      'Deep dive into useState, useEffect, and reactive re-renders in modern React.',
      'Web Dev Simplified',
      0,
      now,
      now
    );

    insertLesson.run(
      'l-react-04',
      courses.c_react,
      '4. Single-Page Navigation with React Router',
      '# React Router 7 Architecture\n\nConstruct seamless single-page application routes, nested layouts, protected route guards, and dynamic URL parameters.',
      4,
      'published',
      'Ul3y1LXxzdU',
      normalizeYouTubeUrl('Ul3y1LXxzdU'),
      '38:22',
      'Master client-side routing, query parameters, dynamic segments, and navigation guards.',
      'Web Dev Simplified',
      0,
      now,
      now
    );

    insertLesson.run(
      'l-react-05',
      courses.c_react,
      '5. Building a Full-Featured React Project',
      '# End-to-End React Project Construction\n\nAssemble a production-grade application integrating state management, API synchronization, error boundaries, and accessible styling.',
      5,
      'published',
      'w7ejDZ8SWv8',
      normalizeYouTubeUrl('w7ejDZ8SWv8'),
      '1:48:30',
      'Step-by-step construction of a comprehensive React application ready for production.',
      'Traversy Media',
      0,
      now,
      now
    );

    // Course 2: Node.js and Express.js (5 lessons)
    insertLesson.run(
      'l-node-01',
      courses.c_node,
      '1. Introduction to Node.js & V8 Event Loop',
      '# Node.js Architecture\n\nUnderstand the libuv asynchronous event loop, non-blocking I/O threads, and native Node.js ES modules.',
      1,
      'published',
      'Oe421EPjeBE',
      normalizeYouTubeUrl('Oe421EPjeBE'),
      '45:00',
      'Foundational mechanics of Node.js, event loops, call stacks, and buffer processing.',
      'freeCodeCamp.org',
      1,
      now,
      now
    );

    insertLesson.run(
      'l-node-02',
      courses.c_node,
      '2. Express.js Fundamentals & Middleware Pipeline',
      '# Express.js Core Concepts\n\nLearn how Express processes HTTP requests through sequentially composed middleware chains.',
      2,
      'published',
      'SccSCuHhOw0',
      normalizeYouTubeUrl('SccSCuHhOw0'),
      '34:15',
      'Route handlers, middleware composition, request parsing, and response serialization.',
      'Web Dev Simplified',
      0,
      now,
      now
    );

    insertLesson.run(
      'l-node-03',
      courses.c_node,
      '3. REST API Development & Layered Architecture',
      '# Building RESTful API Endpoints\n\nConstruct RESTful controllers, services, and repositories separating HTTP concerns from domain business logic.',
      3,
      'published',
      'pKd0Rpw7O48',
      normalizeYouTubeUrl('pKd0Rpw7O48'),
      '52:10',
      'Architecting clean RESTful controllers, input validation schemas, and HTTP status handling.',
      'Traversy Media',
      0,
      now,
      now
    );

    insertLesson.run(
      'l-node-04',
      courses.c_node,
      '4. Authentication, Hashing & JWT Protocols',
      '# Secure Authentication in Express\n\nImplement Bcrypt password salt rounds, stateless JSON Web Tokens, and bearer token verification middleware.',
      4,
      'published',
      'mbsmsi7l3r4',
      normalizeYouTubeUrl('mbsmsi7l3r4'),
      '26:45',
      'Implementing JSON Web Token signing, payload validation, and route authentication guards.',
      'Web Dev Simplified',
      0,
      now,
      now
    );

    insertLesson.run(
      'l-node-05',
      courses.c_node,
      '5. Centralized Error Handling & Production Robustness',
      '# Production Error Handling Patterns\n\nEstablish standard error classes, async catch wrappers, audit logging, and resilient crash prevention.',
      5,
      'published',
      '7H_QH9niggk',
      normalizeYouTubeUrl('7H_QH9niggk'),
      '31:20',
      'Comprehensive error handling middleware, custom error classes, and server stability.',
      'Dave Gray',
      0,
      now,
      now
    );

    // Course 3: SQL and Database Fundamentals (5 lessons)
    insertLesson.run(
      'l-db-01',
      courses.c_db,
      '1. SQL Basics & Relational Modeling',
      '# SQL Fundamentals\n\nLearn relational database foundations: tables, primary keys, foreign keys, and DDL schema definitions.',
      1,
      'published',
      'HXV3zeRR3h4',
      normalizeYouTubeUrl('HXV3zeRR3h4'),
      '1:15:00',
      'Complete beginner guide to SQL relational tables, constraints, and data definitions.',
      'freeCodeCamp.org',
      1,
      now,
      now
    );

    insertLesson.run(
      'l-db-02',
      courses.c_db,
      '2. SELECT, INSERT, UPDATE, and DELETE Operations',
      '# CRUD Operations in SQL\n\nExecute safe parameterized queries, filtering with WHERE, ordering, pagination, and atomic updates.',
      2,
      'published',
      '7S_tz1z_5bA',
      normalizeYouTubeUrl('7S_tz1z_5bA'),
      '41:30',
      'Master data manipulation language (DML) with real-world query scenarios.',
      'Programming with Mosh',
      0,
      now,
      now
    );

    insertLesson.run(
      'l-db-03',
      courses.c_db,
      '3. Joins, Foreign Keys & Entity Relationships',
      '# Relational Joins Explained\n\nUnderstand INNER JOIN, LEFT JOIN, FULL OUTER JOIN, and enforcing referential integrity with foreign key cascades.',
      3,
      'published',
      '9yeOJ0ZMUYw',
      normalizeYouTubeUrl('9yeOJ0ZMUYw'),
      '24:50',
      'Visual breakdown of joins, cardinality (one-to-many, many-to-many), and foreign keys.',
      'Alex The Analyst',
      0,
      now,
      now
    );

    insertLesson.run(
      'l-db-04',
      courses.c_db,
      '4. Database Normalization (1NF, 2NF, 3NF, BCNF)',
      '# Normalization Theory & Practice\n\nEliminate data anomalies, redundancy, and update conflicts through Boyce-Codd Normal Form design.',
      4,
      'published',
      'GFQaEYEc8_8',
      normalizeYouTubeUrl('GFQaEYEc8_8'),
      '29:15',
      'Clear, accessible explanation of database normalization rules and practical trade-offs.',
      'Decomplexify',
      0,
      now,
      now
    );

    insertLesson.run(
      'l-db-05',
      courses.c_db,
      '5. Indexes, B-Trees & Query Optimization',
      '# Database Internals: Indexing\n\nUnderstand clustered vs non-clustered indexes, B-Tree lookup mechanics, and optimizing slow SQL queries.',
      5,
      'published',
      'clvir_bDDgk',
      normalizeYouTubeUrl('clvir_bDDgk'),
      '48:25',
      'Master database indexing internals, B-Tree lookups, and query performance tuning.',
      'Hussein Nasser',
      0,
      now,
      now
    );

    // Course 4: JavaScript Fundamentals (5 lessons)
    insertLesson.run(
      'l-js-01',
      courses.c_js,
      '1. Variables, Data Types, and Memory Model',
      '# JavaScript Core Mechanics\n\nPrimitives vs reference types, call stack allocation, heap memory, and variable declarations with let/const.',
      1,
      'published',
      'W6NZfCO5SIk',
      normalizeYouTubeUrl('W6NZfCO5SIk'),
      '48:00',
      'Comprehensive walkthrough of JavaScript primitive types, reference semantics, and operators.',
      'Programming with Mosh',
      1,
      now,
      now
    );

    insertLesson.run(
      'l-js-02',
      courses.c_js,
      '2. Functions, Scope, and Closures',
      '# Closures and Lexical Scope\n\nMaster lexical scoping, function factories, private variables, and memory retention in JavaScript closures.',
      2,
      'published',
      'xUI5Tsl2Jyo',
      normalizeYouTubeUrl('xUI5Tsl2Jyo'),
      '22:15',
      'In-depth tutorial explaining closures, execution environments, and variable scoping.',
      'Web Dev Simplified',
      0,
      now,
      now
    );

    insertLesson.run(
      'l-js-03',
      courses.c_js,
      '3. Arrays, Objects, and Destructuring',
      '# Modern Data Structures in JS\n\nArray manipulation methods (map, filter, reduce), object destructuring, spread syntax, and immutability.',
      3,
      'published',
      'R8rmfD9Y5-c',
      normalizeYouTubeUrl('R8rmfD9Y5-c'),
      '38:40',
      'Practical patterns for arrays, object manipulation, rest parameters, and shallow copying.',
      'freeCodeCamp.org',
      0,
      now,
      now
    );

    insertLesson.run(
      'l-js-04',
      courses.c_js,
      '4. Promises, Async/Await, and the Event Loop',
      '# Asynchronous JavaScript Mastery\n\nUnderstand Promise lifecycles, microtask queue priorities, error handling with try/catch, and async/await syntax.',
      4,
      'published',
      'PoRJizFvM7s',
      normalizeYouTubeUrl('PoRJizFvM7s'),
      '25:30',
      'Understand the event loop, microtask queues, and writing clean asynchronous code.',
      'Web Dev Simplified',
      0,
      now,
      now
    );

    insertLesson.run(
      'l-js-05',
      courses.c_js,
      '5. Native ES Modules & Modern Build Tooling',
      '# Modular JavaScript Architecture\n\nExport/import patterns, tree-shaking, static analysis, circular dependency resolution, and browser bundling.',
      5,
      'published',
      'cRHQNNcYf6s',
      normalizeYouTubeUrl('cRHQNNcYf6s'),
      '18:45',
      'Modern modular code organization using ES6 import/export and bundler workflows.',
      'Web Dev Simplified',
      0,
      now,
      now
    );

    // Course 5: Cloud Native Systems
    insertLesson.run(
      'l-cloud-01',
      courses.c_cloud,
      '1. Docker Multi-Stage Containerization',
      '# Containerizing Node.js and React\n\nLearn how multi-stage Docker builds minimize container image footprints from 1GB down to 120MB.',
      1,
      'published',
      'pg19Z8LL06w',
      normalizeYouTubeUrl('pg19Z8LL06w'),
      '1:12:00',
      'Comprehensive guide to Docker containers, images, volumes, and multi-stage builds.',
      'TechWorld with Nana',
      1,
      now,
      now
    );

    insertLesson.run(
      'l-cloud-02',
      courses.c_cloud,
      '2. Deploying to Google Cloud Run and Persistence Decisions',
      '# Cloud Run Persistence Engineering\n\nUnderstand why Cloud Run ephemeral storage cannot host a persistent database and how to integrate managed Cloud SQL.',
      2,
      'published',
      'kGbvhK_aWz0',
      normalizeYouTubeUrl('kGbvhK_aWz0'),
      '24:10',
      'Deploying containerized microservices to Google Cloud Run with serverless scaling.',
      'Fireship',
      0,
      now,
      now
    );

    insertLesson.run(
      'l-cloud-03',
      courses.c_cloud,
      '3. Kubernetes Core Architecture & Pod Orchestration',
      '# Kubernetes Fundamentals\n\nCluster architecture, master nodes, worker nodes, pods, services, ingress, and deployment manifests.',
      3,
      'published',
      'X48VuDVv0do',
      normalizeYouTubeUrl('X48VuDVv0do'),
      '55:30',
      'Understand Kubernetes pods, services, deployments, and cluster management.',
      'TechWorld with Nana',
      0,
      now,
      now
    );

    // Course 6: Distributed Systems
    insertLesson.run(
      'l-arch-01',
      courses.c_arch,
      '1. Distributed Systems & System Design Fundamentals',
      '# System Design Essentials\n\nHorizontal vs vertical scaling, load balancing algorithms, CAP theorem, and distributed consistency models.',
      1,
      'published',
      'i53Gi_K3o7I',
      normalizeYouTubeUrl('i53Gi_K3o7I'),
      '36:20',
      'Foundational concepts for large-scale distributed system architectures.',
      'ByteByteGo',
      1,
      now,
      now
    );

    insertLesson.run(
      'l-arch-02',
      courses.c_arch,
      '2. Event Streaming with Apache Kafka',
      '# Event-Driven Architecture\n\nKafka topics, partitions, producer acknowledgments, consumer groups, and offset management.',
      2,
      'published',
      'R873BlNVUB4',
      normalizeYouTubeUrl('R873BlNVUB4'),
      '28:45',
      'How Kafka enables distributed pub/sub event streaming at scale.',
      'ByteByteGo',
      0,
      now,
      now
    );

    insertLesson.run(
      'l-arch-03',
      courses.c_arch,
      '3. Distributed Caching & Redis at Scale',
      '# Caching Strategies\n\nCache-aside, write-through, cache stampede prevention, eviction policies (LRU/LFU), and distributed Redis replication.',
      3,
      'published',
      'jgpVd__PBf4',
      normalizeYouTubeUrl('jgpVd__PBf4'),
      '22:15',
      'Scaling application throughput with distributed in-memory caching.',
      'ByteByteGo',
      0,
      now,
      now
    );

    // Course 7: Legacy Modernization
    insertLesson.run(
      'l-legacy-01',
      courses.c_legacy,
      '1. Tactical Monolith Decomposition & Clean Architecture',
      '# Modernizing Monoliths\n\nStrangler fig pattern, domain-driven boundaries, anti-corruption layers, and decoupling shared databases.',
      1,
      'published',
      'GBTdnxk5cHM',
      normalizeYouTubeUrl('GBTdnxk5cHM'),
      '32:10',
      'Decomposing monolithic codebases without interrupting active production operations.',
      'Continuous Delivery',
      1,
      now,
      now
    );

    insertLesson.run(
      'l-legacy-02',
      courses.c_legacy,
      '2. Refactoring Code Smells & Design Patterns',
      '# Clean Code Patterns\n\nIdentifying God objects, high cyclomatic complexity, tight coupling, and replacing them with SOLID design patterns.',
      2,
      'published',
      'CNA47i8qAOk',
      normalizeYouTubeUrl('CNA47i8qAOk'),
      '24:30',
      'Five classic code smells and systematic refactoring strategies.',
      'ArjanCodes',
      0,
      now,
      now
    );

    insertLesson.run(
      'l-legacy-03',
      courses.c_legacy,
      '3. Zero-Downtime Migration Patterns',
      '# Safe Database and Service Cutovers\n\nExpand/contract schema changes, dual-writing techniques, and automated fallback gates.',
      3,
      'published',
      '7LG5a3w9nsw',
      normalizeYouTubeUrl('7LG5a3w9nsw'),
      '19:40',
      'Architectural patterns for reliable cloud and data migrations.',
      'Fireship',
      0,
      now,
      now
    );

    // 4. Seed Enrollments
    const insertEnrollment = db.prepare(`
      INSERT INTO enrollments (id, student_id, course_id, enrolled_at, status)
      VALUES (?, ?, ?, ?, ?)
    `);

    const enrollments = {
      alex_react: 'e-alex-react',
      alex_db: 'e-alex-db',
      maria_react: 'e-maria-react',
      maria_cloud: 'e-maria-cloud',
      david_node: 'e-david-node',
    };

    insertEnrollment.run(enrollments.alex_react, users.student1, courses.c_react, now, 'active');
    insertEnrollment.run(enrollments.alex_db, users.student1, courses.c_db, now, 'active');
    insertEnrollment.run(enrollments.maria_react, users.student2, courses.c_react, now, 'completed'); // Completed all 5
    insertEnrollment.run(enrollments.maria_cloud, users.student2, courses.c_cloud, now, 'active');
    insertEnrollment.run(enrollments.david_node, users.student3, courses.c_node, now, 'active');

    // 5. Seed Lesson Progress
    const insertProgress = db.prepare(`
      INSERT INTO lesson_progress (id, enrollment_id, lesson_id, is_completed, completed_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Alex on React: completed lessons 1 & 2 (2/5 = 40%)
    insertProgress.run('lp-01', enrollments.alex_react, 'l-react-01', 1, now, now);
    insertProgress.run('lp-02', enrollments.alex_react, 'l-react-02', 1, now, now);

    // Maria on React: completed all 5 lessons (5/5 = 100% -> completed)
    insertProgress.run('lp-03', enrollments.maria_react, 'l-react-01', 1, now, now);
    insertProgress.run('lp-04', enrollments.maria_react, 'l-react-02', 1, now, now);
    insertProgress.run('lp-05', enrollments.maria_react, 'l-react-03', 1, now, now);
    insertProgress.run('lp-06', enrollments.maria_react, 'l-react-04', 1, now, now);
    insertProgress.run('lp-07', enrollments.maria_react, 'l-react-05', 1, now, now);

    // David on Node.js: completed lesson 1 (1/5 = 20%)
    insertProgress.run('lp-08', enrollments.david_node, 'l-node-01', 1, now, now);

    // 6. Seed Audit Logs
    const insertAudit = db.prepare(`
      INSERT INTO audit_logs (id, actor_user_id, action, entity_type, entity_id, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertAudit.run(crypto.randomUUID(), users.admin, 'DATABASE_INITIALIZED', 'system', 'db-init', JSON.stringify({ version: '2.0.0' }), now);
    insertAudit.run(crypto.randomUUID(), users.admin, 'USER_CREATED', 'user', users.instructor, JSON.stringify({ role: 'admin' }), now);
    insertAudit.run(crypto.randomUUID(), users.instructor, 'COURSE_CREATED', 'course', courses.c_react, JSON.stringify({ title: 'React.js Fundamentals' }), now);
    insertAudit.run(crypto.randomUUID(), users.student2, 'ENROLLMENT_COMPLETED', 'enrollment', enrollments.maria_react, JSON.stringify({ course_id: courses.c_react, progress: 100 }), now);
  });

  seedTransaction();

  // Seed the 12 modern domain courses with full topic/subtopic/lesson hierarchy
  seedNewCourses(db);

  logger.info('Synthetic database seeding completed successfully');
}

// Allow CLI execution: `node src/database/seed.js`
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => {
      console.log('✓ Seeding complete. Initial test users, courses, and YouTube video lessons loaded.');
      console.log('  Admin credentials:   admin@learnsphere.io / AdminPass123!');
      console.log('  Teacher credentials: elena.rostova@learnsphere.io / TeacherPass123!');
      console.log('  Student credentials: alex.mercer@learnsphere.io / StudentPass123!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
