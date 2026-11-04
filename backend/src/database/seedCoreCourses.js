import { getDatabase } from './index.js';

/**
 * Seeds comprehensive Software Engineering courses across the 12 core IT disciplines:
 * 1. Programming & Computer Science
 * 2. Frontend Development
 * 3. Backend Development
 * 4. Full Stack Development
 * 5. Database Engineering
 * 6. Cloud Computing
 * 7. DevOps & Site Reliability Engineering
 * 8. Artificial Intelligence & Machine Learning
 * 9. Data Engineering
 * 10. Software Testing & Quality Engineering
 * 11. Cybersecurity & Application Security
 * 12. Mobile App Development
 */
export function seedSoftwareCourses() {
  const db = getDatabase();
  const admin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  const instructorId = admin ? admin.id : 'u-admin-01';

  const newCourses = [
    // 1. Programming & Computer Science
    {
      id: 'c-cs-dsa',
      title: 'Data Structures, Algorithms & Problem Solving (DSA)',
      category: 'Programming & Computer Science',
      desc: 'Master foundational computer science algorithms, asymptotic complexity analysis (Big-O), recursion, arrays, linked lists, binary trees, heaps, graphs, and dynamic programming.',
      duration: '45 hours',
      level: 'Intermediate',
      preview_video_id: '8hly31xKli0',
      lessons: [
        {
          id: 'l-dsa-01',
          title: '1. Asymptotic Complexity & Big-O Notation',
          desc: 'Time and space complexity, best/worst/average cases, and evaluating algorithmic efficiency.',
          dur: '36:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Write a function to analyze execution time of nested loops and prove its Big-O complexity mathematically.',
        },
        {
          id: 'l-dsa-02',
          title: '2. Arrays, Linked Lists & Pointers',
          desc: 'Contiguous memory allocations, singly and doubly linked lists, pointer manipulation, and fast/slow pointer algorithms.',
          dur: '42:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Implement a doubly linked list with O(1) insertion, deletion, and reverse operations.',
        },
        {
          id: 'l-dsa-03',
          title: '3. Binary Search Trees & Graph Traversal (BFS & DFS)',
          desc: 'Tree balance, AVL trees, depth-first search, breadth-first search, and shortest path algorithms.',
          dur: '48:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Build a graph adjacency list and implement Dijkstra algorithm to compute single-source shortest path.',
        },
        {
          id: 'l-dsa-04',
          title: '4. Dynamic Programming & Memoization Patterns',
          desc: 'Optimal substructure, overlapping subproblems, memoization vs tabulation, and the 0/1 Knapsack problem.',
          dur: '50:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Solve the Coin Change and Longest Common Subsequence problems using bottom-up 2D tabulation.',
        },
      ],
    },
    {
      id: 'c-cs-cpp',
      title: 'C & C++ Systems Programming: Pointers & Architecture',
      category: 'Programming & Computer Science',
      desc: 'Deep dive into systems programming with C and modern C++: memory layout, pointer arithmetic, manual dynamic allocation, RAII, move semantics, and POSIX multithreading.',
      duration: '40 hours',
      level: 'Intermediate',
      preview_video_id: '8hly31xKli0',
      lessons: [
        {
          id: 'l-cpp-01',
          title: '1. Memory Layout, Pointers & Pointer Arithmetic',
          desc: 'Stack vs heap, pointer dereferencing, buffer management, and memory segmentation.',
          dur: '38:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Allocate a 2D dynamic matrix using double pointers and write a safe deallocation routine.',
        },
        {
          id: 'l-cpp-02',
          title: '2. Modern C++ OOP, RAII & Smart Pointers',
          desc: 'Constructors/destructors, copy vs move semantics, std::unique_ptr, and std::shared_ptr.',
          dur: '44:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Refactor a raw pointer memory manager to use std::unique_ptr and custom deleters.',
        },
        {
          id: 'l-cpp-03',
          title: '3. C++ Standard Template Library (STL) Deep Dive',
          desc: 'Vectors, maps, sets, iterators, lambda expressions, and algorithm efficiency.',
          dur: '40:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Build a fast frequency counter using std::unordered_map with custom hashing functions.',
        },
        {
          id: 'l-cpp-04',
          title: '4. Concurrency & POSIX Threading in C++',
          desc: 'std::thread, mutex locking, race conditions, atomic variables, and condition variables.',
          dur: '46:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Implement a thread-safe producer-consumer bounded queue using std::mutex and std::condition_variable.',
        },
      ],
    },

    // 2. Frontend Development
    {
      id: 'c-fe-next',
      title: 'Next.js 15, TypeScript & Full-Stack Frontend Engineering',
      category: 'Frontend Development',
      desc: 'Modern full-stack web applications with Next.js 15: React Server Components, App Router, Server Actions, Incremental Static Regeneration, and Edge Middleware.',
      duration: '38 hours',
      level: 'Intermediate',
      preview_video_id: '8hly31xKli0',
      lessons: [
        {
          id: 'l-next-01',
          title: '1. Next.js App Router & React Server Components',
          desc: 'Server vs client boundary, layout hierarchy, streaming with Suspense, and zero-bundle-size components.',
          dur: '40:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Build a dynamic dashboard layout using server components and nested parallel routes.',
        },
        {
          id: 'l-next-02',
          title: '2. Server Actions, Form Validation & Optimistic UI',
          desc: 'Type-safe server actions with Zod, useActionState, useOptimistic, and revalidating cached paths.',
          dur: '45:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Implement a collaborative todo list with optimistic updates and server action persistence.',
        },
        {
          id: 'l-next-03',
          title: '3. Data Fetching, Caching & ISR Strategies',
          desc: 'fetch cache tags, revalidateTag, Incremental Static Regeneration, and route handlers.',
          dur: '42:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Configure on-demand ISR for an e-commerce catalog using webhook-triggered cache revalidation.',
        },
        {
          id: 'l-next-04',
          title: '4. Edge Middleware, Authentication & Production Deployment',
          desc: 'JWT session verification at the edge, header rewriting, CSP security, and Vercel/Docker deployment.',
          dur: '48:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Write edge middleware that redirects unauthenticated users and verifies JWT cryptographic signatures.',
        },
      ],
    },

    // 3. Backend Development
    {
      id: 'c-be-spring',
      title: 'Java Spring Boot & Enterprise Microservices Architecture',
      category: 'Backend Development',
      desc: 'Build enterprise-grade Java backend systems: Spring Boot 3, Dependency Injection, Spring Data JPA, RESTful API design, Security, and Microservices communication.',
      duration: '42 hours',
      level: 'Intermediate',
      preview_video_id: '8hly31xKli0',
      lessons: [
        {
          id: 'l-spring-01',
          title: '1. Spring Boot 3 Core & Inversion of Control',
          desc: 'Dependency Injection, @Component scanning, configuration properties, and application life cycle.',
          dur: '38:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Configure a multi-profile Spring Boot application with custom service beans and validation.',
        },
        {
          id: 'l-spring-02',
          title: '2. RESTful APIs & Spring Data JPA Persistence',
          desc: 'Controllers, DTO mapping with MapStruct, repository interfaces, JPQL queries, and database transactions.',
          dur: '46:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Build a paginated REST CRUD resource with transactional rollback and custom JPA repository methods.',
        },
        {
          id: 'l-spring-03',
          title: '3. Spring Security 6 & OAuth2 / JWT Auth',
          desc: 'SecurityFilterChain, stateless authentication, role-based authorization, and custom JWT filters.',
          dur: '50:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Implement an RSA-signed JWT authentication filter protecting admin-only REST endpoints.',
        },
        {
          id: 'l-spring-04',
          title: '4. Microservices Communication & Resilience4j',
          desc: 'Service discovery with Eureka, API Gateway routing, OpenFeign HTTP client, and circuit breaker patterns.',
          dur: '48:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Implement a resilient Feign client with a fallback method and Resilience4j circuit breaker.',
        },
      ],
    },

    // 4. Full Stack Development
    {
      id: 'c-fs-mern',
      title: 'MERN Stack Full-Stack Application Engineering',
      category: 'Full Stack Development',
      desc: 'End-to-end full-stack software development with MongoDB, Express.js, React 19, and Node.js. Build production-grade monolithic and decoupled web platforms.',
      duration: '44 hours',
      level: 'Intermediate',
      preview_video_id: '8hly31xKli0',
      lessons: [
        {
          id: 'l-mern-01',
          title: '1. Full-Stack Monorepo Architecture & API Contracts',
          desc: 'Monorepo project structure, shared TypeScript interfaces, environment configuration, and ESLint setup.',
          dur: '36:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Set up a structured client-server monorepo with shared types and hot-reloading development scripts.',
        },
        {
          id: 'l-mern-02',
          title: '2. MongoDB Modeling with Mongoose & Aggregation',
          desc: 'Schema design, indexing, pre-save hooks, validation, and multi-stage aggregation pipelines.',
          dur: '44:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Create an orders schema with $lookup, $unwind, and $group aggregation calculating revenue metrics.',
        },
        {
          id: 'l-mern-03',
          title: '3. Express REST API with HttpOnly Cookie Authentication',
          desc: 'Bcrypt password hashing, JWT in HttpOnly cookies, CORS security, and global error handling.',
          dur: '48:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Implement an auth controller with secure refresh token rotation and CSRF protection.',
        },
        {
          id: 'l-mern-04',
          title: '4. React 19 Frontend Integration & State Management',
          desc: 'Axios interceptors, React Query for server state caching, responsive styling, and form handling.',
          dur: '52:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Connect a React dashboard to Express backend using TanStack Query with optimistic cache updates.',
        },
      ],
    },

    // 5. Database Engineering
    {
      id: 'c-db-nosql',
      title: 'NoSQL, MongoDB & Redis Distributed Caching Architecture',
      category: 'Database Engineering',
      desc: 'Modern non-relational database architectures: document databases with MongoDB, key-value stores with Redis, distributed caching strategies, and data modeling patterns.',
      duration: '36 hours',
      level: 'Intermediate',
      preview_video_id: '8hly31xKli0',
      lessons: [
        {
          id: 'l-nosql-01',
          title: '1. Document Databases & MongoDB Replica Sets',
          desc: 'CAP theorem, document data modeling, replica set election, write concern, and read preferences.',
          dur: '38:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Design a high-throughput social feed schema comparing embedding vs referencing strategies.',
        },
        {
          id: 'l-nosql-02',
          title: '2. Redis In-Memory Structures & TTL Caching',
          desc: 'Strings, hashes, lists, sets, sorted sets, memory eviction policies, and TTL expiration.',
          dur: '42:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Build a real-time leaderboard using Redis Sorted Sets (ZADD, ZREVRANGE) and TTL expiration.',
        },
        {
          id: 'l-nosql-03',
          title: '3. Distributed Cache-Aside & Write-Through Patterns',
          desc: 'Cache penetration, stampede prevention with distributed locks (Redlock), and cache invalidation.',
          dur: '46:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Implement a cache-aside query wrapper in Node.js with fallback to MongoDB and distributed mutex locking.',
        },
        {
          id: 'l-nosql-04',
          title: '4. Redis Pub/Sub & Real-Time Message Queues',
          desc: 'Pub/Sub broadcasting, Redis Streams, consumer groups, and high-throughput job queuing.',
          dur: '44:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Build a distributed chat broadcasting engine using Redis Pub/Sub channels and WebSocket clients.',
        },
      ],
    },

    // 6. Cloud Computing
    {
      id: 'c-cloud-aws',
      title: 'AWS Cloud Solutions Architecture & Serverless Engineering',
      category: 'Cloud Computing',
      desc: 'Architect scalable cloud applications on Amazon Web Services: VPC networking, EC2 autoscaling, S3 storage, Lambda serverless, API Gateway, and CloudFormation.',
      duration: '40 hours',
      level: 'Intermediate',
      preview_video_id: '8hly31xKli0',
      lessons: [
        {
          id: 'l-aws-01',
          title: '1. AWS VPC Networking, Subnets & Security Groups',
          desc: 'Public/private subnets, Internet Gateways, NAT Gateways, route tables, and NACLs vs Security Groups.',
          dur: '40:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Design a resilient multi-AZ VPC architecture with private database subnets and public load balancers.',
        },
        {
          id: 'l-aws-02',
          title: '2. Elastic Compute (EC2), Auto Scaling & ALB',
          desc: 'AMI provisioning, Application Load Balancers, Target Groups, health checks, and auto-scaling policies.',
          dur: '45:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Configure an Auto Scaling Group triggered by CPU utilization metrics to scale web server instances.',
        },
        {
          id: 'l-aws-03',
          title: '3. Serverless with AWS Lambda & API Gateway',
          desc: 'Event-driven serverless architecture, Lambda execution roles, cold starts, and API Gateway REST routing.',
          dur: '42:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Write and deploy a serverless image processing pipeline using S3 event triggers and AWS Lambda.',
        },
        {
          id: 'l-aws-04',
          title: '4. Cloud Storage (S3) & CloudFront CDN Distribution',
          desc: 'S3 bucket policies, presigned URLs, CORS, CloudFront caching behaviors, and edge invalidations.',
          dur: '38:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Set up a private S3 bucket delivering static assets exclusively through CloudFront Origin Access Control (OAC).',
        },
      ],
    },

    // 7. DevOps & Site Reliability Engineering
    {
      id: 'c-devops-cicd',
      title: 'CI/CD Automation, GitOps & Production SRE Monitoring',
      category: 'DevOps & Site Reliability Engineering',
      desc: 'Automate software delivery and maintain system reliability: GitHub Actions pipelines, Docker multi-stage builds, ArgoCD GitOps, Prometheus metrics, and Grafana alerting.',
      duration: '40 hours',
      level: 'Intermediate',
      preview_video_id: '8hly31xKli0',
      lessons: [
        {
          id: 'l-cicd-01',
          title: '1. GitHub Actions: Automated Lint, Test & Build Workflows',
          desc: 'Workflow triggers, action matrix testing, secret management, artifacts, and caching dependencies.',
          dur: '38:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Write a GitHub Actions YAML workflow that runs automated unit tests and linter on every pull request.',
        },
        {
          id: 'l-cicd-02',
          title: '2. Multi-Stage Docker Builds & Image Optimization',
          desc: 'Docker build cache, multi-stage compilation, distroless images, and scanning for CVE vulnerabilities with Trivy.',
          dur: '42:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Create a minimal multi-stage Dockerfile that compiles a Node.js TypeScript app into a 65MB production image.',
        },
        {
          id: 'l-cicd-03',
          title: '3. GitOps Continuous Deployment with ArgoCD',
          desc: 'Declarative Kubernetes deployments, Git as single source of truth, automated synchronization, and rollback.',
          dur: '46:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Configure an ArgoCD Application manifest that automatically synchronizes K8s deployments from a Git repo.',
        },
        {
          id: 'l-cicd-04',
          title: '4. Site Reliability Engineering (SRE) & Prometheus Observability',
          desc: 'The Four Golden Signals, SLI/SLO definitions, Prometheus metric scraping, and Grafana alert rule setup.',
          dur: '48:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Instrument an Express application with prom-client and construct a Grafana dashboard monitoring request latency.',
        },
      ],
    },

    // 8. Data Engineering
    {
      id: 'c-de-spark',
      title: 'Data Engineering with Apache Spark, Kafka & ETL Pipelines',
      category: 'Data Engineering',
      desc: 'Build high-throughput big data pipelines: Apache Kafka event streaming, Apache Spark distributed dataframes, data lakes, Parquet optimization, and batch/streaming ETL.',
      duration: '44 hours',
      level: 'Intermediate',
      preview_video_id: '8hly31xKli0',
      lessons: [
        {
          id: 'l-spark-01',
          title: '1. Apache Kafka Architecture & Event Streaming',
          desc: 'Topics, partitions, consumer groups, offset management, message serialization, and exactly-once semantics.',
          dur: '42:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Write a Node.js Kafka producer and consumer with automatic partition rebalancing and error dead-letter queue.',
        },
        {
          id: 'l-spark-02',
          title: '2. Apache Spark Core & Distributed DataFrames',
          desc: 'Resilient Distributed Datasets (RDDs), Spark DataFrames, Catalyst query optimizer, and lazy evaluation.',
          dur: '48:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Write a PySpark script that aggregates 10 million simulated e-commerce clickstream events.',
        },
        {
          id: 'l-spark-03',
          title: '3. Spark Structured Streaming & Windowed Aggregations',
          desc: 'Streaming DataFrames, event-time watermarking, sliding windows, and writing to Parquet data sinks.',
          dur: '46:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Implement a real-time anomaly detection pipeline in PySpark streaming reading from Kafka with a 10-minute watermark.',
        },
        {
          id: 'l-spark-04',
          title: '4. Modern Data Lakehouse Architecture (Delta Lake & Parquet)',
          desc: 'ACID transactions on data lakes, schema enforcement, time-travel queries, and partition pruning.',
          dur: '44:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Query Delta Lake tables using time-travel SQL to inspect and revert unintended data mutations.',
        },
      ],
    },

    // 9. Software Testing & Quality Engineering
    {
      id: 'c-qa-auto',
      title: 'Software Testing & QA: Manual, Automation & Playwright',
      category: 'Software Testing & Quality Engineering',
      desc: 'Comprehensive quality engineering: software testing lifecycle (STLC), test case design, unit/integration testing, Test-Driven Development (TDD), and E2E automation with Playwright.',
      duration: '38 hours',
      level: 'Intermediate',
      preview_video_id: '8hly31xKli0',
      lessons: [
        {
          id: 'l-qa-01',
          title: '1. Software Testing Life Cycle (STLC) & Test Strategy',
          desc: 'Verification vs validation, test pyramids, black-box vs white-box testing, boundary value analysis, and equivalence partitioning.',
          dur: '36:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Design a complete test specification and traceability matrix for an e-commerce checkout flow.',
        },
        {
          id: 'l-qa-02',
          title: '2. Unit Testing & Test-Driven Development (TDD)',
          desc: 'Red-Green-Refactor cycle, test assertions with Vitest/Jest, mock functions, stubs, and code coverage metrics.',
          dur: '42:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Implement a shopping cart calculator strictly following TDD with 100% statement and branch coverage.',
        },
        {
          id: 'l-qa-03',
          title: '3. End-to-End Automation with Playwright & TypeScript',
          desc: 'Page Object Model (POM), selector strategies, auto-waiting, parallel execution, and visual regression testing.',
          dur: '48:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Build a Playwright test suite with Page Object Model covering user registration, login, and dashboard navigation.',
        },
        {
          id: 'l-qa-04',
          title: '4. Automated Test CI Pipelines & Allure Reporting',
          desc: 'Running headless browser tests in GitHub Actions, video recording failures, and generating HTML test reports.',
          dur: '40:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Set up a GitHub Actions workflow that executes Playwright tests on push and publishes an HTML report artifact.',
        },
      ],
    },
    {
      id: 'c-qa-api',
      title: 'API & Performance Testing: Postman, JMeter & Contract Testing',
      category: 'Software Testing & Quality Engineering',
      desc: 'Verify backend API correctness and load resilience: REST API validation with Postman/Newman, load testing with Apache JMeter and k6, and Consumer-Driven Contract Testing.',
      duration: '36 hours',
      level: 'Intermediate',
      preview_video_id: '8hly31xKli0',
      lessons: [
        {
          id: 'l-qapi-01',
          title: '1. REST API Testing Fundamentals & Postman Automation',
          desc: 'HTTP status codes, payload assertions, environment variables, pre-request scripts, and Postman collections.',
          dur: '38:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Create an automated Postman test collection with dynamic JWT token extraction and assertion scripts.',
        },
        {
          id: 'l-qapi-02',
          title: '2. Command-Line API Test Execution with Newman',
          desc: 'Running Postman collections in CLI, CI integration, generating JUnit XML reports, and automated regression runs.',
          dur: '34:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Configure a headless npm script running Newman tests against a local development server.',
        },
        {
          id: 'l-qapi-03',
          title: '3. Performance & Stress Testing with Apache JMeter and k6',
          desc: 'Thread groups, ramp-up periods, throughput (TPS), response time percentiles (p95/p99), and bottleneck identification.',
          dur: '46:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Write a k6 performance script simulating 200 concurrent virtual users hitting an API endpoint for 5 minutes.',
        },
        {
          id: 'l-qapi-04',
          title: '4. Consumer-Driven Contract Testing with Pact',
          desc: 'Microservices contract testing, Pact broker, consumer expectations, and provider verification in CI pipelines.',
          dur: '42:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Implement a Pact contract test verifying that a frontend consumer and backend provider API schema remain synchronized.',
        },
      ],
    },

    // 10. Cybersecurity & Application Security
    {
      id: 'c-sec-appsec',
      title: 'Web Application Security, OWASP Top 10 & DevSecOps',
      category: 'Cybersecurity & Application Security',
      desc: 'Practical defensive software security: secure coding guidelines, OWASP Top 10 vulnerability remediation (SQLi, XSS, CSRF, SSRF), cryptographic storage, and automated DevSecOps scanning.',
      duration: '40 hours',
      level: 'Intermediate',
      preview_video_id: '8hly31xKli0',
      lessons: [
        {
          id: 'l-appsec-01',
          title: '1. Secure Software Development Lifecycle & Threat Modeling',
          desc: 'Security requirements, STRIDE threat modeling, attack surface reduction, and security code reviews.',
          dur: '36:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Perform a STRIDE threat model on a multi-tier banking web application and document mitigations.',
        },
        {
          id: 'l-appsec-02',
          title: '2. OWASP Top 10 Defense: Injection & Broken Access Control',
          desc: 'Prepared statements, input sanitization, IDOR prevention, RBAC validation, and defense in depth.',
          dur: '46:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Audit a vulnerable Express route and refactor it with parameterized queries and role-based checks.',
        },
        {
          id: 'l-appsec-03',
          title: '3. Cross-Site Scripting (XSS), CSRF & Security Headers',
          desc: 'Content Security Policy (CSP), SameSite cookies, CSRF tokens, DOMPurify sanitization, and subresource integrity.',
          dur: '42:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Configure strict HTTP security headers using Helmet.js and implement client-side DOMPurify sanitization.',
        },
        {
          id: 'l-appsec-04',
          title: '4. DevSecOps: SAST, DAST & Dependency Vulnerability Scanning',
          desc: 'Static Application Security Testing (SAST), Software Bill of Materials (SBOM), npm audit, and automated Git secret scanning.',
          dur: '44:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Integrate Semgrep SAST and Snyk vulnerability scanning into a GitHub Actions continuous integration pipeline.',
        },
      ],
    },

    // 11. Mobile App Development
    {
      id: 'c-mob-flutter',
      title: 'Flutter & Dart: Cross-Platform Mobile Architecture',
      category: 'Mobile App Development',
      desc: 'Engineer fast, beautiful cross-platform mobile apps for iOS and Android using Flutter 3 and Dart: widget lifecycle, state management with Riverpod, REST integration, and offline persistence.',
      duration: '42 hours',
      level: 'Intermediate',
      preview_video_id: '8hly31xKli0',
      lessons: [
        {
          id: 'l-flut-01',
          title: '1. Dart Language Fundamentals & Null Safety',
          desc: 'Strong typing, sound null safety, async/await, streams, collections, and object-oriented Dart classes.',
          dur: '36:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Write a Dart utility class that parses JSON responses with null-safe model serialization.',
        },
        {
          id: 'l-flut-02',
          title: '2. Flutter Widget Tree & Reactive UI Components',
          desc: 'Stateless vs Stateful widgets, layout composition, custom painters, themes, and responsive design for mobile.',
          dur: '44:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Build a responsive mobile product catalog with smooth scrolling slivers and animations.',
        },
        {
          id: 'l-flut-03',
          title: '3. State Management with Flutter Riverpod',
          desc: 'StateProvider, StateNotifierProvider, async state handling, and dependency injection in Flutter apps.',
          dur: '48:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Implement a shopping cart and checkout state manager using Riverpod with persistent state.',
        },
        {
          id: 'l-flut-04',
          title: '4. Offline Database (sqflite) & Native Device Features',
          desc: 'Local SQLite persistence, device permissions, camera access, secure storage, and release builds.',
          dur: '46:00',
          video_id: '8hly31xKli0',
          practical: 'Exercise: Build an offline-first notes mobile application with SQLite database sync and biometric unlock.',
        },
      ],
    },
  ];

  const now = new Date().toISOString();

  // 1. Course Upsert Statement
  const insertCourse = db.prepare(`
    INSERT INTO courses (
      id, title, description, category, instructor_id,
      thumbnail_url, status, estimated_duration, preview_video_id,
      created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      category = excluded.category,
      estimated_duration = excluded.estimated_duration,
      preview_video_id = excluded.preview_video_id,
      updated_at = excluded.updated_at
  `);

  // 2. Lesson Upsert Statement
  const insertLesson = db.prepare(`
    INSERT INTO lessons (
      id, course_id, title, description, content,
      position, duration, is_preview, status,
      video_id, video_url, channel_name,
      topic_title, subtopic_title, practical_exercise,
      created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      content = excluded.content,
      position = excluded.position,
      duration = excluded.duration,
      video_id = excluded.video_id,
      video_url = excluded.video_url,
      channel_name = excluded.channel_name,
      topic_title = excluded.topic_title,
      subtopic_title = excluded.subtopic_title,
      practical_exercise = excluded.practical_exercise,
      updated_at = excluded.updated_at
  `);

  // 3. Quiz Upsert Statement
  const insertQuiz = db.prepare(`
    INSERT INTO quizzes (id, lesson_id, title, description, passing_score)
    VALUES (?, ?, ?, ?, 70)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description
  `);

  // 4. Quiz Question Upsert Statement
  const insertQuestion = db.prepare(`
    INSERT INTO quiz_questions (id, quiz_id, question_text, explanation, options_json, correct_option_index, position)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      question_text = excluded.question_text,
      explanation = excluded.explanation,
      options_json = excluded.options_json,
      correct_option_index = excluded.correct_option_index
  `);

  const tx = db.transaction(() => {
    for (const c of newCourses) {
      insertCourse.run(
        c.id,
        c.title,
        c.desc,
        c.category,
        instructorId,
        `/images/courses/${c.id}.svg`,
        c.duration,
        c.preview_video_id || '8hly31xKli0',
        now,
        now
      );

      let pos = 1;
      for (const l of c.lessons) {
        const fullContent = `# ${l.title}\n\n## Overview\n${l.desc}\n\n### Key Concepts & Architecture\n- Core software principles and design patterns.\n- Scalable, modular implementation strategies.\n- Production resilience and industry best practices.\n\n### Practical Implementation Walkthrough\nStudy the hands-on lab exercise below and implement the solution in your local IDE.\n\n\`\`\`typescript\n// Example architectural demonstration\nexport async function executeEnginePattern(): Promise<void> {\n  console.log('Initializing production service pipeline...');\n}\n\`\`\`\n\n### Summary & Review\nReview the video lesson above, complete the practical exercise, and pass the knowledge-check quiz to mark this module completed.`;

        insertLesson.run(
          l.id,
          c.id,
          l.title,
          l.desc,
          fullContent,
          pos,
          l.dur,
          pos === 1 ? 1 : 0,
          l.video_id,
          `https://www.youtube-nocookie.com/embed/${l.video_id}`,
          'Edunova Technologies Faculty',
          c.title,
          l.title,
          l.practical,
          now,
          now
        );

        // Seed quiz for this lesson
        const quizId = `quiz-${l.id}`;
        insertQuiz.run(quizId, l.id, `${l.title} — Knowledge Check`, `Verify your mastery of ${l.title}.`);

        insertQuestion.run(
          `q-${l.id}-1`,
          quizId,
          `What is the primary architectural advantage of the design patterns covered in ${l.title}?`,
          `This pattern maximizes modularity, testability, and operational resilience under production loads.`,
          JSON.stringify([
            'It enables loose coupling, modular maintenance, and high testability',
            'It bypasses database constraints and indexes completely',
            'It eliminates the need for unit testing',
            'It requires synchronous blocking operations across all threads',
          ]),
          0,
          1
        );

        pos++;
      }
    }
  });

  tx();
  console.log(`✓ Seeded ${newCourses.length} software engineering courses across the 12 core domains.`);
}

// Backward-compatible alias
export const seedCoreCourses = seedSoftwareCourses;

// Allow direct CLI execution: `node src/database/seedCoreCourses.js`
if (process.argv[1] && process.argv[1].endsWith('seedCoreCourses.js')) {
  seedSoftwareCourses();
  process.exit(0);
}
