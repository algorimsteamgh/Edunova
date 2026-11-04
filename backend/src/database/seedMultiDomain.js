import { getDatabase } from './index.js';
import crypto from 'node:crypto';

export function seedMultiDomainData() {
  const db = getDatabase();

  console.log('Seeding Multi-Domain Structured LMS Curriculums & Roadmaps...');

  // 1. Identify Admin User for instructor_id
  const admin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  const instructorId = admin ? admin.id : 'u-admin-01';

  // ========================================================================
  // 17 ROADMAPS DATA
  // ========================================================================
  const ROADMAPS = [
    {
      id: 'rm-ai-eng',
      slug: 'ai-engineer',
      title: 'AI Engineer',
      description: 'Comprehensive pathway to becoming an AI Engineer: from foundational Python and linear algebra to Deep Learning, LLMs, RAG, and Autonomous AI Agents.',
      category: 'Artificial Intelligence & Machine Learning',
      subcategory: 'Applied AI',
      level: 'Intermediate',
      estimated_duration: '45 hours',
      thumbnail_url: '/images/roadmaps/ai-engineer.svg',
      official_url: 'https://roadmap.sh/ai-data-scientist',
      tags: JSON.stringify(['AI', 'Python', 'Machine Learning', 'Deep Learning', 'LLMs', 'RAG', 'Agentic AI']),
    },
    {
      id: 'rm-ml-eng',
      slug: 'machine-learning-engineer',
      title: 'Machine Learning Engineer',
      description: 'Master supervised, unsupervised, and reinforcement learning, feature engineering, neural network architectures, and production MLOps pipelines.',
      category: 'Artificial Intelligence & Machine Learning',
      subcategory: 'Machine Learning',
      level: 'Intermediate',
      estimated_duration: '40 hours',
      thumbnail_url: '/images/roadmaps/ml-engineer.svg',
      official_url: 'https://roadmap.sh/ai-data-scientist',
      tags: JSON.stringify(['ML', 'Supervised Learning', 'Neural Networks', 'MLOps', 'PyTorch']),
    },
    {
      id: 'rm-genai-eng',
      slug: 'generative-ai-engineer',
      title: 'Generative AI Engineer',
      description: 'Specialize in Transformer architectures, prompt engineering, fine-tuning LLMs, vector database retrieval (RAG), and Model Context Protocol (MCP) agents.',
      category: 'Artificial Intelligence & Machine Learning',
      subcategory: 'Generative AI',
      level: 'Advanced',
      estimated_duration: '35 hours',
      thumbnail_url: '/images/roadmaps/generative-ai.svg',
      official_url: 'https://roadmap.sh/prompt-engineering',
      tags: JSON.stringify(['GenAI', 'LLM', 'Prompt Engineering', 'RAG', 'Vector DB', 'MCP', 'Agents']),
    },
    {
      id: 'rm-cloud-eng',
      slug: 'cloud-engineer',
      title: 'Cloud Engineer',
      description: 'Architect scalable, highly-available infrastructure across public cloud providers, compute virtualization, storage topologies, and cloud networking.',
      category: 'Cloud Computing',
      subcategory: 'Cloud Architecture',
      level: 'Intermediate',
      estimated_duration: '38 hours',
      thumbnail_url: '/images/roadmaps/cloud-engineer.svg',
      official_url: 'https://roadmap.sh/devops',
      tags: JSON.stringify(['Cloud', 'Compute', 'Storage', 'VPC', 'Serverless', 'Security']),
    },
    {
      id: 'rm-aws-arch',
      slug: 'aws-solutions-architect',
      title: 'AWS Solutions Architect',
      description: 'End-to-end AWS mastery: IAM security boundaries, EC2 compute clusters, S3 storage tiers, RDS/Aurora databases, VPC networking, and Route53.',
      category: 'Cloud Computing',
      subcategory: 'Amazon Web Services',
      level: 'Advanced',
      estimated_duration: '42 hours',
      thumbnail_url: '/images/roadmaps/aws.svg',
      official_url: 'https://roadmap.sh/aws',
      tags: JSON.stringify(['AWS', 'Solutions Architect', 'EC2', 'S3', 'IAM', 'VPC', 'CloudFormation']),
    },
    {
      id: 'rm-azure-eng',
      slug: 'azure-cloud-engineer',
      title: 'Azure Cloud Engineer',
      description: 'Enterprise Microsoft Azure architecture: Entra ID (Azure AD), Virtual Machines, Blob Storage, Azure Kubernetes Service (AKS), and Azure DevOps.',
      category: 'Cloud Computing',
      subcategory: 'Microsoft Azure',
      level: 'Intermediate',
      estimated_duration: '36 hours',
      thumbnail_url: '/images/roadmaps/azure.svg',
      official_url: 'https://roadmap.sh/devops',
      tags: JSON.stringify(['Azure', 'Entra ID', 'AKS', 'ARM Templates', 'Azure Monitor']),
    },
    {
      id: 'rm-gcp-eng',
      slug: 'gcp-cloud-engineer',
      title: 'GCP Cloud Engineer',
      description: 'Google Cloud Platform specialization: Google Kubernetes Engine (GKE), Cloud Run containerized microservices, BigQuery analytics, and Cloud IAM.',
      category: 'Cloud Computing',
      subcategory: 'Google Cloud Platform',
      level: 'Intermediate',
      estimated_duration: '35 hours',
      thumbnail_url: '/images/roadmaps/gcp.svg',
      official_url: 'https://roadmap.sh/devops',
      tags: JSON.stringify(['GCP', 'Cloud Run', 'GKE', 'BigQuery', 'Cloud IAM', 'Anthos']),
    },
    {
      id: 'rm-devops-eng',
      slug: 'devops-engineer',
      title: 'DevOps Engineer',
      description: 'Bridge software engineering and operational reliability: Linux internals, Git automation, Docker containerization, CI/CD pipelines, and Terraform IaC.',
      category: 'DevOps & Site Reliability Engineering',
      subcategory: 'DevOps',
      level: 'Intermediate',
      estimated_duration: '48 hours',
      thumbnail_url: '/images/roadmaps/devops.svg',
      official_url: 'https://roadmap.sh/devops',
      tags: JSON.stringify(['DevOps', 'Linux', 'Docker', 'CI/CD', 'Terraform', 'Ansible', 'Git']),
    },
    {
      id: 'rm-k8s-eng',
      slug: 'kubernetes-engineer',
      title: 'Kubernetes Engineer',
      description: 'Master container orchestration: Pods, Deployments, Services, Ingress controllers, Helm charts, stateful sets, RBAC, and cluster observability.',
      category: 'DevOps & Site Reliability Engineering',
      subcategory: 'Orchestration',
      level: 'Advanced',
      estimated_duration: '32 hours',
      thumbnail_url: '/images/roadmaps/kubernetes.svg',
      official_url: 'https://roadmap.sh/devops',
      tags: JSON.stringify(['Kubernetes', 'K8s', 'Helm', 'Ingress', 'Operators', 'Service Mesh']),
    },
    {
      id: 'rm-fullstack-dev',
      slug: 'full-stack-developer',
      title: 'Full Stack Developer',
      description: 'Comprehensive modern web stack: HTML5/CSS3 semantics, React 19 architecture, Node.js and Express REST services, SQL databases, and responsive UI.',
      category: 'Full Stack Development',
      subcategory: 'Full Stack',
      level: 'Beginner',
      estimated_duration: '50 hours',
      thumbnail_url: '/images/roadmaps/full-stack.svg',
      official_url: 'https://roadmap.sh/full-stack',
      tags: JSON.stringify(['Full Stack', 'React', 'Node.js', 'Express', 'SQL', 'JavaScript']),
    },
    {
      id: 'rm-backend-dev',
      slug: 'backend-developer',
      title: 'Backend Developer',
      description: 'Deep dive into server-side engineering: API design, relational data modeling, SQLite WAL, caching strategies, asynchronous messaging, and system design.',
      category: 'Backend Development',
      subcategory: 'Backend',
      level: 'Intermediate',
      estimated_duration: '44 hours',
      thumbnail_url: '/images/roadmaps/backend.svg',
      official_url: 'https://roadmap.sh/backend',
      tags: JSON.stringify(['Backend', 'APIs', 'Databases', 'Caching', 'Concurrency', 'System Design']),
    },
    {
      id: 'rm-data-eng',
      slug: 'data-engineer',
      title: 'Data Engineer',
      description: 'Build enterprise data infrastructure: SQL analytics, Python data processing, distributed Apache Spark computations, Kafka streaming, and data warehouses.',
      category: 'Data Engineering',
      subcategory: 'Big Data',
      level: 'Intermediate',
      estimated_duration: '42 hours',
      thumbnail_url: '/images/roadmaps/data-engineer.svg',
      official_url: 'https://roadmap.sh/ai-data-scientist',
      tags: JSON.stringify(['Data Engineering', 'Spark', 'Kafka', 'ETL', 'SQL', 'Data Warehousing']),
    },
    {
      id: 'rm-cybersecurity',
      slug: 'cybersecurity-engineer',
      title: 'Cybersecurity Engineer',
      description: 'Defend enterprise architectures: Network security, OWASP Web vulnerabilities, Linux security hardening, cryptographic key management, and DevSecOps.',
      category: 'Cybersecurity & Application Security',
      subcategory: 'Security Engineering',
      level: 'Intermediate',
      estimated_duration: '38 hours',
      thumbnail_url: '/images/roadmaps/cybersecurity.svg',
      official_url: 'https://roadmap.sh/cyber-security',
      tags: JSON.stringify(['Cybersecurity', 'OWASP', 'Cryptography', 'Network Defense', 'DevSecOps']),
    },
    {
      id: 'rm-cs-dsa',
      slug: 'computer-science-dsa',
      title: 'Computer Science & DSA Specialist',
      description: 'Master core CS fundamentals: Big-O asymptotic analysis, Linear and Non-Linear Data Structures, Graph Theory, and Dynamic Programming algorithms.',
      category: 'Programming & Computer Science',
      subcategory: 'Algorithms & Data Structures',
      level: 'Intermediate',
      estimated_duration: '45 hours',
      thumbnail_url: '/images/roadmaps/cs-dsa.svg',
      official_url: 'https://roadmap.sh/computer-science',
      tags: JSON.stringify(['Algorithms', 'Data Structures', 'Big-O', 'Trees', 'Graphs', 'Dynamic Programming']),
    },
    {
      id: 'rm-frontend-dev',
      slug: 'frontend-developer',
      title: 'Frontend Developer',
      description: 'End-to-end client-side web mastery: HTML5/CSS3 semantics, JavaScript ES6+, TypeScript, React 19 architecture, and Next.js full-stack frontend.',
      category: 'Frontend Development',
      subcategory: 'Frontend Engineering',
      level: 'Beginner',
      estimated_duration: '45 hours',
      thumbnail_url: '/images/roadmaps/frontend.svg',
      official_url: 'https://roadmap.sh/frontend',
      tags: JSON.stringify(['Frontend', 'React', 'TypeScript', 'Next.js', 'CSS', 'JavaScript']),
    },
    {
      id: 'rm-db-eng',
      slug: 'database-engineer',
      title: 'Database Engineer',
      description: 'Relational and distributed storage engineering: SQL query optimization, PostgreSQL schema modeling, MongoDB document clustering, and Redis distributed caching.',
      category: 'Database Engineering',
      subcategory: 'Data Architecture',
      level: 'Intermediate',
      estimated_duration: '40 hours',
      thumbnail_url: '/images/roadmaps/database.svg',
      official_url: 'https://roadmap.sh/postgresql-dba',
      tags: JSON.stringify(['Database', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Indexing', 'Optimization']),
    },
    {
      id: 'rm-qa-eng',
      slug: 'qa-automation-engineer',
      title: 'Software Testing & QA Engineer',
      description: 'Complete quality assurance engineering: STLC methodology, Unit Testing with TDD, E2E Browser Automation with Playwright, and API Load Testing.',
      category: 'Software Testing & Quality Engineering',
      subcategory: 'Test Automation',
      level: 'Intermediate',
      estimated_duration: '38 hours',
      thumbnail_url: '/images/roadmaps/qa.svg',
      official_url: 'https://roadmap.sh/qa',
      tags: JSON.stringify(['QA', 'Software Testing', 'Playwright', 'Selenium', 'TDD', 'Postman', 'JMeter']),
    },
    {
      id: 'rm-mobile-dev',
      slug: 'mobile-app-developer',
      title: 'Mobile App Developer',
      description: 'Cross-platform and native mobile software engineering: Flutter & Dart, React Native, device hardware integration, offline SQLite, and App Store deployment.',
      category: 'Mobile App Development',
      subcategory: 'Mobile Architecture',
      level: 'Intermediate',
      estimated_duration: '42 hours',
      thumbnail_url: '/images/roadmaps/mobile.svg',
      official_url: 'https://roadmap.sh/flutter',
      tags: JSON.stringify(['Mobile', 'Flutter', 'Dart', 'React Native', 'iOS', 'Android', 'SQLite']),
    },
  ];

  // Insert or Replace Roadmaps
  const insertRoadmapStmt = db.prepare(`
    INSERT OR REPLACE INTO roadmaps (
      id, slug, title, description, category, subcategory, official_url,
      level, estimated_duration, thumbnail_url, tags, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
  `);

  for (const rm of ROADMAPS) {
    insertRoadmapStmt.run(
      rm.id,
      rm.slug,
      rm.title,
      rm.description,
      rm.category,
      rm.subcategory,
      rm.official_url,
      rm.level,
      rm.estimated_duration,
      rm.thumbnail_url,
      rm.tags
    );
  }
  console.log(`✓ Inserted ${ROADMAPS.length} canonical career roadmaps.`);

  // ========================================================================
  // ROADMAP TOPICS GENERATION (Hierarchical Nodes with Levels)
  // ========================================================================
  const insertTopicStmt = db.prepare(`
    INSERT OR REPLACE INTO roadmap_topics (
      id, roadmap_id, parent_topic_id, title, description, display_order,
      learning_objectives, prerequisites, difficulty_level, estimated_duration,
      reference_urls, course_id, lesson_id, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
  `);

  const TOPIC_SPECS = {
    'rm-ai-eng': [
      { id: 'top-ai-01', title: 'Python for AI & Scientific Computing', diff: 'Beginner', dur: '4 hours', desc: 'NumPy array manipulation, vectorization, Pandas dataframes, and computational mathematics.' },
      { id: 'top-ai-02', title: 'Mathematics for Machine Learning', diff: 'Beginner', dur: '5 hours', desc: 'Linear algebra, matrix decomposition, gradients, multivariate calculus, and probability distributions.' },
      { id: 'top-ai-03', title: 'Supervised & Unsupervised Learning', diff: 'Intermediate', dur: '6 hours', desc: 'Linear regression, decision trees, random forests, clustering, and cross-validation pipelines.' },
      { id: 'top-ai-04', title: 'Deep Neural Networks with PyTorch', diff: 'Intermediate', dur: '8 hours', desc: 'Multi-layer perceptrons, forward propagation, loss functions, backprop, and GPU acceleration.' },
      { id: 'top-ai-05', title: 'Transformer Architectures & Attention', diff: 'Advanced', dur: '7 hours', desc: 'Self-attention mechanics, encoder-decoder transformers, Positional Encoding, and BERT/GPT internals.' },
      { id: 'top-ai-06', title: 'Retrieval-Augmented Generation (RAG)', diff: 'Advanced', dur: '6 hours', desc: 'Embedding models, vector indexing with Chroma/Pinecone, hybrid search, and semantic chunking.' },
      { id: 'top-ai-07', title: 'Autonomous AI Agents & MCP', diff: 'Advanced', dur: '6 hours', desc: 'ReAct reasoning loops, Model Context Protocol (MCP) tool integration, and multi-agent coordination.' },
    ],
    'rm-cloud-eng': [
      { id: 'top-cld-01', title: 'Cloud Virtualization & Multi-Tenancy', diff: 'Beginner', dur: '3 hours', desc: 'Hypervisors, virtualization, regions, availability zones, and shared responsibility security.' },
      { id: 'top-cld-02', title: 'Cloud Compute & Container Scaling', diff: 'Intermediate', dur: '6 hours', desc: 'Virtual machine clusters, container runtimes, autoscaling groups, and serverless compute.' },
      { id: 'top-cld-03', title: 'Cloud Storage & Object Topologies', diff: 'Intermediate', dur: '5 hours', desc: 'Block storage, distributed file systems, S3 bucket lifecycle policies, and encryption at rest.' },
      { id: 'top-cld-04', title: 'Virtual Private Cloud (VPC) Networking', diff: 'Advanced', dur: '7 hours', desc: 'Subnets, CIDR blocks, NAT gateways, route tables, peering connections, and security groups.' },
      { id: 'top-cld-05', title: 'Identity & Access Management (IAM)', diff: 'Advanced', dur: '5 hours', desc: 'Least-privilege policies, service accounts, federated identities, and role assumption.' },
      { id: 'top-cld-06', title: 'Multi-Cloud Architecture & Resilience', diff: 'Advanced', dur: '6 hours', desc: 'Disaster recovery, cross-cloud failover, hybrid connectivity, and cost optimization.' },
    ],
    'rm-devops-eng': [
      { id: 'top-dev-01', title: 'Linux Systems & Shell Automation', diff: 'Beginner', dur: '4 hours', desc: 'POSIX command utilities, process management, file permissions, and Bash shell scripting.' },
      { id: 'top-dev-02', title: 'Git Workflows & Collaborative Branching', diff: 'Beginner', dur: '3 hours', desc: 'Trunk-based development, rebase vs merge, semantic versioning, and commit signing.' },
      { id: 'top-dev-03', title: 'Docker Containerization & Multi-Stage Builds', diff: 'Intermediate', dur: '6 hours', desc: 'Dockerfile optimization, layers, volume mounts, bridge networking, and daemon configuration.' },
      { id: 'top-dev-04', title: 'CI/CD Pipelines with GitHub Actions', diff: 'Intermediate', dur: '6 hours', desc: 'Automated test runners, artifact packaging, matrix builds, environment secrets, and rollback steps.' },
      { id: 'top-dev-05', title: 'Infrastructure as Code with Terraform', diff: 'Advanced', dur: '7 hours', desc: 'Declarative resource provisioning, state locking in cloud storage, and modular configurations.' },
      { id: 'top-dev-06', title: 'Cloud Monitoring with Prometheus & Grafana', diff: 'Advanced', dur: '5 hours', desc: 'Metrics scraping, PromQL queries, alerting rules, service level indicators (SLI/SLO).' },
    ],
    'rm-fullstack-dev': [
      { id: 'top-fs-01', title: 'HTML5 Semantic Structure & CSS3 Grid', diff: 'Beginner', dur: '4 hours', desc: 'Accessible DOM landmarks, Flexbox alignment, CSS grid layouts, and responsive media queries.' },
      { id: 'top-fs-02', title: 'Modern JavaScript (ES2024) & Async I/O', diff: 'Beginner', dur: '6 hours', desc: 'Event loop, promises, async/await, closures, prototypes, and ES module bundling.' },
      { id: 'top-fs-03', title: 'React 19 Components & State Lifecycle', diff: 'Intermediate', dur: '8 hours', desc: 'Functional components, hooks, Context API, optimistic updates, and component memoization.' },
      { id: 'top-fs-04', title: 'Node.js & Express RESTful API Engineering', diff: 'Intermediate', dur: '7 hours', desc: 'Express routing, middleware chaining, schema validation, rate limiting, and JWT authentication.' },
      { id: 'top-fs-05', title: 'Relational Database Design with SQLite & PostgreSQL', diff: 'Intermediate', dur: '7 hours', desc: 'Normalization, foreign-key constraints, ACID transactions, WAL mode, and B-Tree indexes.' },
      { id: 'top-fs-06', title: 'Full Stack Deployment & Cloud Production', diff: 'Advanced', dur: '6 hours', desc: 'Dockerizing the full stack, environment variables, Nginx reverse proxies, and production builds.' },
    ],
    'rm-data-eng': [
      { id: 'top-de-01', title: 'SQL for Data Engineering & Analytical Queries', diff: 'Beginner', dur: '5 hours', desc: 'Window functions, CTEs, partition keys, grouping sets, and relational database optimization.' },
      { id: 'top-de-02', title: 'Data Pipelines & ETL Architecture', diff: 'Intermediate', dur: '6 hours', desc: 'Extract-Transform-Load design, idempotent ingestion, data cleaning, and schema evolution.' },
      { id: 'top-de-03', title: 'Distributed Processing with Apache Spark', diff: 'Advanced', dur: '8 hours', desc: 'Resilient Distributed Datasets (RDDs), Spark DataFrames, cluster executors, and memory partitioning.' },
      { id: 'top-de-04', title: 'Event Streaming with Apache Kafka', diff: 'Advanced', dur: '7 hours', desc: 'Topics, partitions, consumer groups, exactly-once delivery, and stream processing.' },
    ],
    'rm-cybersecurity': [
      { id: 'top-sec-01', title: 'Cybersecurity Fundamentals & Threat Modeling', diff: 'Beginner', dur: '4 hours', desc: 'CIA Triad, STRIDE threat modeling, defense-in-depth, and principle of least privilege.' },
      { id: 'top-sec-02', title: 'Network Security & Firewalls', diff: 'Intermediate', dur: '5 hours', desc: 'Packet inspection, TCP/IP handshake security, TLS/SSL certificates, and VPN tunneling.' },
      { id: 'top-sec-03', title: 'OWASP Top 10 Web Vulnerability Defense', diff: 'Advanced', dur: '7 hours', desc: 'SQL injection, XSS prevention, CSRF tokens, secure cookies, and input sanitization.' },
      { id: 'top-sec-04', title: 'Identity, Cryptography & Access Control', diff: 'Advanced', dur: '6 hours', desc: 'Symmetric/Asymmetric encryption, RSA, hashing with bcrypt, JWT token signing, and MFA.' },
    ],
    'rm-cs-dsa': [
      { id: 'top-cs-01', title: 'Asymptotic Analysis & Big-O Notation', diff: 'Beginner', dur: '4 hours', desc: 'Time and space complexity, best/worst/average analysis, and algorithmic scalability.' },
      { id: 'top-cs-02', title: 'Linear Data Structures: Arrays, Linked Lists & Stacks', diff: 'Beginner', dur: '6 hours', desc: 'Contiguous memory layout, dynamic arrays, pointer chains, and LIFO/FIFO patterns.' },
      { id: 'top-cs-03', title: 'Trees, Binary Search Trees & Heaps', diff: 'Intermediate', dur: '7 hours', desc: 'Binary trees, balanced AVL trees, heap sort, and priority queues.' },
      { id: 'top-cs-04', title: 'Graph Algorithms: BFS, DFS & Shortest Paths', diff: 'Advanced', dur: '8 hours', desc: 'Adjacency matrix/lists, breadth-first search, depth-first search, and Dijkstra algorithm.' },
      { id: 'top-cs-05', title: 'Dynamic Programming & Memoization', diff: 'Advanced', dur: '9 hours', desc: 'Optimal substructure, overlapping subproblems, memoization vs bottom-up tabulation.' },
    ],
    'rm-frontend-dev': [
      { id: 'top-fe-01', title: 'HTML5 Semantics, Modern CSS & Responsive Layouts', diff: 'Beginner', dur: '5 hours', desc: 'Accessible semantic markup, Flexbox, CSS Grid, and fluid typography.' },
      { id: 'top-fe-02', title: 'JavaScript ES6+, DOM Manipulation & Event Loop', diff: 'Beginner', dur: '6 hours', desc: 'Closures, promises, async/await, event bubbling, and microtask queue execution.' },
      { id: 'top-fe-03', title: 'TypeScript: Static Typing, Interfaces & Generics', diff: 'Intermediate', dur: '6 hours', desc: 'Type narrowing, union types, utility types, generics, and tsconfig configurations.' },
      { id: 'top-fe-04', title: 'React 19 Component Architecture, Hooks & State', diff: 'Intermediate', dur: '8 hours', desc: 'Component lifecycle, custom hooks, context, reconciliation, and concurrent features.' },
      { id: 'top-fe-05', title: 'Next.js App Router, Server Components & Performance', diff: 'Advanced', dur: '7 hours', desc: 'Server components, server actions, streaming, ISR, and Core Web Vitals optimization.' },
    ],
    'rm-db-eng': [
      { id: 'top-dbe-01', title: 'Relational Database Design & Normalization (1NF to BCNF)', diff: 'Beginner', dur: '5 hours', desc: 'Entity-relationship diagrams, foreign keys, normalization rules, and integrity constraints.' },
      { id: 'top-dbe-02', title: 'Advanced SQL: Window Functions, CTEs & Optimization', diff: 'Intermediate', dur: '6 hours', desc: 'Common Table Expressions, partition window functions, and query execution plans.' },
      { id: 'top-dbe-03', title: 'PostgreSQL Indexing: B-Tree, Hash, GIN & GiST', diff: 'Advanced', dur: '7 hours', desc: 'Index selection, covering indexes, vacuuming, and lock contention analysis.' },
      { id: 'top-dbe-04', title: 'Distributed NoSQL & Redis In-Memory Caching', diff: 'Advanced', dur: '6 hours', desc: 'Document schemas with MongoDB, Redis data structures, distributed locking, and cache invalidation.' },
    ],
    'rm-qa-eng': [
      { id: 'top-qa-01', title: 'Software Testing Life Cycle (STLC) & Test Strategy', diff: 'Beginner', dur: '4 hours', desc: 'Test plan creation, test case design, black-box vs white-box, and boundary value testing.' },
      { id: 'top-qa-02', title: 'Unit Testing & Test-Driven Development (TDD)', diff: 'Intermediate', dur: '6 hours', desc: 'Red-green-refactor cycle, assertions, mocks, stubs, and code coverage metrics.' },
      { id: 'top-qa-03', title: 'E2E Browser Automation with Playwright & TypeScript', diff: 'Advanced', dur: '8 hours', desc: 'Page Object Model, auto-waiting, parallel test execution, and visual regression tests.' },
      { id: 'top-qa-04', title: 'API Automation & Performance Load Testing with k6', diff: 'Advanced', dur: '6 hours', desc: 'Postman/Newman collections, load testing with k6, and contract testing with Pact.' },
    ],
    'rm-mobile-dev': [
      { id: 'top-mob-01', title: 'Mobile Architecture & Cross-Platform Fundamentals', diff: 'Beginner', dur: '4 hours', desc: 'Mobile UI paradigms, screen density, touch gestures, and app life cycle states.' },
      { id: 'top-mob-02', title: 'Dart Language & Flutter Reactive Widget Trees', diff: 'Intermediate', dur: '7 hours', desc: 'Null safety, stateless/stateful widgets, layout composition, and animations.' },
      { id: 'top-mob-03', title: 'State Management with Riverpod & Offline SQLite', diff: 'Advanced', dur: '8 hours', desc: 'Reactive state providers, sqflite persistence, sync adapters, and error handling.' },
      { id: 'top-mob-04', title: 'Native Device Hardware Interfacing & Release Builds', diff: 'Advanced', dur: '6 hours', desc: 'Biometric authentication, camera access, push notifications, and App Store signing.' },
    ],
  };

  // Populate topics for each roadmap
  for (const [rmId, topics] of Object.entries(TOPIC_SPECS)) {
    let order = 1;
    let prevTopicId = null;

    for (const t of topics) {
      const prerequisites = prevTopicId ? JSON.stringify([prevTopicId]) : JSON.stringify([]);
      const learningObjectives = JSON.stringify([
        `Understand the foundational principles of ${t.title}.`,
        `Implement clean code and architectural patterns related to ${t.title}.`,
        `Complete hands-on practical lab exercises and verify understanding with knowledge checks.`,
      ]);
      const referenceUrls = JSON.stringify([
        'https://roadmap.sh',
        'https://developer.mozilla.org',
        'https://docs.python.org/3/',
      ]);

      insertTopicStmt.run(
        t.id,
        rmId,
        prevTopicId,
        t.title,
        t.desc,
        order,
        learningObjectives,
        prerequisites,
        t.diff,
        t.dur,
        referenceUrls,
        null,
        null
      );

      prevTopicId = t.id;
      order++;
    }
  }
  console.log('✓ Generated hierarchical topics across career roadmaps.');

  // ========================================================================
  // ATTACH REAL LESSONS, QUIZZES, & EXTERNAL VIDEO RESOURCES
  // ========================================================================
  // Fetch existing courses and lessons to enrich with quizzes and external video resources
  const courses = db.prepare('SELECT id, title, category FROM courses').all();

  const insertQuizStmt = db.prepare(`
    INSERT OR REPLACE INTO quizzes (id, lesson_id, title, description, passing_score)
    VALUES (?, ?, ?, ?, 70)
  `);

  const insertQuestionStmt = db.prepare(`
    INSERT OR REPLACE INTO quiz_questions (id, quiz_id, question_text, explanation, options_json, correct_option_index, position)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVideoResourceStmt = db.prepare(`
    INSERT OR REPLACE INTO topic_video_resources (
      id, lesson_id, video_id, title, channel_name, duration, thumbnail_url, external_url, is_primary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const updateLessonContentStmt = db.prepare(`
    UPDATE lessons SET
      content = ?,
      practical_exercise = ?,
      reference_urls = ?
    WHERE id = ?
  `);

  const lessons = db.prepare('SELECT id, course_id, title, topic_title, video_id, channel_name, duration FROM lessons').all();

  for (const lesson of lessons) {
    const course = courses.find((c) => c.id === lesson.course_id);
    const categoryName = course ? course.category : 'Engineering';

    // 1. Structured Educational Content
    const detailedContent = `# ${lesson.title}

## Conceptual Overview & Engineering Theory
In modern ${categoryName}, mastering **${lesson.title}** is fundamental to designing reliable, fault-tolerant, and performant systems. Rather than relying on superficial implementations, enterprise software requires deep understanding of system mechanics, memory utilization, and predictable runtime behavior.

### Architectural Principles
1. **Separation of Concerns:** Keep core domain logic isolated from external delivery mechanisms and transport protocols.
2. **Deterministic State Management:** Avoid hidden side-effects by employing pure functions, immutable data structures, and explicit transactional boundaries.
3. **Data Integrity & Verification:** Leverage relational constraints and type validation at every ingress boundary.

\`\`\`javascript
// Practical Implementation Pattern: ${lesson.title}
export class SystemComponent {
  constructor(config = {}) {
    this.config = Object.freeze({ ...config });
    this.status = 'READY';
  }

  async executeTask(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid payload received: Object expected.');
    }
    
    // Core processing pipeline
    const startTime = Date.now();
    const result = await this.processInternal(payload);
    const durationMs = Date.now() - startTime;

    return {
      success: true,
      data: result,
      executionTimeMs: durationMs,
    };
  }

  async processInternal(data) {
    return { status: 'PROCESSED', timestamp: new Date().toISOString() };
  }
}
\`\`\`

### Common Pitfalls to Avoid
- **Unbounded Resource Allocation:** Always configure timeouts, connection pools, and circuit breakers.
- **Premature Optimization:** Benchmark your critical paths using representative production workloads before altering data models.
`;

    // 2. Practical Lab Exercise
    const practicalExercise = `## Hands-On Practical Lab: ${lesson.title}

### Objective
Implement the theoretical concepts demonstrated in this lesson and verify behavior under simulated runtime constraints.

### Task Instructions
1. Review the \`SystemComponent\` architectural pattern illustrated above.
2. Extend the class to accept a concurrency limit parameter (\`maxConcurrentTasks = 5\`).
3. Implement an internal queue that buffers tasks when capacity is reached.
4. Add input validation ensuring malformed payloads reject with descriptive error messages.
5. Verify your solution by running unit tests or executing the verification script.`;

    // 3. Official References
    const referenceUrls = JSON.stringify([
      'https://roadmap.sh',
      'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      'https://www.freecodecamp.org/news/',
    ]);

    updateLessonContentStmt.run(detailedContent, practicalExercise, referenceUrls, lesson.id);

    // 4. In-App Video Resource
    const effectiveVideoId = lesson.video_id || 'bMknfKXIFA8';
    const videoTitle = `${lesson.title} — Technical Deep Dive`;
    const channelName = lesson.channel_name || 'Edunova Technologies Engineering';
    const videoDuration = lesson.duration || '24:30';
    const externalUrl = '';
    const thumbnailUrl = `https://i.ytimg.com/vi/${effectiveVideoId}/hqdefault.jpg`;

    insertVideoResourceStmt.run(
      `v-${lesson.id}`,
      lesson.id,
      effectiveVideoId,
      videoTitle,
      channelName,
      videoDuration,
      thumbnailUrl,
      externalUrl
    );

    // 5. Knowledge-Check Quiz
    const quizId = `q-${lesson.id}`;
    insertQuizStmt.run(
      quizId,
      lesson.id,
      `Knowledge Check: ${lesson.title}`,
      `Evaluate your comprehension of the core concepts and design patterns covered in this lesson.`
    );

    // Add 2 questions per quiz
    insertQuestionStmt.run(
      `qq-${lesson.id}-1`,
      quizId,
      `What is the primary architectural advantage of isolating domain logic from external delivery mechanisms in ${lesson.title}?`,
      `Decoupling business logic ensures system components can be tested independently and adapted across different protocols without rewriting core rules.`,
      JSON.stringify([
        'It eliminates the need for database indexing',
        'It maximizes testability and allows flexible protocol adaptation',
        'It automatically prevents all network latency',
        'It restricts code execution to a single core',
      ]),
      1,
      1
    );

    insertQuestionStmt.run(
      `qq-${lesson.id}-2`,
      quizId,
      `When processing asynchronous payloads, what is the best practice to prevent unhandled service degradation?`,
      `Configuring explicit timeouts and bounded buffers protects system resources from cascading failure when downstream dependencies stall.`,
      JSON.stringify([
        'Ignoring errors and returning default empty strings',
        'Executing all operations synchronously in blocking mode',
        'Enforcing explicit timeouts, circuit breakers, and bounded queues',
        'Increasing client-side retry limits infinitely',
      ]),
      2,
      2
    );
  }

  console.log(`✓ Enriched ${lessons.length} lessons with structured content, quizzes, and external video resources.`);
  console.log('Seeding Multi-Domain LMS Completed Successfully!');
}

seedMultiDomainData();

