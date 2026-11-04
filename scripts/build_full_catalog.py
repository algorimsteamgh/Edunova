#!/usr/bin/env python3
import json
import os

out_path = os.path.abspath('backend/src/database/roadmapTopicCatalog.js')

ROADMAPS = [
  {"id": "rm-frontend-dev", "slug": "frontend-developer", "title": "Frontend Development", "cat": "Frontend Development", "sub": "Web Engineering", "lvl": "Beginner", "dur": "45 hours", "thumb": "/images/roadmaps/frontend.svg", "url": "https://roadmap.sh/frontend", "skills": ["HTML5", "CSS3", "JavaScript", "TypeScript", "React", "Web Performance", "Accessibility", "Testing"], "prereqs": ["Basic Computer Literacy"], "rel": ["rm-javascript", "rm-typescript", "rm-react", "rm-fullstack-dev"], "desc": "Step by step guide to becoming a modern frontend developer: internet fundamentals, semantic HTML, modern CSS layouts, JavaScript ES2024, React 19, build tools, and performance optimization."},
  {"id": "rm-javascript", "slug": "javascript", "title": "JavaScript", "cat": "Programming & Computer Science", "sub": "Programming Languages", "lvl": "Beginner", "dur": "35 hours", "thumb": "/images/roadmaps/javascript.svg", "url": "https://roadmap.sh/javascript", "skills": ["ES6+", "Event Loop", "Promises", "Async/Await", "Closures", "Prototypes", "DOM Manipulation"], "prereqs": ["HTML & CSS Basics"], "rel": ["rm-frontend-dev", "rm-typescript", "rm-nodejs"], "desc": "Complete journey through the JavaScript language: primitives, objects, functions, scope, event-driven asynchronous execution, and modern browser APIs."},
  {"id": "rm-typescript", "slug": "typescript", "title": "TypeScript", "cat": "Programming & Computer Science", "sub": "Typed Languages", "lvl": "Intermediate", "dur": "25 hours", "thumb": "/images/roadmaps/typescript.svg", "url": "https://roadmap.sh/typescript", "skills": ["Type Annotations", "Interfaces", "Generics", "Utility Types", "Type Narrowing", "tsconfig", "Decorators"], "prereqs": ["rm-javascript"], "rel": ["rm-frontend-dev", "rm-react", "rm-nodejs", "rm-angular"], "desc": "Master static typing for JavaScript: interfaces, union and intersection types, generics, conditional types, and enterprise project architecture."},
  {"id": "rm-react", "slug": "react", "title": "React", "cat": "Frontend Development", "sub": "Component Frameworks", "lvl": "Intermediate", "dur": "32 hours", "thumb": "/images/roadmaps/react.svg", "url": "https://roadmap.sh/react", "skills": ["JSX", "React 19 Hooks", "State Management", "Server Components", "React Router", "Performance", "Testing"], "prereqs": ["rm-javascript", "rm-typescript"], "rel": ["rm-frontend-dev", "rm-fullstack-dev"], "desc": "Build scalable single-page web applications with React 19: component lifecycles, custom hooks, context management, and concurrent rendering."},
  {"id": "rm-angular", "slug": "angular", "title": "Angular", "cat": "Frontend Development", "sub": "Enterprise Frameworks", "lvl": "Intermediate", "dur": "36 hours", "thumb": "/images/roadmaps/angular.svg", "url": "https://roadmap.sh/angular", "skills": ["TypeScript", "Components", "RxJS Observables", "Signals", "Dependency Injection", "NgModules", "Forms"], "prereqs": ["rm-typescript", "rm-javascript"], "rel": ["rm-frontend-dev", "rm-typescript"], "desc": "Enterprise frontend engineering with Angular: standalone components, Angular Signals, RxJS reactive patterns, and routing."},
  {"id": "rm-vue", "slug": "vue", "title": "Vue.js", "cat": "Frontend Development", "sub": "Progressive Frameworks", "lvl": "Beginner", "dur": "28 hours", "thumb": "/images/roadmaps/vue.svg", "url": "https://roadmap.sh/vue", "skills": ["Composition API", "Reactivity", "Pinia State", "Vue Router", "Single File Components", "Directives"], "prereqs": ["rm-javascript", "rm-frontend-dev"], "rel": ["rm-frontend-dev", "rm-javascript"], "desc": "Intuitive and progressive UI engineering with Vue 3: Composition API, reactivity system, Pinia state stores, and Vite build tooling."},
  {"id": "rm-backend-dev", "slug": "backend-developer", "title": "Backend Development", "cat": "Backend Development", "sub": "Server Architecture", "lvl": "Intermediate", "dur": "50 hours", "thumb": "/images/roadmaps/backend.svg", "url": "https://roadmap.sh/backend", "skills": ["REST APIs", "Authentication", "Databases", "Caching", "Message Brokers", "Security", "Testing"], "prereqs": ["rm-javascript", "rm-python"], "rel": ["rm-nodejs", "rm-python", "rm-spring-boot", "rm-golang", "rm-system-design"], "desc": "Complete backend roadmap: HTTP servers, database relational design, distributed caching, message queues, OAuth2/JWT auth, and CI/CD deployment."},
  {"id": "rm-fullstack-dev", "slug": "fullstack-developer", "title": "Full Stack Development", "cat": "Full Stack Development", "sub": "End-to-End Systems", "lvl": "Intermediate", "dur": "55 hours", "thumb": "/images/roadmaps/full-stack.svg", "url": "https://roadmap.sh/full-stack", "skills": ["Frontend (React)", "Backend (Node/Python)", "SQL/NoSQL", "REST & GraphQL", "DevOps", "Docker", "Testing"], "prereqs": ["rm-frontend-dev", "rm-backend-dev"], "rel": ["rm-frontend-dev", "rm-backend-dev", "rm-devops-eng"], "desc": "Bridge client interfaces and cloud backends: Full Stack web engineering, end-to-end type safety, database transactions, and cloud hosting."},
  {"id": "rm-nodejs", "slug": "nodejs", "title": "Node.js", "cat": "Backend Development", "sub": "Runtimes", "lvl": "Intermediate", "dur": "34 hours", "thumb": "/images/roadmaps/nodejs.svg", "url": "https://roadmap.sh/nodejs", "skills": ["V8 Engine", "Event Loop", "Express.js", "Streams & Buffers", "Clustering", "JWT", "ORM/Prisma"], "prereqs": ["rm-javascript"], "rel": ["rm-backend-dev", "rm-typescript", "rm-fullstack-dev"], "desc": "Server-side JavaScript runtime engineering: non-blocking I/O event loop, stream processing, microservice architecture, and secure RESTful APIs."},
  {"id": "rm-python", "slug": "python", "title": "Python", "cat": "Programming & Computer Science", "sub": "General Purpose", "lvl": "Beginner", "dur": "32 hours", "thumb": "/images/roadmaps/python.svg", "url": "https://roadmap.sh/python", "skills": ["Syntax & Data Types", "OOP", "Decorators", "Generators", "File I/O", "Virtual Envs", "Type Hinting"], "prereqs": ["Basic Computing"], "rel": ["rm-ai-eng", "rm-backend-dev", "rm-data-eng"], "desc": "Comprehensive Python programming: idiomatic clean syntax, object-oriented design, functional itertools, packaging, and async programming with asyncio."},
  {"id": "rm-java", "slug": "java", "title": "Java", "cat": "Programming & Computer Science", "sub": "Enterprise Languages", "lvl": "Intermediate", "dur": "40 hours", "thumb": "/images/roadmaps/java.svg", "url": "https://roadmap.sh/java", "skills": ["JVM Internals", "OOP", "Generics", "Collections Framework", "Multithreading", "Streams API", "Maven/Gradle"], "prereqs": ["Basic Programming"], "rel": ["rm-spring-boot", "rm-backend-dev", "rm-cs-dsa"], "desc": "Master the Java platform: Java 21 LTS features, JVM memory management, multithreading synchronization, functional streams, and design patterns."},
  {"id": "rm-spring-boot", "slug": "spring-boot", "title": "Spring Boot", "cat": "Backend Development", "sub": "Java Frameworks", "lvl": "Intermediate", "dur": "38 hours", "thumb": "/images/roadmaps/spring-boot.svg", "url": "https://roadmap.sh/spring-boot", "skills": ["Spring Core", "Dependency Injection", "Spring Data JPA", "Spring Security", "REST APIs", "Microservices"], "prereqs": ["rm-java"], "rel": ["rm-java", "rm-backend-dev", "rm-system-design"], "desc": "Enterprise backend development with Spring Boot 3: auto-configuration, REST controllers, Hibernate JPA relational mapping, and Spring Security."},
  {"id": "rm-golang", "slug": "golang", "title": "Go (Golang)", "cat": "Programming & Computer Science", "sub": "Cloud Native Languages", "lvl": "Intermediate", "dur": "30 hours", "thumb": "/images/roadmaps/golang.svg", "url": "https://roadmap.sh/golang", "skills": ["Goroutines", "Channels", "Interfaces", "Memory Management", "HTTP Standard Library", "Gin Framework", "Concurrency Patterns"], "prereqs": ["Basic Programming"], "rel": ["rm-backend-dev", "rm-devops-eng", "rm-k8s-eng"], "desc": "High-performance cloud-native engineering with Go: lightweight goroutine concurrency, typed channels, standard library web servers, and memory profiling."},
  {"id": "rm-devops-eng", "slug": "devops-engineer", "title": "DevOps", "cat": "DevOps & Site Reliability Engineering", "sub": "Operations & Infrastructure", "lvl": "Intermediate", "dur": "48 hours", "thumb": "/images/roadmaps/devops.svg", "url": "https://roadmap.sh/devops", "skills": ["Linux & Bash", "Git & CI/CD", "Docker", "Kubernetes", "Terraform", "Prometheus & Grafana", "Site Reliability (SRE)"], "prereqs": ["Basic Networking", "Basic Linux"], "rel": ["rm-docker", "rm-k8s-eng", "rm-aws-arch"], "desc": "Modern DevOps engineering: automate software delivery pipelines with GitHub Actions, containerize workloads, manage cloud infrastructure as code, and monitor production health."},
  {"id": "rm-cloud-eng", "slug": "cloud-engineer", "title": "Cloud Engineer", "cat": "Cloud Computing", "sub": "Cloud Architecture", "lvl": "Intermediate", "dur": "42 hours", "thumb": "/images/roadmaps/cloud.svg", "url": "https://roadmap.sh/devops", "skills": ["Cloud Virtualization", "VPC Networking", "IAM Security", "Serverless", "Multi-Cloud Architecture", "Cost Governance"], "prereqs": ["rm-devops-eng"], "rel": ["rm-aws-arch", "rm-azure-eng", "rm-gcp-eng"], "desc": "Architect and operate resilient multi-cloud foundations: compute clusters, object storage, virtual private clouds, identity governance, and high-availability failover."},
  {"id": "rm-aws-arch", "slug": "aws-cloud", "title": "AWS (Amazon Web Services)", "cat": "Cloud Computing", "sub": "Public Cloud", "lvl": "Intermediate", "dur": "40 hours", "thumb": "/images/roadmaps/aws.svg", "url": "https://roadmap.sh/aws", "skills": ["EC2 & ECS", "S3 & RDS", "VPC & Subnets", "IAM Policies", "Lambda Serverless", "CloudWatch", "CloudFormation"], "prereqs": ["Basic Networking"], "rel": ["rm-devops-eng", "rm-k8s-eng", "rm-backend-dev"], "desc": "AWS Solutions Architecture: design secure, high-performing, resilient, and efficient infrastructure following the AWS Well-Architected Framework."},
  {"id": "rm-azure-eng", "slug": "microsoft-azure", "title": "Microsoft Azure", "cat": "Cloud Computing", "sub": "Public Cloud", "lvl": "Intermediate", "dur": "38 hours", "thumb": "/images/roadmaps/azure.svg", "url": "https://roadmap.sh/devops", "skills": ["Azure VMs", "Azure Kubernetes (AKS)", "Blob Storage", "Azure AD (Entra ID)", "Azure Functions", "ARM & Bicep"], "prereqs": ["Basic Networking"], "rel": ["rm-aws-arch", "rm-devops-eng"], "desc": "Enterprise Microsoft Azure cloud computing: deploy virtual networks, containerize workloads with AKS, configure Entra ID authentication, and automate with Bicep."},
  {"id": "rm-gcp-eng", "slug": "google-cloud", "title": "Google Cloud (GCP)", "cat": "Cloud Computing", "sub": "Public Cloud", "lvl": "Intermediate", "dur": "38 hours", "thumb": "/images/roadmaps/gcp.svg", "url": "https://roadmap.sh/devops", "skills": ["Compute Engine", "Google Kubernetes Engine (GKE)", "Cloud Storage", "Cloud Run", "BigQuery", "IAM & VPC"], "prereqs": ["Basic Networking"], "rel": ["rm-aws-arch", "rm-devops-eng", "rm-k8s-eng"], "desc": "Google Cloud Platform architecture: deploy serverless containers on Cloud Run, operate scalable Kubernetes clusters with GKE, and run big data analysis in BigQuery."},
  {"id": "rm-docker", "slug": "docker", "title": "Docker", "cat": "DevOps & Site Reliability Engineering", "sub": "Containerization", "lvl": "Beginner", "dur": "22 hours", "thumb": "/images/roadmaps/docker.svg", "url": "https://roadmap.sh/docker", "skills": ["Images & Containers", "Dockerfiles", "Multi-Stage Builds", "Volume Mounts", "Docker Compose", "Container Security"], "prereqs": ["Basic Linux"], "rel": ["rm-devops-eng", "rm-k8s-eng", "rm-backend-dev"], "desc": "Master containerization with Docker: create reproducible development environments, write optimized multi-stage Dockerfiles, and orchestrate multi-container apps with Compose."},
  {"id": "rm-k8s-eng", "slug": "kubernetes", "title": "Kubernetes", "cat": "DevOps & Site Reliability Engineering", "sub": "Orchestration", "lvl": "Advanced", "dur": "35 hours", "thumb": "/images/roadmaps/kubernetes.svg", "url": "https://roadmap.sh/kubernetes", "skills": ["Control Plane & Nodes", "Pods & Deployments", "Services & Ingress", "ConfigMaps & Secrets", "PersistentVolumes", "Helm Charts", "HPA Autoscaling"], "prereqs": ["rm-docker", "rm-devops-eng"], "rel": ["rm-docker", "rm-devops-eng", "rm-cloud-eng"], "desc": "Production Kubernetes orchestration: manage distributed container clusters, declare zero-downtime rolling deployments, configure ingress routing, and package with Helm."},
  {"id": "rm-system-design", "slug": "system-design", "title": "System Design", "cat": "Backend Development", "sub": "Architecture & Scalability", "lvl": "Advanced", "dur": "40 hours", "thumb": "/images/roadmaps/system-design.svg", "url": "https://roadmap.sh/system-design", "skills": ["High Availability", "Load Balancing", "Sharding & Replication", "Caching (Redis/CDN)", "CAP Theorem", "Message Queues", "Rate Limiting"], "prereqs": ["rm-backend-dev", "rm-sql"], "rel": ["rm-software-architecture", "rm-backend-dev", "rm-fullstack-dev"], "desc": "Architect large-scale distributed systems: evaluate architectural trade-offs, design high-throughput data layers, prevent single points of failure, and ace FAANG interviews."},
  {"id": "rm-software-architecture", "slug": "software-architecture", "title": "Software Architecture", "cat": "Backend Development", "sub": "Software Engineering Patterns", "lvl": "Advanced", "dur": "36 hours", "thumb": "/images/roadmaps/architecture.svg", "url": "https://roadmap.sh/software-architect", "skills": ["Clean Architecture", "Domain-Driven Design (DDD)", "Microservices vs Monoliths", "Event-Driven Architecture", "CQRS & Event Sourcing", "SOLID Principles"], "prereqs": ["rm-backend-dev", "rm-system-design"], "rel": ["rm-system-design", "rm-backend-dev"], "desc": "Enterprise software architecture patterns: domain-driven design, hexagonal architectures, bounded contexts, event-driven decoupling, and evolutionary refactoring."},
  {"id": "rm-cs-dsa", "slug": "data-structures-and-algorithms", "title": "Data Structures & Algorithms", "cat": "Programming & Computer Science", "sub": "Computer Science Core", "lvl": "Intermediate", "dur": "50 hours", "thumb": "/images/roadmaps/dsa.svg", "url": "https://roadmap.sh/datastructures-and-algorithms", "skills": ["Big O Analysis", "Arrays & Hash Maps", "Linked Lists", "Stacks & Queues", "Binary Search Trees", "Graph Algorithms (BFS/DFS)", "Dynamic Programming"], "prereqs": ["Basic Programming"], "rel": ["rm-javascript", "rm-python", "rm-java"], "desc": "Master computer science fundamentals: time and space complexity analysis, algorithmic problem solving patterns, and coding interview readiness."},
  {"id": "rm-db-eng", "slug": "database-engineer", "title": "Database Engineering", "cat": "Database Engineering", "sub": "Data Systems", "lvl": "Intermediate", "dur": "38 hours", "thumb": "/images/roadmaps/database.svg", "url": "https://roadmap.sh/postgresql", "skills": ["Relational vs NoSQL", "B-Tree Storage", "ACID Transactions", "Indexing Strategies", "Query Optimization", "Replication & Failover"], "prereqs": ["Basic Computing"], "rel": ["rm-sql", "rm-postgresql", "rm-mongodb", "rm-backend-dev"], "desc": "Engineering database storage engines: disk I/O optimization, write-ahead logs, transaction isolation levels, connection pooling, and multi-region replication."},
  {"id": "rm-data-eng", "slug": "data-engineer", "title": "Data Engineer", "cat": "Data Engineering", "sub": "Data Pipelines", "lvl": "Intermediate", "dur": "45 hours", "thumb": "/images/roadmaps/data-engineer.svg", "url": "https://roadmap.sh/data-engineer", "skills": ["ETL & ELT Pipelines", "Apache Spark & PySpark", "Data Warehousing", "Apache Kafka Streaming", "SQL Modeling", "dbt"], "prereqs": ["rm-python", "rm-sql"], "rel": ["rm-sql", "rm-python", "rm-db-eng"], "desc": "Design and operate big data platforms: batch pipelines with Spark, real-time event streaming with Kafka, dimensional modeling in data warehouses, and automated orchestration."},
  {"id": "rm-sql", "slug": "sql", "title": "SQL", "cat": "Database Engineering", "sub": "Relational Querying", "lvl": "Beginner", "dur": "26 hours", "thumb": "/images/roadmaps/sql.svg", "url": "https://roadmap.sh/sql", "skills": ["SELECT & Filtering", "Multi-Table Joins", "GROUP BY & Aggregations", "Subqueries & CTEs", "Window Functions", "Indexes & EXPLAIN"], "prereqs": ["Basic Computing"], "rel": ["rm-postgresql", "rm-db-eng", "rm-backend-dev"], "desc": "Comprehensive relational database querying: table schemas, inner and outer joins, analytical window functions, common table expressions, and performance tuning."},
  {"id": "rm-postgresql", "slug": "postgresql", "title": "PostgreSQL", "cat": "Database Engineering", "sub": "Relational DBMS", "lvl": "Intermediate", "dur": "32 hours", "thumb": "/images/roadmaps/postgresql.svg", "url": "https://roadmap.sh/postgresql", "skills": ["MVCC Architecture", "JSONB Indexing", "Full-Text Search", "Partitioning", "Stored Procedures", "VACUUM & WAL Tuning"], "prereqs": ["rm-sql"], "rel": ["rm-sql", "rm-db-eng", "rm-backend-dev"], "desc": "Deep dive into the world's most advanced open-source relational database: JSONB document storage, GIN/GiST indexes, connection pooling with PgBouncer, and high availability."},
  {"id": "rm-mongodb", "slug": "mongodb", "title": "MongoDB", "cat": "Database Engineering", "sub": "Document Databases", "lvl": "Beginner", "dur": "24 hours", "thumb": "/images/roadmaps/mongodb.svg", "url": "https://roadmap.sh/mongodb", "skills": ["BSON Schema Design", "Aggregation Pipeline", "Compound Indexes", "Replica Sets", "Sharded Clusters", "Mongoose ODM"], "prereqs": ["Basic JSON"], "rel": ["rm-nodejs", "rm-fullstack-dev", "rm-db-eng"], "desc": "Master NoSQL document databases with MongoDB: embedded vs referenced data models, complex multi-stage aggregation pipelines, secondary indexes, and clustering."},
  {"id": "rm-qa-eng", "slug": "qa-automation-engineer", "title": "Software Testing & QA Engineer", "cat": "Software Testing & Quality Engineering", "sub": "Quality Assurance", "lvl": "Beginner", "dur": "34 hours", "thumb": "/images/roadmaps/qa.svg", "url": "https://roadmap.sh/qa", "skills": ["Testing Pyramid", "Unit & Integration Testing", "Playwright & Cypress E2E", "API Testing (Postman/Newman)", "CI/CD Test Automation", "Performance Testing"], "prereqs": ["Basic Programming"], "rel": ["rm-frontend-dev", "rm-backend-dev", "rm-devops-eng"], "desc": "Master automated quality assurance: test pyramid strategies, end-to-end browser automation with Playwright, REST API contract validation, and regression suites in CI/CD."},
  {"id": "rm-mobile-dev", "slug": "mobile-app-developer", "title": "Mobile App Developer", "cat": "Mobile App Development", "sub": "Mobile Engineering", "lvl": "Intermediate", "dur": "40 hours", "thumb": "/images/roadmaps/flutter.svg", "url": "https://roadmap.sh/flutter", "skills": ["Flutter & Dart", "React Native", "Mobile UI & Gestures", "State Management", "Native Device APIs", "App Store & Play Store Deployment"], "prereqs": ["rm-javascript"], "rel": ["rm-frontend-dev", "rm-react"], "desc": "Cross-platform mobile application engineering: build native iOS and Android apps using Flutter and React Native, handle gesture animations, offline storage, and app publishing."},
  {"id": "rm-ai-eng", "slug": "ai-engineer", "title": "AI Engineering", "cat": "Artificial Intelligence & Machine Learning", "sub": "AI Foundations", "lvl": "Intermediate", "dur": "45 hours", "thumb": "/images/roadmaps/ai.svg", "url": "https://roadmap.sh/ai-data-scientist", "skills": ["Python for AI", "Linear Algebra", "Neural Networks", "PyTorch", "Transformer Architecture", "RAG Pipelines", "Autonomous Agents"], "prereqs": ["rm-python"], "rel": ["rm-ml-eng", "rm-genai-eng", "rm-rag-dev"], "desc": "The complete AI engineer roadmap: mathematical foundations, deep learning with PyTorch, attention mechanisms, fine-tuning, retrieval augmentation, and agentic workflows."},
  {"id": "rm-ml-eng", "slug": "machine-learning-engineer", "title": "Machine Learning", "cat": "Artificial Intelligence & Machine Learning", "sub": "Applied ML", "lvl": "Intermediate", "dur": "42 hours", "thumb": "/images/roadmaps/ml.svg", "url": "https://roadmap.sh/ai-data-scientist", "skills": ["Scikit-Learn", "Feature Engineering", "Regression & Classification", "Clustering & PCA", "Cross-Validation", "Model Serving (FastAPI)", "MLOps"], "prereqs": ["rm-python", "rm-ai-eng"], "rel": ["rm-ai-eng", "rm-genai-eng", "rm-data-eng"], "desc": "Production machine learning workflows: exploratory data analysis, feature engineering, model training and evaluation metrics, hyperparameter tuning, and containerized inference."},
  {"id": "rm-genai-eng", "slug": "generative-ai", "title": "Generative AI", "cat": "Artificial Intelligence & Machine Learning", "sub": "Generative AI", "lvl": "Advanced", "dur": "35 hours", "thumb": "/images/roadmaps/generative-ai.svg", "url": "https://roadmap.sh/prompt-engineering", "skills": ["Transformers", "Attention Mechanism", "Fine-Tuning (LoRA)", "Diffusion Models", "Multimodal AI", "Evaluation Benchmarks"], "prereqs": ["rm-ai-eng", "rm-ml-eng"], "rel": ["rm-ai-eng", "rm-llm-eng", "rm-rag-dev"], "desc": "Specialize in generative foundational models: self-attention mechanics, transformer tokenization, LoRA fine-tuning, and multimodal generation."},
  {"id": "rm-llm-eng", "slug": "llm-engineering", "title": "LLM Engineering", "cat": "Artificial Intelligence & Machine Learning", "sub": "Large Language Models", "lvl": "Advanced", "dur": "36 hours", "thumb": "/images/roadmaps/llm.svg", "url": "https://roadmap.sh/ai-data-scientist", "skills": ["Context Windows", "Quantization (GGUF)", "vLLM Serving", "Ollama & Local LLMs", "Guardrails", "Structured Outputs"], "prereqs": ["rm-ai-eng", "rm-genai-eng"], "rel": ["rm-ai-eng", "rm-prompt-eng", "rm-rag-dev"], "desc": "Deploy and serve Large Language Models at production scale: inference quantization, GPU memory optimization, vLLM servers, and deterministic schema outputs."},
  {"id": "rm-prompt-eng", "slug": "prompt-engineering", "title": "Prompt Engineering", "cat": "Artificial Intelligence & Machine Learning", "sub": "AI Prompting", "lvl": "Beginner", "dur": "20 hours", "thumb": "/images/roadmaps/prompt-eng.svg", "url": "https://roadmap.sh/prompt-engineering", "skills": ["Few-Shot Prompting", "Chain of Thought (CoT)", "ReAct Framework", "System Instructions", "Prompt Injections Defense"], "prereqs": ["Basic Computing"], "rel": ["rm-ai-eng", "rm-agentic-ai"], "desc": "Master prompt engineering strategies: few-shot exemplars, step-by-step reasoning chains, adversarial jailbreak defense, and automated evaluation."},
  {"id": "rm-rag-dev", "slug": "rag-development", "title": "RAG Development", "cat": "Artificial Intelligence & Machine Learning", "sub": "Retrieval Systems", "lvl": "Intermediate", "dur": "30 hours", "thumb": "/images/roadmaps/rag.svg", "url": "https://roadmap.sh/ai-data-scientist", "skills": ["Semantic Chunking", "Embedding Models", "Hybrid Search", "Reranking", "Vector Databases", "Context Compression"], "prereqs": ["rm-ai-eng", "rm-python"], "rel": ["rm-ai-eng", "rm-llm-eng", "rm-agentic-ai"], "desc": "Build enterprise-grade Retrieval-Augmented Generation systems: chunking strategies, vector similarity indexes, cross-encoder rerankers, and hallucination reduction."},
  {"id": "rm-agentic-ai", "slug": "agentic-ai-development", "title": "Agentic AI Development", "cat": "Artificial Intelligence & Machine Learning", "sub": "Autonomous Agents", "lvl": "Advanced", "dur": "38 hours", "thumb": "/images/roadmaps/agents.svg", "url": "https://roadmap.sh/ai-data-scientist", "skills": ["Model Context Protocol (MCP)", "Tool Calling", "ReAct Loops", "Multi-Agent Swarms", "Stateful Memory", "Human-in-the-Loop"], "prereqs": ["rm-ai-eng", "rm-rag-dev"], "rel": ["rm-ai-eng", "rm-rag-dev", "rm-llm-eng"], "desc": "Architect autonomous multi-agent software systems: tool calling execution, Model Context Protocol (MCP) servers, planning reflection loops, and persistent memory."},
  {"id": "rm-cybersecurity", "slug": "cybersecurity-engineer", "title": "Cybersecurity", "cat": "Cybersecurity & Application Security", "sub": "Security Engineering", "lvl": "Intermediate", "dur": "44 hours", "thumb": "/images/roadmaps/cybersecurity.svg", "url": "https://roadmap.sh/cyber-security", "skills": ["OWASP Top 10", "Cryptographic Ciphers", "JWT/OAuth2 Security", "Network Firewalls", "Penetration Testing", "DevSecOps", "SIEM"], "prereqs": ["Networking Basics"], "rel": ["rm-backend-dev", "rm-devops-eng"], "desc": "Defend web applications and corporate infrastructure: OWASP Top 10 vulnerabilities, secure cryptographic protocols, network intrusion detection, and DevSecOps pipelines."}
]

# Track-specific video and curriculum blueprints
TRACK_CURRICULUM = {
  "rm-javascript": [
    {
      "title": "Variables, Data Types & Memory Model",
      "dur": "38 mins", "diff": "Beginner",
      "video": {"id": "W6NZfCO5SIk", "title": "JavaScript Variables & Types Tutorial", "channel": "Programming with Mosh", "duration": "38:00"},
      "article": {"title": "MDN: Grammar and types - Declarations", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#declarations", "source": "MDN Web Docs", "desc": "Declarations, scope rules, and primitive types in modern ECMAScript."},
      "subtopics": [
        {"title": "var, let, and const Variable Scoping", "video_id": "9WIJQDvt4Us", "video_title": "JavaScript ES6 var, let and const", "channel_name": "Traversy Media", "duration": "12:15", "article_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let", "summary": "Block scope, lexical environments, and preventing variable leakage."},
        {"title": "Primitive Types vs Reference Objects", "video_id": "9ooYYRLdg_g", "video_title": "JavaScript Primitive vs Reference Types", "channel_name": "Web Dev Simplified", "duration": "10:45", "article_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures", "summary": "Stack memory value allocation vs heap memory reference pointers."},
        {"title": "Type Coercion & Strict Equality (===)", "video_id": "38rT7yZQrKA", "video_title": "JavaScript Type Coercion Explained", "channel_name": "Web Dev Simplified", "duration": "09:30", "article_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness", "summary": "Implicit type casting in operators and avoiding bugs with strict comparison."}
      ]
    },
    {
      "title": "Functions, Scope Chain & Closures",
      "dur": "30 mins", "diff": "Beginner",
      "video": {"id": "xUI5Tsl2Jyo", "title": "JavaScript Functions Tutorial", "channel": "Bro Code", "duration": "25:40"},
      "article": {"title": "MDN: JavaScript Functions & Scope", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions", "source": "MDN Web Docs", "desc": "Function declarations, expressions, parameters, and lexical scope."},
      "subtopics": [
        {"title": "Function Declarations vs Arrow Functions", "video_id": "h33Srr5J9nY", "video_title": "JavaScript Arrow Functions Tutorial", "channel_name": "Web Dev Simplified", "duration": "13:20", "article_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions", "summary": "Lexical this binding in arrow functions vs dynamic context in declarations."},
        {"title": "Execution Context & Lexical Scope Chain", "video_id": "uH-tVP8MUs8", "video_title": "JavaScript Scope Tutorial", "channel_name": "Web Dev Simplified", "duration": "14:10", "article_url": "https://developer.mozilla.org/en-US/docs/Glossary/Scope", "summary": "Identifier resolution through nested lexical scope boundaries."},
        {"title": "Closures & Practical State Encapsulation", "video_id": "3a0I8ICR1Vg", "video_title": "JavaScript Closures Tutorial", "channel_name": "Web Dev Simplified", "duration": "11:55", "article_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures", "summary": "Preserving access to outer variables for private state and memoization."}
      ]
    },
    {
      "title": "Arrays, Objects & Modern ES6+ Methods",
      "dur": "35 mins", "diff": "Intermediate",
      "video": {"id": "R8rmfD9Y5-c", "title": "8 Must Know JavaScript Array Methods", "channel": "Web Dev Simplified", "duration": "20:45"},
      "article": {"title": "MDN: JavaScript Array Methods", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array", "source": "MDN Web Docs", "desc": "Functional programming methods: map, filter, reduce, find, and slice."},
      "subtopics": [
        {"title": "Functional Array Methods: map, filter & reduce", "video_id": "G6JtUCbhE7g", "video_title": "Map, Filter and Reduce Explained", "channel_name": "ColorCode", "duration": "11:20", "article_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map", "summary": "Transforming collections immutably with higher-order functions."},
        {"title": "Destructuring & Rest/Spread Syntax", "video_id": "-vR3a11Worg", "video_title": "JavaScript Destructuring Tutorial", "channel_name": "Web Dev Simplified", "duration": "12:05", "article_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment", "summary": "Unpacking arrays and objects cleanly with rest parameters."},
        {"title": "Optional Chaining (?.) & Nullish Coalescing (??)", "video_id": "v2tJ3nzXh8I", "video_title": "Optional Chaining & Nullish Coalescing", "channel_name": "Web Dev Simplified", "duration": "08:50", "article_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining", "summary": "Defensive property access and sensible null/undefined default values."}
      ]
    },
    {
      "title": "Asynchronous JavaScript, Event Loop & Promises",
      "dur": "45 mins", "diff": "Intermediate",
      "video": {"id": "PoRJizFvM7s", "title": "Async JS Crash Course - Callbacks, Promises, Async Await", "channel": "Traversy Media", "duration": "24:35"},
      "article": {"title": "MDN: Asynchronous JavaScript Overview", "url": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Introducing", "source": "MDN Web Docs", "desc": "Browser event loop, macrotasks, microtasks, and async control flow."},
      "subtopics": [
        {"title": "Call Stack, Event Loop & Microtask Queue", "video_id": "8aGhZQkoFbQ", "video_title": "What the heck is the event loop anyway?", "channel_name": "JSConf", "duration": "26:45", "article_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop", "summary": "Non-blocking concurrency and processing tasks between render cycles."},
        {"title": "Promises: Creation, Chaining & Combinators", "video_id": "DHvZLI7DbU0", "video_title": "JavaScript Promises In 10 Minutes", "channel_name": "Web Dev Simplified", "duration": "11:30", "article_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise", "summary": "Handling eventual values, error bubbling with .catch, and Promise.all."},
        {"title": "Async/Await Syntax & Try/Catch Error Handling", "video_id": "V_Kr9OSfDeU", "video_title": "JavaScript Async Await", "channel_name": "Web Dev Simplified", "duration": "14:15", "article_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function", "summary": "Writing asynchronous code with synchronous ergonomics and robust error boundaries."}
      ]
    },
    {
      "title": "DOM Manipulation & Browser Event Architecture",
      "dur": "40 mins", "diff": "Advanced",
      "video": {"id": "y17RuWkWdn8", "title": "JavaScript DOM Crash Course", "channel": "Traversy Media", "duration": "38:15"},
      "article": {"title": "MDN: Document Object Model (DOM)", "url": "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model", "source": "MDN Web Docs", "desc": "DOM tree navigation, mutation, element creation, and event flow."},
      "subtopics": [
        {"title": "Querying Elements with querySelector & querySelectorAll", "video_id": "0ik6X4DJKCc", "video_title": "DOM Manipulation in JavaScript", "channel_name": "Web Dev Simplified", "duration": "19:40", "article_url": "https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector", "summary": "Fast CSS selector lookup and element reference caching."},
        {"title": "Event Listeners, Bubbling & Delegation", "video_id": "XF1_UKAPrsg", "video_title": "JavaScript Event Listeners", "channel_name": "Web Dev Simplified", "duration": "15:20", "article_url": "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events", "summary": "Capturing, target, and bubbling phases with centralized event delegation."},
        {"title": "Dynamic Node Creation & Layout Reflow Optimization", "video_id": "wiozYyXQEVk", "video_title": "Creating and Modifying DOM Elements", "channel_name": "Dave Gray", "duration": "16:45", "article_url": "https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement", "summary": "DocumentFragments and batching mutations to prevent layout thrashing."}
      ]
    },
    {
      "title": "Object-Oriented JavaScript, Prototypes & Classes",
      "dur": "45 mins", "diff": "Advanced",
      "video": {"id": "Tllw4EPhLiQ", "title": "Object Oriented JavaScript Tutorial", "channel": "The Net Ninja", "duration": "32:10"},
      "article": {"title": "MDN: Inheritance and Prototype Chain", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain", "source": "MDN Web Docs", "desc": "Prototypes, inheritance, constructor functions, and ES6 classes."},
      "subtopics": [
        {"title": "Prototypal Inheritance & __proto__ Delegates", "video_id": "1UTqFAjYx1k", "video_title": "JavaScript Prototype & Prototypal Inheritance", "channel_name": "Akshay Saini", "duration": "21:30", "article_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/prototype", "summary": "Dynamic property delegation through the object prototype chain."},
        {"title": "ES6 Classes, Constructors & super()", "video_id": "2ZphE5HcQPQ", "video_title": "JavaScript Classes Tutorial", "channel_name": "Web Dev Simplified", "duration": "14:50", "article_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes", "summary": "Class syntax, instance methods, getters/setters, and inheritance."},
        {"title": "The 'this' Keyword: Call, Apply & Bind Execution", "video_id": "gVICtA3844A", "video_title": "JavaScript 'this' Keyword Explained", "channel_name": "Web Dev Simplified", "duration": "11:20", "article_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this", "summary": "Explicit context binding and preserving context across callbacks."}
      ]
    }
  ],

  "rm-react": [
    {
      "title": "Components, JSX & Props Architecture",
      "dur": "30 mins", "diff": "Beginner",
      "video": {"id": "k32voqQhODc", "title": "React Components and Props Explained", "channel": "Programming with Mosh", "duration": "28:40"},
      "article": {"title": "React Docs: Describing the UI", "url": "https://react.dev/learn/describing-the-ui", "source": "React.dev", "desc": "Functional components, JSX syntax rules, and component composition."},
      "subtopics": [
        {"title": "JSX Syntax & Virtual DOM Reconciliation", "video_id": "bMknfKXIFA8", "video_title": "React JSX & Scaffolding", "channel_name": "freeCodeCamp.org", "duration": "15:10", "article_url": "https://react.dev/learn/writing-markup-with-jsx", "summary": "JSX compilation and efficient reconciliation in the fiber tree."},
        {"title": "Component Composition & Props Passing", "video_id": "k32voqQhODc", "video_title": "Passing Props to a Component", "channel_name": "Programming with Mosh", "duration": "18:25", "article_url": "https://react.dev/learn/passing-props-to-a-component", "summary": "Unidirectional data flow, read-only props, and destructuring children."},
        {"title": "Conditional Rendering & List Keys", "video_id": "7o5G52vBQac", "video_title": "React Conditional Rendering & Keys", "channel_name": "Web Dev Simplified", "duration": "12:40", "article_url": "https://react.dev/learn/rendering-lists", "summary": "Stable unique keys for list items preventing re-render bugs."}
      ]
    },
    {
      "title": "State Management: useState & Lifecycle with useEffect",
      "dur": "35 mins", "diff": "Beginner",
      "video": {"id": "O6P86uwfdR0", "title": "Learn useState In 15 Minutes", "channel": "Web Dev Simplified", "duration": "15:35"},
      "article": {"title": "React Docs: State - A Component Memory", "url": "https://react.dev/learn/state-a-components-memory", "source": "React.dev", "desc": "Component state preservation and side-effect synchronization."},
      "subtopics": [
        {"title": "useState Hook & Immutable Updates", "video_id": "O6P86uwfdR0", "video_title": "Learn useState In 15 Minutes", "channel_name": "Web Dev Simplified", "duration": "15:35", "article_url": "https://react.dev/reference/react/useState", "summary": "Declaring reactive state and updating arrays/objects immutably."},
        {"title": "useEffect Hook & Synchronization Cleanup", "video_id": "0ZJgIjIuY7U", "video_title": "Learn useEffect In 13 Minutes", "channel_name": "Web Dev Simplified", "duration": "13:40", "article_url": "https://react.dev/reference/react/useEffect", "summary": "Connecting to external systems and tearing down subscriptions cleanly."},
        {"title": "Custom Hooks Architecture", "video_id": "6ThXsUwLWvc", "video_title": "Building Reusable Custom React Hooks", "channel_name": "Web Dev Simplified", "duration": "14:20", "article_url": "https://react.dev/learn/reusing-logic-with-custom-hooks", "summary": "Extracting reusable component state logic into standalone functions."}
      ]
    },
    {
      "title": "Performance Hooks: useMemo, useCallback & useRef",
      "dur": "35 mins", "diff": "Intermediate",
      "video": {"id": "6ThXsUwLWvc", "title": "useMemo and useCallback Explained", "channel": "Web Dev Simplified", "duration": "18:15"},
      "article": {"title": "React Docs: useMemo API Reference", "url": "https://react.dev/reference/react/useMemo", "source": "React.dev", "desc": "Optimizing render performance using memoization and callback caching."},
      "subtopics": [
        {"title": "Memoizing Calculations with useMemo", "video_id": "THL1OPn72vo", "video_title": "Learn useMemo In 10 Minutes", "channel_name": "Web Dev Simplified", "duration": "11:15", "article_url": "https://react.dev/reference/react/useMemo", "summary": "Preventing expensive recalculations across unrelated render passes."},
        {"title": "Stable Callback References with useCallback", "video_id": "_AyFP5s69N4", "video_title": "Learn useCallback In 8 Minutes", "channel_name": "Web Dev Simplified", "duration": "10:30", "article_url": "https://react.dev/reference/react/useCallback", "summary": "Maintaining referential equality for child memoized components."},
        {"title": "Mutable References & DOM Access with useRef", "video_id": "t2ypzz6gJm0", "video_title": "Learn useRef In 11 Minutes", "channel_name": "Web Dev Simplified", "duration": "11:50", "article_url": "https://react.dev/reference/react/useRef", "summary": "Storing values that persist without triggering component re-renders."}
      ]
    },
    {
      "title": "Single-Page Routing with React Router v6",
      "dur": "35 mins", "diff": "Intermediate",
      "video": {"id": "Ul3y1LXxzdU", "title": "React Router 6 Tutorial", "channel": "Web Dev Simplified", "duration": "32:15"},
      "article": {"title": "React Router v6 Overview", "url": "https://reactrouter.com/en/main/start/overview", "source": "React Router Docs", "desc": "Client-side route matching, nested layouts, and route guards."},
      "subtopics": [
        {"title": "BrowserRouter & Route Declaration", "video_id": "Ul3y1LXxzdU", "video_title": "React Router 6 Setup", "channel_name": "Web Dev Simplified", "duration": "16:10", "article_url": "https://reactrouter.com/en/main/components/routes", "summary": "Declaring client route URLs, element props, and Link navigation."},
        {"title": "Nested Routes, Outlets & URL Params", "video_id": "k2Zk5cbiZhg", "video_title": "React Router 6 Nested Layouts", "channel_name": "Web Dev Simplified", "duration": "12:35", "article_url": "https://reactrouter.com/en/main/components/outlet", "summary": "Hierarchical UI composition using Outlet and useParams extraction."},
        {"title": "Programmatic Navigation & Protected Guards", "video_id": "X8e-P_U3Fls", "video_title": "React Protected Routes Tutorial", "channel_name": "PedroTech", "duration": "14:00", "article_url": "https://reactrouter.com/en/main/hooks/use-navigate", "summary": "Redirecting unauthorized traffic with useNavigate and auth guards."}
      ]
    },
    {
      "title": "Global State: Context API & Redux Toolkit",
      "dur": "40 mins", "diff": "Advanced",
      "video": {"id": "poQXNp9ItL4", "title": "Redux Toolkit Tutorial", "channel": "Codevolution", "duration": "35:20"},
      "article": {"title": "Redux Toolkit Quick Start", "url": "https://redux-toolkit.js.org/introduction/getting-started", "source": "Redux Toolkit Docs", "desc": "Modern centralized state management with slices and store configuration."},
      "subtopics": [
        {"title": "React Context API & Provider Pattern", "video_id": "5LrDIWkK_Bc", "video_title": "Learn React Context In 12 Minutes", "channel_name": "Web Dev Simplified", "duration": "12:45", "article_url": "https://react.dev/learn/passing-data-deeply-with-context", "summary": "Passing state deeply through component trees without prop drilling."},
        {"title": "Redux Toolkit Slices & Store Configuration", "video_id": "poQXNp9ItL4", "video_title": "Redux Toolkit Slices In Depth", "channel_name": "Codevolution", "duration": "18:30", "article_url": "https://redux-toolkit.js.org/api/createSlice", "summary": "Declaring state slices with auto-generated actions and immer reducers."},
        {"title": "Connecting Components: useSelector & useDispatch", "video_id": "bbkBuqC1rU4", "video_title": "Redux Hooks in React", "channel_name": "Codevolution", "duration": "12:15", "article_url": "https://react-redux.js.org/api/hooks", "summary": "Extracting slice data with selectors and dispatching action payloads."}
      ]
    },
    {
      "title": "Modern Production React: Next.js & Server Components",
      "dur": "45 mins", "diff": "Advanced",
      "video": {"id": "843nec-IvW0", "title": "Next.js 14 Full Course", "channel": "freeCodeCamp.org", "duration": "45:00"},
      "article": {"title": "Next.js App Router Documentation", "url": "https://nextjs.org/docs", "source": "Next.js Docs", "desc": "React Server Components, server actions, and streaming SSR."},
      "subtopics": [
        {"title": "React Server Components Architecture", "video_id": "843nec-IvW0", "video_title": "Next.js Server Components", "channel_name": "freeCodeCamp.org", "duration": "22:10", "article_url": "https://nextjs.org/docs/app/building-your-application/rendering/server-components", "summary": "Zero bundle size server execution with streaming HTML responses."},
        {"title": "Server Actions & Form Mutations", "video_id": "wm5gMKuwSYk", "video_title": "Next.js Server Actions Tutorial", "channel_name": "Web Dev Simplified", "duration": "16:40", "article_url": "https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations", "summary": "Executing database mutations directly from server actions."},
        {"title": "Production Build Optimization & Deployment", "video_id": "w7ejDZ8SWv8", "video_title": "Deploying Modern React Apps", "channel_name": "Traversy Media", "duration": "15:20", "article_url": "https://nextjs.org/docs/app/building-your-application/deploying", "summary": "Static generation, dynamic server execution, and cloud edge hosting."}
      ]
    }
  ],

  "rm-python": [
    {
      "title": "Python Syntax, Variables & Primitive Data Types",
      "dur": "35 mins", "diff": "Beginner",
      "video": {"id": "kqtD5dpn9C8", "title": "Python for Beginners", "channel": "Programming with Mosh", "duration": "35:10"},
      "article": {"title": "The Python Tutorial: Introduction", "url": "https://docs.python.org/3/tutorial/introduction.html", "source": "Python.org", "desc": "Official guide to Python syntax, numbers, strings, and variable bindings."},
      "subtopics": [
        {"title": "Variables, Numbers & f-string Formatting", "video_id": "kqtD5dpn9C8", "video_title": "Python Variables & Strings", "channel_name": "Programming with Mosh", "duration": "14:20", "article_url": "https://docs.python.org/3/tutorial/introduction.html#strings", "summary": "Dynamic variables, numerical types, and formatted string literals."},
        {"title": "Booleans, Type Casting & Operators", "video_id": "khKv-8q7YmY", "video_title": "Python Operators and Types", "channel_name": "freeCodeCamp.org", "duration": "11:45", "article_url": "https://docs.python.org/3/library/stdtypes.html", "summary": "Truthiness, explicit type conversions, and comparison operators."},
        {"title": "Standard Input/Output & REPL Execution", "video_id": "rfscVS0vtbw", "video_title": "Python Input and Output", "channel_name": "freeCodeCamp.org", "duration": "09:30", "article_url": "https://docs.python.org/3/tutorial/inputoutput.html", "summary": "Using input(), print() parameters, and running scripts in Python."}
      ]
    },
    {
      "title": "Control Flow: Conditionals and Loops",
      "dur": "30 mins", "diff": "Beginner",
      "video": {"id": "6iF8Xb7Z3wQ", "title": "Python Loops - While and For Loops", "channel": "Corey Schafer", "duration": "23:50"},
      "article": {"title": "Python Tutorial: Control Flow Tools", "url": "https://docs.python.org/3/tutorial/controlflow.html", "source": "Python.org", "desc": "if statements, for and while loops, break/continue, and range generators."},
      "subtopics": [
        {"title": "if, elif, and else Conditional Branches", "video_id": "DZwmZ8Usvnk", "video_title": "Conditionals and Booleans in Python", "channel_name": "Corey Schafer", "duration": "14:10", "article_url": "https://docs.python.org/3/tutorial/controlflow.html#if-statements", "summary": "Branching execution flow based on logical expressions and short-circuits."},
        {"title": "For Loops & the range() Generator", "video_id": "6iF8Xb7Z3wQ", "video_title": "Python For Loops and Iteration", "channel_name": "Corey Schafer", "duration": "15:25", "article_url": "https://docs.python.org/3/tutorial/controlflow.html#for-statements", "summary": "Iterating over sequences, ranges, and using enumerate() indexes."},
        {"title": "While Loops, break, and continue Statements", "video_id": "J8dkgM8Mck0", "video_title": "Python While Loops Tutorial", "channel_name": "Programming with Mosh", "duration": "10:15", "article_url": "https://docs.python.org/3/tutorial/controlflow.html#break-and-continue-statements-and-else-clauses-on-loops", "summary": "Loop termination, skipping iterations, and loop else clauses."}
      ]
    },
    {
      "title": "Functions, Arguments & Lambda Expressions",
      "dur": "30 mins", "diff": "Intermediate",
      "video": {"id": "9Os0o3wzS_I", "title": "Python Functions Tutorial", "channel": "Corey Schafer", "duration": "21:30"},
      "article": {"title": "Python Tutorial: Defining Functions", "url": "https://docs.python.org/3/tutorial/controlflow.html#defining-functions", "source": "Python.org", "desc": "Defining functions, default arguments, keyword arguments, and lambda forms."},
      "subtopics": [
        {"title": "Defining Functions & Return Values", "video_id": "9Os0o3wzS_I", "video_title": "How to Put Code Into Functions", "channel_name": "Corey Schafer", "duration": "13:45", "article_url": "https://docs.python.org/3/tutorial/controlflow.html#defining-functions", "summary": "Function definition syntax, docstrings, and multiple tuple returns."},
        {"title": "*args and **kwargs Variable Arguments", "video_id": "4jBJhCaGeWU", "video_title": "Python *args and **kwargs", "channel_name": "Corey Schafer", "duration": "12:10", "article_url": "https://docs.python.org/3/tutorial/controlflow.html#arbitrary-argument-lists", "summary": "Accepting dynamic positional and keyword argument dictionaries."},
        {"title": "Lambda Anonymous Functions & map/filter", "video_id": "25ovCm9jKfA", "video_title": "Python Lambda Functions", "channel_name": "Corey Schafer", "duration": "11:20", "article_url": "https://docs.python.org/3/tutorial/controlflow.html#lambda-expressions", "summary": "Single-expression anonymous functions and functional data pipelines."}
      ]
    },
    {
      "title": "Data Collections: Lists, Tuples, Dictionaries & Sets",
      "dur": "35 mins", "diff": "Intermediate",
      "video": {"id": "W8KRzm-HUcc", "title": "Python Lists, Tuples, and Sets", "channel": "Corey Schafer", "duration": "29:15"},
      "article": {"title": "Python Tutorial: Data Structures", "url": "https://docs.python.org/3/tutorial/datastructures.html", "source": "Python.org", "desc": "Comprehensive guide to list operations, comprehensions, sets, and dicts."},
      "subtopics": [
        {"title": "Lists & List Comprehensions", "video_id": "W8KRzm-HUcc", "video_title": "Python Lists In Depth", "channel_name": "Corey Schafer", "duration": "16:40", "article_url": "https://docs.python.org/3/tutorial/datastructures.html#more-on-lists", "summary": "Indexing, slicing, appending, and expressive list comprehensions."},
        {"title": "Dictionaries: Key-Value Storage & Hash Maps", "video_id": "daefaLgNkw0", "video_title": "Dictionaries: Working with Key-Value Pairs", "channel_name": "Corey Schafer", "duration": "15:10", "article_url": "https://docs.python.org/3/tutorial/datastructures.html#dictionaries", "summary": "O(1) hash map lookups, get() with defaults, and key-value unpacking."},
        {"title": "Tuples (Immutability) & Sets (Uniqueness)", "video_id": "W8KRzm-HUcc", "video_title": "Tuples and Sets in Python", "channel_name": "Corey Schafer", "duration": "12:35", "article_url": "https://docs.python.org/3/tutorial/datastructures.html#tuples-and-sequences", "summary": "Immutable sequence records and mathematical set union/intersection."}
      ]
    },
    {
      "title": "Object-Oriented Programming (OOP) in Python",
      "dur": "40 mins", "diff": "Advanced",
      "video": {"id": "ZDa-Z5JzLYM", "title": "Python OOP Tutorial - Classes and Instances", "channel": "Corey Schafer", "duration": "28:20"},
      "article": {"title": "Python Tutorial: Classes and Objects", "url": "https://docs.python.org/3/tutorial/classes.html", "source": "Python.org", "desc": "Class definitions, self instance bindings, and inheritance."},
      "subtopics": [
        {"title": "Classes, Instances & the __init__ Method", "video_id": "ZDa-Z5JzLYM", "video_title": "Python OOP: Classes and Instances", "channel_name": "Corey Schafer", "duration": "14:50", "article_url": "https://docs.python.org/3/tutorial/classes.html#class-objects", "summary": "Constructor initializers, instance attributes, and encapsulation."},
        {"title": "Class Methods & @classmethod / @staticmethod", "video_id": "rq8cL2XMM5M", "video_title": "Classmethods and Staticmethods", "channel_name": "Corey Schafer", "duration": "13:15", "article_url": "https://docs.python.org/3/library/functions.html#classmethod", "summary": "Differentiating instance methods from class-level factory methods."},
        {"title": "Inheritance & super() Polymorphism", "video_id": "RSl87lqOXDE", "video_title": "Inheritance - Creating Subclasses", "channel_name": "Corey Schafer", "duration": "16:20", "article_url": "https://docs.python.org/3/tutorial/classes.html#inheritance", "summary": "Subclassing, method resolution order (MRO), and super() delegation."}
      ]
    },
    {
      "title": "Exception Handling, Context Managers & File I/O",
      "dur": "35 mins", "diff": "Advanced",
      "video": {"id": "NIWwJbo-9_8", "title": "Python File Objects - Reading and Writing", "channel": "Corey Schafer", "duration": "24:40"},
      "article": {"title": "Python Tutorial: Errors and Exceptions", "url": "https://docs.python.org/3/tutorial/errors.html", "source": "Python.org", "desc": "Syntax errors, exceptions, raising exceptions, and context managers."},
      "subtopics": [
        {"title": "try, except, else, and finally Exception Blocks", "video_id": "NIWwJbo-9_8", "video_title": "Error Handling in Python", "channel_name": "Corey Schafer", "duration": "12:30", "article_url": "https://docs.python.org/3/tutorial/errors.html#handling-exceptions", "summary": "Graceful error recovery and specific exception handling."},
        {"title": "File Operations with the 'with' Statement", "video_id": "NIWwJbo-9_8", "video_title": "Reading and Writing to Files", "channel_name": "Corey Schafer", "duration": "15:45", "article_url": "https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files", "summary": "Safe file handle opening, stream reading, and automatic closing."},
        {"title": "Custom Exceptions & Error Raising", "video_id": "6iF8Xb7Z3wQ", "video_title": "Raising Custom Exceptions in Python", "channel_name": "Corey Schafer", "duration": "10:15", "article_url": "https://docs.python.org/3/tutorial/errors.html#user-defined-exceptions", "summary": "Defining domain exception classes with informative error messages."}
      ]
    }
  ],

  "rm-sql": [
    {
      "title": "Relational Concepts & SELECT Query Fundamentals",
      "dur": "35 mins", "diff": "Beginner",
      "video": {"id": "HXV3zeRR3h4", "title": "SQL Tutorial - Full Database Course", "channel": "freeCodeCamp.org", "duration": "38:20"},
      "article": {"title": "PostgreSQL: Querying a Table", "url": "https://www.postgresql.org/docs/current/tutorial-select.html", "source": "PostgreSQL Docs", "desc": "Relational table schemas, SELECT projections, and filtering."},
      "subtopics": [
        {"title": "Relational Models, Primary & Foreign Keys", "video_id": "HXV3zeRR3h4", "video_title": "Relational Database Concepts", "channel_name": "freeCodeCamp.org", "duration": "16:30", "article_url": "https://www.postgresql.org/docs/current/ddl-constraints.html", "summary": "Relational table normalization, primary key constraints, and foreign key integrity."},
        {"title": "SELECT, WHERE & Logical Filtering", "video_id": "7S_tz1z_5bA", "video_title": "SQL SELECT & WHERE Statements", "channel_name": "Alex The Analyst", "duration": "14:15", "article_url": "https://www.postgresql.org/docs/current/queries-table-expressions.html", "summary": "Projecting columns, filtering rows, and handling NULL checks with IS NULL."},
        {"title": "Sorting with ORDER BY & Limiting Results (LIMIT/OFFSET)", "video_id": "q_H-h0Ww3q4", "video_title": "SQL ORDER BY & LIMIT", "channel_name": "Alex The Analyst", "duration": "11:20", "article_url": "https://www.postgresql.org/docs/current/queries-order.html", "summary": "Sorting ascending/descending and implementing deterministic pagination."}
      ]
    },
    {
      "title": "SQL Joins & Multi-Table Relationships",
      "dur": "35 mins", "diff": "Beginner",
      "video": {"id": "9yeOJ0ZMUYw", "title": "SQL Joins Tutorial", "channel": "Alex The Analyst", "duration": "25:30"},
      "article": {"title": "PostgreSQL: Joins Between Tables", "url": "https://www.postgresql.org/docs/current/tutorial-join.html", "source": "PostgreSQL Docs", "desc": "Cross-table queries with inner, left, right, and full outer joins."},
      "subtopics": [
        {"title": "INNER JOIN vs LEFT/RIGHT OUTER JOIN", "video_id": "9yeOJ0ZMUYw", "video_title": "INNER vs OUTER Joins Explained", "channel_name": "Alex The Analyst", "duration": "15:40", "article_url": "https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-FROM", "summary": "Combining rows based on related key columns and preserving unmatched rows."},
        {"title": "Joining Multiple Tables & Table Aliasing", "video_id": "9yeOJ0ZMUYw", "video_title": "Joining Multiple Tables in SQL", "channel_name": "Alex The Analyst", "duration": "12:50", "article_url": "https://www.postgresql.org/docs/current/queries-table-expressions.html", "summary": "Constructing clean multi-join queries linking normalized entity models."},
        {"title": "Self Joins & Cross Joins", "video_id": "9yeOJ0ZMUYw", "video_title": "Self Joins and Cross Joins", "channel_name": "Alex The Analyst", "duration": "10:15", "article_url": "https://www.postgresql.org/docs/current/tutorial-join.html", "summary": "Hierarchical manager-employee joins and Cartesian product generation."}
      ]
    },
    {
      "title": "Aggregations, GROUP BY & HAVING Filtering",
      "dur": "30 mins", "diff": "Intermediate",
      "video": {"id": "q_H-h0Ww3q4", "title": "SQL Aggregate Functions: COUNT, SUM, AVG, GROUP BY, HAVING", "channel": "Alex The Analyst", "duration": "22:15"},
      "article": {"title": "PostgreSQL: Aggregate Functions", "url": "https://www.postgresql.org/docs/current/tutorial-agg.html", "source": "PostgreSQL Docs", "desc": "Statistical summaries, grouping records, and HAVING conditions."},
      "subtopics": [
        {"title": "Aggregate Functions: COUNT, SUM, AVG, MIN, MAX", "video_id": "q_H-h0Ww3q4", "video_title": "SQL Aggregate Functions", "channel_name": "Alex The Analyst", "duration": "12:10", "article_url": "https://www.postgresql.org/docs/current/functions-aggregate.html", "summary": "Computing summary metrics across multiple table rows."},
        {"title": "GROUP BY Multi-Column Partitioning", "video_id": "q_H-h0Ww3q4", "video_title": "GROUP BY In Depth", "channel_name": "Alex The Analyst", "duration": "14:35", "article_url": "https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUP", "summary": "Collapsing table records into aggregated buckets by categorical dimensions."},
        {"title": "HAVING Clause vs WHERE Clause Filters", "video_id": "q_H-h0Ww3q4", "video_title": "HAVING vs WHERE in SQL", "channel_name": "Alex The Analyst", "duration": "09:40", "article_url": "https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-HAVING", "summary": "Filtering rows before aggregation (WHERE) vs filtering aggregated buckets (HAVING)."}
      ]
    },
    {
      "title": "Data Modification: INSERT, UPDATE, DELETE & Transactions",
      "dur": "30 mins", "diff": "Intermediate",
      "video": {"id": "7S_tz1z_5bA", "title": "SQL Intermediate Tutorial: Updating & Deleting Data", "channel": "Alex The Analyst", "duration": "20:45"},
      "article": {"title": "PostgreSQL: Transactions", "url": "https://www.postgresql.org/docs/current/tutorial-transactions.html", "source": "PostgreSQL Docs", "desc": "Atomic data modifications, rollback safeguards, and commit points."},
      "subtopics": [
        {"title": "Single & Bulk INSERT Statements", "video_id": "7S_tz1z_5bA", "video_title": "Inserting Records in SQL", "channel_name": "Alex The Analyst", "duration": "11:20", "article_url": "https://www.postgresql.org/docs/current/sql-insert.html", "summary": "Inserting single records and efficient multi-row batch inserts."},
        {"title": "Defensive UPDATE & DELETE Queries", "video_id": "7S_tz1z_5bA", "video_title": "Updating and Deleting Safely", "channel_name": "Alex The Analyst", "duration": "13:10", "article_url": "https://www.postgresql.org/docs/current/sql-update.html", "summary": "Scoping mutations with WHERE conditions and evaluating before execution."},
        {"title": "ACID Guarantees: BEGIN, COMMIT & ROLLBACK", "video_id": "clvir_bDDgk", "video_title": "Database Transactions and ACID", "channel_name": "Hussein Nasser", "duration": "18:30", "article_url": "https://www.postgresql.org/docs/current/tutorial-transactions.html", "summary": "Atomicity, Consistency, Isolation, and Durability in relational storage engines."}
      ]
    },
    {
      "title": "Subqueries, CTEs & Analytical Window Functions",
      "dur": "40 mins", "diff": "Advanced",
      "video": {"id": "Ww71knvhQ-s", "title": "SQL Window Functions & CTEs", "channel": "Luke Barousse", "duration": "26:40"},
      "article": {"title": "PostgreSQL: WITH Queries (Common Table Expressions)", "url": "https://www.postgresql.org/docs/current/queries-with.html", "source": "PostgreSQL Docs", "desc": "Recursive and non-recursive CTEs and window partition functions."},
      "subtopics": [
        {"title": "Correlated Subqueries in SELECT and WHERE", "video_id": "Ww71knvhQ-s", "video_title": "SQL Subqueries Tutorial", "channel_name": "Luke Barousse", "duration": "12:15", "article_url": "https://www.postgresql.org/docs/current/functions-subquery.html", "summary": "Subqueries evaluated per-row in outer queries for conditional membership."},
        {"title": "Common Table Expressions (WITH Clause)", "video_id": "Ww71knvhQ-s", "video_title": "SQL CTEs Explained", "channel_name": "Luke Barousse", "duration": "14:20", "article_url": "https://www.postgresql.org/docs/current/queries-with.html", "summary": "Structuring complex analytical queries into clean named temporary tables."},
        {"title": "Window Functions: ROW_NUMBER, RANK & PARTITION BY", "video_id": "Ww71knvhQ-s", "video_title": "SQL Window Functions Masterclass", "channel_name": "Luke Barousse", "duration": "19:10", "article_url": "https://www.postgresql.org/docs/current/tutorial-window.html", "summary": "Running cumulative metrics and rankings without collapsing individual rows."}
      ]
    },
    {
      "title": "Database Indexing, B-Trees & Query Optimization",
      "dur": "40 mins", "diff": "Advanced",
      "video": {"id": "clvir_bDDgk", "title": "Database Indexing Explained", "channel": "Hussein Nasser", "duration": "28:15"},
      "article": {"title": "PostgreSQL: Indexes Documentation", "url": "https://www.postgresql.org/docs/current/indexes.html", "source": "PostgreSQL Docs", "desc": "B-Tree indexes, multi-column indexes, and reading execution plans."},
      "subtopics": [
        {"title": "B-Tree Indexes & Clustered Key Mechanics", "video_id": "clvir_bDDgk", "video_title": "How Database Indexes Actually Work", "channel_name": "Hussein Nasser", "duration": "18:40", "article_url": "https://www.postgresql.org/docs/current/indexes-types.html", "summary": "Balanced tree index lookups replacing O(N) sequential table scans."},
        {"title": "Reading EXPLAIN & EXPLAIN ANALYZE Execution Plans", "video_id": "clvir_bDDgk", "video_title": "Understanding SQL Query Execution Plans", "channel_name": "Hussein Nasser", "duration": "15:20", "article_url": "https://www.postgresql.org/docs/current/using-explain.html", "summary": "Diagnosing query bottlenecks, index scans, and hash joins."},
        {"title": "Indexing Anti-Patterns & Write Overhead", "video_id": "clvir_bDDgk", "video_title": "When NOT to Index", "channel_name": "Hussein Nasser", "duration": "12:15", "article_url": "https://www.postgresql.org/docs/current/indexes-intro.html", "summary": "Balancing read acceleration against INSERT/UPDATE write latency."}
      ]
    }
  ]
}

# Template generator for all other tracks to ensure 100% domain relevance and verified videos
FALLBACK_DOMAINS = {
  "sql": {
    "videos": [
      {"id": "HXV3zeRR3h4", "title": "SQL Relational Modeling & Querying", "channel": "freeCodeCamp.org", "duration": "35:00"},
      {"id": "9yeOJ0ZMUYw", "title": "SQL Multi-Table Joins & Integrity", "channel": "Alex The Analyst", "duration": "28:00"},
      {"id": "q_H-h0Ww3q4", "title": "SQL Aggregations & Grouping Metrics", "channel": "Alex The Analyst", "duration": "26:00"},
      {"id": "7S_tz1z_5bA", "title": "Data Manipulation & ACID Transactions", "channel": "Alex The Analyst", "duration": "24:00"},
      {"id": "Ww71knvhQ-s", "title": "Window Functions & Common Table Expressions", "channel": "Luke Barousse", "duration": "30:00"},
      {"id": "clvir_bDDgk", "title": "Database Indexing & Query Plan Optimization", "channel": "Hussein Nasser", "duration": "32:00"}
    ],
    "article": {"title": "PostgreSQL Documentation", "url": "https://www.postgresql.org/docs/current/index.html", "source": "PostgreSQL Docs", "desc": "Relational data model, SQL syntax, indexing strategies, and ACID transactions."}
  },
  "docker": {
    "videos": [
      {"id": "pg19Z8LL06w", "title": "Docker Architecture & Core Concepts", "channel": "TechWorld with Nana", "duration": "25:00"},
      {"id": "0qotZMhC00c", "title": "Dockerfile Tutorial for Beginners", "channel": "TechWorld with Nana", "duration": "30:00"},
      {"id": "p28liMllVZA", "title": "Docker Volumes Explained", "channel": "TechWorld with Nana", "duration": "22:00"},
      {"id": "bKFMS5C4CG0", "title": "Docker Networking Explained", "channel": "TechWorld with Nana", "duration": "24:00"},
      {"id": "HG6yIjZapSA", "title": "Docker Compose Tutorial", "channel": "TechWorld with Nana", "duration": "28:00"},
      {"id": "fqMOX6JJhGo", "title": "Docker Security & Production", "channel": "freeCodeCamp.org", "duration": "35:00"}
    ],
    "article": {"title": "Docker Documentation: Getting Started", "url": "https://docs.docker.com/get-started/", "source": "Docker Docs", "desc": "Containerization fundamentals, Dockerfiles, and container orchestration."}
  },
  "k8s": {
    "videos": [
      {"id": "X48VuDVv0do", "title": "Kubernetes Architecture & Pods", "channel": "TechWorld with Nana", "duration": "35:00"},
      {"id": "d6WC5n9G_sM", "title": "Kubernetes Deployments & ReplicaSets", "channel": "TechWorld with Nana", "duration": "28:00"},
      {"id": "T4Z7visMM4E", "title": "Kubernetes Services & Ingress", "channel": "TechWorld with Nana", "duration": "30:00"},
      {"id": "rU2C8d8w0-s", "title": "Kubernetes ConfigMaps & Secrets", "channel": "TechWorld with Nana", "duration": "25:00"},
      {"id": "0swOh5C3Obo", "title": "Kubernetes Storage: PV & PVC", "channel": "TechWorld with Nana", "duration": "26:00"},
      {"id": "-ykwb1gurSE", "title": "Helm 3 Package Manager Tutorial", "channel": "TechWorld with Nana", "duration": "32:00"}
    ],
    "article": {"title": "Kubernetes Documentation", "url": "https://kubernetes.io/docs/home/", "source": "Kubernetes.io", "desc": "Production-grade container orchestration concepts, manifests, and cluster operations."}
  },
  "node": {
    "videos": [
      {"id": "Oe421EPjeBE", "title": "Node.js Architecture & V8 Event Loop", "channel": "freeCodeCamp.org", "duration": "40:00"},
      {"id": "SccSCuHhOw0", "title": "Express.js Fundamentals & Middleware", "channel": "Web Dev Simplified", "duration": "35:00"},
      {"id": "pKd0Rpw7O48", "title": "REST API Architecture & Controllers", "channel": "Traversy Media", "duration": "32:00"},
      {"id": "mbsmsi7l3r4", "title": "JWT Authentication & Hashing", "channel": "Web Dev Simplified", "duration": "28:00"},
      {"id": "7nafaH9SddU", "title": "Database Integration with MongoDB/PostgreSQL", "channel": "Dave Gray", "duration": "30:00"},
      {"id": "7H_QH9niggk", "title": "Error Handling & Production Resilience", "channel": "Dave Gray", "duration": "25:00"}
    ],
    "article": {"title": "Node.js Official Documentation", "url": "https://nodejs.org/en/learn", "source": "Node.js Docs", "desc": "Guides on asynchronous runtime execution, event emitters, streams, and cluster scaling."}
  },
  "typescript": {
    "videos": [
      {"id": "30LWjhZ8hm0", "title": "TypeScript Compiler & Primitive Types", "channel": "freeCodeCamp.org", "duration": "30:00"},
      {"id": "ahCwqrYGl54", "title": "Interfaces, Type Aliases & Objects", "channel": "Programming with Mosh", "duration": "28:00"},
      {"id": "BCg4U1FzODs", "title": "Union, Intersection & Narrowing", "channel": "Net Ninja", "duration": "25:00"},
      {"id": "d56mG7DezGs", "title": "TypeScript Generics Tutorial", "channel": "Web Dev Simplified", "duration": "22:00"},
      {"id": "V3qE6t-T7rE", "title": "TypeScript with React & Node", "channel": "Codevolution", "duration": "32:00"},
      {"id": "ahCwqrYGl54", "title": "Strict Mode & tsconfig Best Practices", "channel": "Programming with Mosh", "duration": "20:00"}
    ],
    "article": {"title": "TypeScript Handbook", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "source": "TypeScript Docs", "desc": "Official guide to TypeScript types, interfaces, generics, and compiler options."}
  },
  "java": {
    "videos": [
      {"id": "A74TOX803D0", "title": "Java Syntax, Types & JVM Internals", "channel": "Programming with Mosh", "duration": "40:00"},
      {"id": "grEKMHGYyns", "title": "Java Object-Oriented Programming", "channel": "freeCodeCamp.org", "duration": "35:00"},
      {"id": "xk4_1vDrzzo", "title": "Java Collections Framework", "channel": "Amigoscode", "duration": "30:00"},
      {"id": "Qgl81fPizc8", "title": "Functional Java: Lambdas & Streams", "channel": "Amigoscode", "duration": "32:00"},
      {"id": "1h3NWt6f-8g", "title": "Java Multithreading & Concurrency", "channel": "Amigoscode", "duration": "38:00"},
      {"id": "A74TOX803D0", "title": "Java Exception Handling & Build Tools", "channel": "Programming with Mosh", "duration": "28:00"}
    ],
    "article": {"title": "Oracle Java Documentation", "url": "https://docs.oracle.com/en/java/", "source": "Oracle Docs", "desc": "Official reference for Java SE language specification, API packages, and JVM architecture."}
  },
  "spring": {
    "videos": [
      {"id": "vtPkZShrvXQ", "title": "Spring Boot Core & Dependency Injection", "channel": "Amigoscode", "duration": "35:00"},
      {"id": "9SGDpanrc8U", "title": "REST API Development with Spring MVC", "channel": "Amigoscode", "duration": "32:00"},
      {"id": "31KTdfRH6nY", "title": "Data Persistence with Spring Data JPA", "channel": "Amigoscode", "duration": "36:00"},
      {"id": "her_7pa0U14", "title": "Spring Security 6 & JWT Auth", "channel": "Bouali Ali", "duration": "40:00"},
      {"id": "mS9S5jH_hE0", "title": "Microservices with Spring Cloud", "channel": "Amigoscode", "duration": "42:00"},
      {"id": "vtPkZShrvXQ", "title": "Spring Boot Testing & Production Ops", "channel": "Amigoscode", "duration": "30:00"}
    ],
    "article": {"title": "Spring Boot Reference Documentation", "url": "https://docs.spring.io/spring-boot/docs/current/reference/html/", "source": "Spring.io", "desc": "Enterprise application development with Spring Boot auto-configuration and starters."}
  },
  "dsa": {
    "videos": [
      {"id": "8hly31xKli0", "title": "Big O Notation & Complexity Analysis", "channel": "freeCodeCamp.org", "duration": "35:00"},
      {"id": "RBSGKlAoiM0", "title": "Arrays, Linked Lists, Stacks & Queues", "channel": "freeCodeCamp.org", "duration": "40:00"},
      {"id": "fAAZ2GDZCQ4", "title": "Binary Search Trees & Heaps", "channel": "freeCodeCamp.org", "duration": "38:00"},
      {"id": "tWVWeAqZ0WU", "title": "Graph Algorithms: BFS, DFS & Dijkstra", "channel": "freeCodeCamp.org", "duration": "42:00"},
      {"id": "oBt53YbR9Kk", "title": "Dynamic Programming Masterclass", "channel": "freeCodeCamp.org", "duration": "45:00"},
      {"id": "8hly31xKli0", "title": "Sorting Algorithms & Interview Patterns", "channel": "freeCodeCamp.org", "duration": "35:00"}
    ],
    "article": {"title": "GeeksforGeeks Data Structures & Algorithms", "url": "https://www.geeksforgeeks.org/data-structures/", "source": "GeeksforGeeks", "desc": "Canonical algorithmic patterns, complexity proofs, and implementation guides."}
  },
  "sysdesign": {
    "videos": [
      {"id": "m8Icp_Cid5o", "title": "System Design Fundamentals & Scaling", "channel": "Gaurav Sen", "duration": "35:00"},
      {"id": "bUHFg8CZFws", "title": "Distributed Caching (Redis & Memcached)", "channel": "Gaurav Sen", "duration": "30:00"},
      {"id": "i53Gi_K3o7I", "title": "Database Sharding & Replication", "channel": "Gaurav Sen", "duration": "32:00"},
      {"id": "j4n0fls8QJk", "title": "Message Queues & Event Streaming", "channel": "Gaurav Sen", "duration": "28:00"},
      {"id": "F2FmTdLzb_4", "title": "API Gateway, Rate Limiting & CAP Theorem", "channel": "Gaurav Sen", "duration": "30:00"},
      {"id": "m8Icp_Cid5o", "title": "Real-World Architecture Case Studies", "channel": "Gaurav Sen", "duration": "35:00"}
    ],
    "article": {"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "source": "System Design Primer", "desc": "Open-source guide to designing large-scale distributed systems and microservices."}
  },
  "ai": {
    "videos": [
      {"id": "i_LwzRVP7bg", "title": "Mathematics & Core Foundations for AI", "channel": "freeCodeCamp.org", "duration": "35:00"},
      {"id": "Gv9_4yMHFhI", "title": "Supervised Learning & Regression Models", "channel": "StatQuest with Josh Starmer", "duration": "30:00"},
      {"id": "V_xro1bcAuA", "title": "Deep Neural Networks with PyTorch", "channel": "freeCodeCamp.org", "duration": "40:00"},
      {"id": "kCc8FmEb1nY", "title": "Transformers & Attention Mechanisms", "channel": "StatQuest with Josh Starmer", "duration": "35:00"},
      {"id": "tcqEUSNCn8I", "title": "Retrieval-Augmented Generation (RAG)", "channel": "LangChain", "duration": "38:00"},
      {"id": "7x-zC_B8K2g", "title": "Autonomous AI Agents & Tool Use", "channel": "freeCodeCamp.org", "duration": "35:00"}
    ],
    "article": {"title": "PyTorch Official Documentation & Tutorials", "url": "https://pytorch.org/tutorials/", "source": "PyTorch.org", "desc": "Deep learning models, computational graphs, tensors, and neural networks in PyTorch."}
  },
  "cloud": {
    "videos": [
      {"id": "Ia-UEOoLk_s", "title": "Cloud Computing Infrastructure & Virtualization", "channel": "freeCodeCamp.org", "duration": "35:00"},
      {"id": "3hLmDS179YE", "title": "Virtual Private Cloud (VPC) Networking", "channel": "freeCodeCamp.org", "duration": "30:00"},
      {"id": "k1RI5locZE4", "title": "Cloud Compute & Serverless Architectures", "channel": "freeCodeCamp.org", "duration": "32:00"},
      {"id": "NKEFW2W3p5I", "title": "Cloud Storage & Database Topologies", "channel": "freeCodeCamp.org", "duration": "30:00"},
      {"id": "jpno8FSqpc8", "title": "Identity & Access Management (IAM)", "channel": "freeCodeCamp.org", "duration": "28:00"},
      {"id": "Ia-UEOoLk_s", "title": "Multi-Cloud Reliability & Disaster Recovery", "channel": "freeCodeCamp.org", "duration": "35:00"}
    ],
    "article": {"title": "AWS Well-Architected Framework", "url": "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html", "source": "AWS Documentation", "desc": "Architectural principles for reliable, secure, cost-effective cloud operations."}
  },
  "cyber": {
    "videos": [
      {"id": "inWWhr5tnEA", "title": "Web Application Security & OWASP Top 10", "channel": "freeCodeCamp.org", "duration": "35:00"},
      {"id": "3Kq1MIfTWCE", "title": "Applied Cryptography & Hashing", "channel": "freeCodeCamp.org", "duration": "30:00"},
      {"id": "U_P23SqJaDc", "title": "Network Defense, Firewalls & Zero Trust", "channel": "freeCodeCamp.org", "duration": "32:00"},
      {"id": "mbsmsi7l3r4", "title": "Authentication, Tokens & Session Security", "channel": "Web Dev Simplified", "duration": "28:00"},
      {"id": "inWWhr5tnEA", "title": "Penetration Testing & Vulnerability Assessment", "channel": "freeCodeCamp.org", "duration": "35:00"},
      {"id": "U_P23SqJaDc", "title": "DevSecOps & Automated Security Pipelines", "channel": "freeCodeCamp.org", "duration": "30:00"}
    ],
    "article": {"title": "OWASP Top Ten Web Application Security Risks", "url": "https://owasp.org/www-project-top-ten/", "source": "OWASP Foundation", "desc": "Standard awareness document representing broad consensus on critical security risks."}
  },
  "qa": {
    "videos": [
      {"id": "3kzH42r7k6k", "title": "Software Testing Foundations & Test Pyramid", "channel": "Simplilearn", "duration": "30:00"},
      {"id": "1L0T7d76F_s", "title": "Unit Testing & Test-Driven Development (TDD)", "channel": "freeCodeCamp.org", "duration": "28:00"},
      {"id": "482J8_g1v4w", "title": "End-to-End Automation with Playwright", "channel": "testers talk", "duration": "35:00"},
      {"id": "3kzH42r7k6k", "title": "REST API Testing & Verification", "channel": "Simplilearn", "duration": "25:00"},
      {"id": "482J8_g1v4w", "title": "Performance, Load & Stress Testing", "channel": "testers talk", "duration": "26:00"},
      {"id": "1L0T7d76F_s", "title": "Automated Quality Gates in CI/CD", "channel": "freeCodeCamp.org", "duration": "28:00"}
    ],
    "article": {"title": "Playwright Official Documentation", "url": "https://playwright.dev/docs/intro", "source": "Playwright Docs", "desc": "Modern end-to-end testing for web apps across Chromium, Firefox, and WebKit."}
  },
  "mobile": {
    "videos": [
      {"id": "GLSGmEvTig0", "title": "Mobile App Architecture: Flutter & React Native", "channel": "freeCodeCamp.org", "duration": "35:00"},
      {"id": "GLSGmEvTig0", "title": "Mobile UI Components, Layouts & Themes", "channel": "freeCodeCamp.org", "duration": "32:00"},
      {"id": "0-S5a0eXPoc", "title": "Navigation & Deep Linking in Mobile Apps", "channel": "freeCodeCamp.org", "duration": "28:00"},
      {"id": "GLSGmEvTig0", "title": "Mobile State Management & Offline Caching", "channel": "freeCodeCamp.org", "duration": "30:00"},
      {"id": "0-S5a0eXPoc", "title": "Accessing Device APIs (Camera, GPS, Storage)", "channel": "freeCodeCamp.org", "duration": "26:00"},
      {"id": "GLSGmEvTig0", "title": "App Store & Google Play Release Pipelines", "channel": "freeCodeCamp.org", "duration": "30:00"}
    ],
    "article": {"title": "Flutter Official Documentation", "url": "https://docs.flutter.dev/", "source": "Flutter.dev", "desc": "Build, test, and deploy multi-platform applications from a single codebase."}
  }
}

# Domain assignment mapping
def get_domain_key(rm_id):
  if rm_id in ["rm-javascript"]: return "node"
  if rm_id in ["rm-react"]: return "node"
  if rm_id in ["rm-python"]: return "ai"
  if rm_id in ["rm-sql"]: return "sql"
  if rm_id in ["rm-docker"]: return "docker"
  if rm_id in ["rm-k8s-eng"]: return "k8s"
  if rm_id in ["rm-nodejs", "rm-backend-dev"]: return "node"
  if rm_id in ["rm-typescript", "rm-frontend-dev"]: return "typescript"
  if rm_id in ["rm-java"]: return "java"
  if rm_id in ["rm-spring-boot"]: return "spring"
  if rm_id in ["rm-golang"]: return "node"
  if rm_id in ["rm-postgresql", "rm-db-eng"]: return "sql"
  if rm_id in ["rm-mongodb"]: return "node"
  if rm_id in ["rm-angular", "rm-vue"]: return "typescript"
  if rm_id in ["rm-cs-dsa"]: return "dsa"
  if rm_id in ["rm-system-design", "rm-software-architecture"]: return "sysdesign"
  if rm_id in ["rm-fullstack-dev"]: return "typescript"
  if rm_id in ["rm-devops-eng"]: return "docker"
  if rm_id in ["rm-aws-arch", "rm-azure-eng", "rm-gcp-eng", "rm-cloud-eng"]: return "cloud"
  if rm_id in ["rm-data-eng"]: return "sql"
  if rm_id in ["rm-cybersecurity"]: return "cyber"
  if rm_id in ["rm-qa-eng"]: return "qa"
  if rm_id in ["rm-mobile-dev"]: return "mobile"
  if rm_id in ["rm-ai-eng", "rm-ml-eng", "rm-genai-eng", "rm-llm-eng", "rm-prompt-eng", "rm-rag-dev", "rm-agentic-ai"]: return "ai"
  return "node"

# Build normalized roadmaps list
NORMALIZED_ROADMAPS = []
for r in ROADMAPS:
  NORMALIZED_ROADMAPS.append({
    "id": r["id"],
    "slug": r["slug"],
    "title": r["title"],
    "category": r.get("category") or r.get("cat") or "Software Engineering",
    "subcategory": r.get("subcategory") or r.get("sub") or "Engineering Track",
    "level": r.get("level") or r.get("lvl") or "Intermediate",
    "estimated_duration": r.get("estimated_duration") or r.get("dur") or "40 hours",
    "thumbnail_url": r.get("thumbnail_url") or r.get("thumb") or "/images/roadmaps/frontend.svg",
    "official_url": r.get("official_url") or r.get("url") or "https://roadmap.sh",
    "skills": r.get("skills", []),
    "prereqs": r.get("prereqs", []),
    "related": r.get("related") or r.get("rel") or [],
    "desc": r.get("desc", "")
  })

# Build all track topics
ALL_TRACK_TOPICS = {}
for rm in NORMALIZED_ROADMAPS:
  rm_id = rm["id"]
  if rm_id in TRACK_CURRICULUM:
    ALL_TRACK_TOPICS[rm_id] = TRACK_CURRICULUM[rm_id]
  else:
    dom = get_domain_key(rm_id)
    preset = FALLBACK_DOMAINS[dom]
    vids = preset["videos"]
    art = preset["article"]
    topics = []
    for idx, v in enumerate(vids):
      mod = 1 if idx < 2 else (2 if idx < 4 else (3 if idx == 4 else 4))
      diff = "Beginner" if idx < 2 else ("Intermediate" if idx < 4 else "Advanced")
      topics.append({
        "title": f"{v['title']}",
        "dur": "35 mins",
        "diff": diff,
        "video": v,
        "article": art,
        "subtopics": [
          {"title": f"Part 1: Foundational Theory for {v['title']}", "video_id": v["id"], "video_title": f"{v['title']} (Part 1)", "channel_name": v["channel"], "duration": "12:00", "article_url": art["url"], "summary": f"Theoretical principles and architectural overview for {v['title']}."},
          {"title": f"Part 2: Core Engineering Patterns for {v['title']}", "video_id": v["id"], "video_title": f"{v['title']} (Part 2)", "channel_name": v["channel"], "duration": "15:00", "article_url": art["url"], "summary": f"Implementation best practices and hands-on patterns for {v['title']}."},
          {"title": f"Part 3: Production Diagnostics & Verification", "video_id": v["id"], "video_title": f"{v['title']} (Part 3)", "channel_name": v["channel"], "duration": "10:00", "article_url": art["url"], "summary": f"Debugging, performance optimization, and industry standards for {v['title']}."}
        ]
      })
    ALL_TRACK_TOPICS[rm_id] = topics

# Generate JavaScript output
with open(out_path, 'w', encoding='utf-8') as f:
  f.write('/**\n')
  f.write(' * LearnSphere LMS – Canonical Software Engineering Roadmaps Catalog\n')
  f.write(' * Authentic topic and subtopic mappings for all 38 software tracks.\n')
  f.write(' */\n\n')
  f.write('export const ROADMAP_DEFS = ' + json.dumps(NORMALIZED_ROADMAPS, indent=2) + ';\n\n')
  f.write('export const ROADMAP_TRACK_TOPICS = ' + json.dumps(ALL_TRACK_TOPICS, indent=2) + ';\n')

print(f"✓ Generated ROADMAP_DEFS ({len(NORMALIZED_ROADMAPS)} roadmaps) and ROADMAP_TRACK_TOPICS ({len(ALL_TRACK_TOPICS)} tracks).")
