import crypto from 'node:crypto';
import { getDatabase } from './index.js';
import { logger } from '../utils/logger.js';
import { normalizeYouTubeUrl } from '../utils/youtube.js';

export const NEW_COURSES_DATA = [
  // ==========================================================
  // Course 1: Artificial Intelligence Fundamentals
  // ==========================================================
  {
    id: 'c-ai-01',
    title: 'Artificial Intelligence Fundamentals',
    description: 'Master core concepts of modern Artificial Intelligence: intelligent problem-solving agents, state-space search algorithms (A*), knowledge graphs, logical inference, neural representations, and AI ethics.',
    category: 'Artificial Intelligence',
    difficultyLevel: 'Beginner',
    estimatedDuration: '6.5 hours',
    previewVideoId: '5NgNicANyqM',
    thumbnailUrl: '/images/course-ai.jpg',
    status: 'published',
    learningObjectives: [
      'Understand the foundational definitions, history, and taxonomy of artificial intelligence systems',
      'Model computational problems as search spaces and implement uninformed and informed search algorithms like A*',
      'Represent real-world knowledge using propositional logic, first-order logic, and semantic knowledge graphs',
      'Evaluate ethical considerations, algorithmic bias, and fairness in automated decision-making'
    ],
    lessons: [
      {
        id: 'l-ai-01',
        title: '1. Introduction to Artificial Intelligence & Intelligent Agents',
        topicTitle: 'Introduction to Artificial Intelligence',
        subtopicTitle: 'Types of AI systems, PEAS framework, rational agents',
        position: 1,
        status: 'published',
        videoId: 'ad79nYk2keg',
        duration: '05:32',
        channelName: 'Simplilearn',
        isPreview: 1,
        description: 'Explore the foundations of AI, the Turing test, rational agents, and the PEAS (Performance, Environment, Actuators, Sensors) framework.',
        content: `# Introduction to Artificial Intelligence & Intelligent Agents

Welcome to Artificial Intelligence Fundamentals! In this opening lesson, we explore what constitutes intelligent behavior and how computational systems simulate cognition.

## What is Artificial Intelligence?
Artificial Intelligence (AI) is the science and engineering of making machines intelligent, especially intelligent computer programs.

### The Four AI Paradigms:
1. **Thinking Humanly**: Cognitive modeling and neural science simulation.
2. **Thinking Rationally**: Logic-based inference and theorem proving.
3. **Acting Humanly**: The Turing Test operational test of intelligence.
4. **Acting Rationally**: The **Rational Agent** paradigm—acting to achieve the best expected outcome given available information.

## The PEAS Framework for Agent Design
When designing an intelligent agent, we define its operating environment using **PEAS**:
- **P**erformance measure: The metric used to evaluate success (e.g., accuracy, safety, transit time).
- **E**nvironment: Everything external to the agent (observable vs. unobservable, deterministic vs. stochastic, static vs. dynamic).
- **A**ctuators: The mechanisms through which the agent acts upon its environment (e.g., robotic joints, screen displays, database mutations).
- **S**ensors: The sensory inputs the agent perceives (e.g., cameras, LIDAR, API payloads, keystrokes).`,
        practicalExercise: 'Exercise: Write a PEAS specification for an autonomous medical triage agent. Identify at least 3 distinct sensors, actuators, and performance metrics.',
        referenceUrls: [
          'https://ai.stanford.edu/courses/',
          'https://en.wikipedia.org/wiki/Rational_agent'
        ]
      },
      {
        id: 'l-ai-02',
        title: '2. Search Algorithms: Uninformed & Informed (A* Search)',
        topicTitle: 'Search Algorithms',
        subtopicTitle: 'Problem-solving agents, BFS, DFS, Heuristics, and A* Search',
        position: 2,
        status: 'published',
        videoId: '5NgNicANyqM',
        duration: '48:15',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Deep dive into state-space representation, blind search strategies, heuristic evaluation functions, and optimal A* pathfinding.',
        content: `# Search Algorithms in Artificial Intelligence

Problem-solving agents find sequences of actions that lead to desirable goal states by traversing state-space graphs.

## Search Problem Formulation
A formal search problem consists of:
1. **Initial State**: Where the agent starts.
2. **Actions(s)**: Legal maneuvers available in state \`s\`.
3. **Transition Model Result(s, a)**: Outcome of applying action \`a\` in state \`s\`.
4. **Goal Test**: Predicate checking if current state matches the objective.
5. **Path Cost**: Numerical cost of executing the step sequence.

## Uninformed vs. Informed Search
- **Uninformed (Blind)**:
  - Breadth-First Search (BFS): Explores shallowest nodes first. Complete and optimal for uniform step costs; high memory usage ($O(b^d)$).
  - Depth-First Search (DFS): Explores deepest paths first. Space-efficient ($O(bm)$), but neither complete nor optimal.
- **Informed (Heuristic)**:
  - **A* Search**: Evaluates nodes via $f(n) = g(n) + h(n)$, where $g(n)$ is actual cost from start to $n$, and $h(n)$ is estimated cost from $n$ to goal.
  - An **admissible heuristic** never overestimates the true cost to reach the goal ($h(n) \le h^*(n)$). If $h(n)$ is admissible, tree-search A* is guaranteed to be optimal.`,
        practicalExercise: 'Exercise: Given a 5x5 grid with obstacles, compute the Manhattan distance heuristic from coordinate (0,0) to (4,4) and trace the A* frontier.',
        referenceUrls: [
          'https://cs50.harvard.edu/ai/',
          'https://en.wikipedia.org/wiki/A*_search_algorithm'
        ]
      },
      {
        id: 'l-ai-03',
        title: '3. Knowledge Representation & Knowledge Graphs',
        topicTitle: 'Knowledge Representation',
        subtopicTitle: 'Ontologies, semantic networks, and knowledge graphs',
        position: 3,
        status: 'published',
        videoId: 'JMUxmLyrhSk',
        duration: '45:10',
        channelName: 'edureka!',
        isPreview: 0,
        description: 'Understand structured knowledge representation, conceptual graphs, entity-relationship triples, and querying enterprise knowledge graphs.',
        content: `# Knowledge Representation & Knowledge Graphs

Humans organize knowledge through concepts, relationships, and taxonomies. Intelligent agents require formal structures to store and query facts.

## Semantic Networks & Triples
Knowledge graphs express facts as subject-predicate-object triples:
\`\`\`
(Patient)-[diagnosed_with]->(Pneumonia)
(Pneumonia)-[treated_by]->(Antibiotics)
\`\`\`

## Ontologies and Formal Schemas
- An **Ontology** formally represents knowledge as a set of concepts within a domain and the relationships between those concepts.
- **Resource Description Framework (RDF)** and **OWL (Web Ontology Language)** provide standard W3C formats for sharing structured knowledge.
- In modern enterprise AI, knowledge graphs ground Large Language Models (LLMs) via GraphRAG (Retrieval-Augmented Generation) to prevent hallucinations.`,
        practicalExercise: 'Exercise: Construct an RDF-style triple graph representing an e-commerce order system with Customers, Products, Warehouses, and Carriers.',
        referenceUrls: [
          'https://www.w3.org/standards/semanticweb/',
          'https://neo4j.com/developer/graph-database/'
        ]
      },
      {
        id: 'l-ai-04',
        title: '4. Reasoning and Decision-Making',
        topicTitle: 'Reasoning and Decision-Making',
        subtopicTitle: 'Propositional logic, inference rules, decision trees, and Bayesian reasoning',
        position: 4,
        status: 'published',
        videoId: 'aircAruvnKk',
        duration: '19:12',
        channelName: '3Blue1Brown',
        isPreview: 0,
        description: 'Learn logical reasoning engines, Modus Ponens, resolution refutation, decision trees, and probabilistic decision-making under uncertainty.',
        content: `# Reasoning and Decision-Making

Reasoning is the process of deriving new information and decisions from existing knowledge and sensory evidence.

## Propositional Logic and Inference
- **Modus Ponens**: If $P \\to Q$ is true and $P$ is true, then $Q$ is true.
- **Resolution**: Complete inference algorithm that proves theorems by deriving contradiction from a negated hypothesis in Conjunctive Normal Form (CNF).

## Decision Trees for Explicit Decision Logic
Decision trees recursively partition feature space by choosing splits that maximize Information Gain (reduction in Entropy):
$$H(S) = -\\sum_{i=1}^c p_i \\log_2 p_i$$

## Decision Making under Uncertainty
Real-world agents operate with noisy sensors. Bayesian inference updates belief states dynamically:
$$P(H | E) = \\frac{P(E | H) P(H)}{P(E)}$$`,
        practicalExercise: 'Exercise: Calculate the Shannon Entropy for a binary classification dataset containing 14 samples (9 positive, 5 negative).',
        referenceUrls: [
          'https://plato.stanford.edu/entries/logic-ai/',
          'https://en.wikipedia.org/wiki/Decision_tree'
        ]
      },
      {
        id: 'l-ai-05',
        title: '5. AI Applications in Real-World Industries',
        topicTitle: 'AI applications in real-world industries',
        subtopicTitle: 'Computer vision, natural language processing, and industrial automation',
        position: 5,
        status: 'published',
        videoId: '7xTGNNLPyMI',
        duration: '58:30',
        channelName: 'Andrej Karpathy',
        isPreview: 0,
        description: 'Analyze real-world deployments of AI across healthcare diagnostics, financial fraud detection, autonomous logistics, and NLP assistants.',
        content: `# Real-World AI Applications

Modern AI transforms industries by replacing manual pattern recognition with high-speed computational intelligence.

## Primary Application Domains
1. **Healthcare & Bio-computation**:
   - Automated radiological screening (CT, MRI) using convolutional architectures.
   - Protein folding predictions (AlphaFold) accelerating drug discovery.
2. **Finance & Banking**:
   - Real-time transaction fraud detection with streaming graph neural networks.
   - Algorithmic risk underwriting and anti-money laundering (AML).
3. **Autonomous Vehicles**:
   - Sensor fusion combining Camera, RADAR, and LIDAR via Kalman Filters and deep perception backbones.
4. **Natural Language Processing & LLMs**:
   - Transformer attention mechanisms enabling code generation, documentation summarization, and cognitive search assistants.`,
        practicalExercise: 'Exercise: Review an industrial case study of predictive maintenance. Identify which sensor data streams predict equipment failure.',
        referenceUrls: [
          'https://arxiv.org/abs/1706.03762',
          'https://github.com/karpathy'
        ]
      },
      {
        id: 'l-ai-06',
        title: '6. AI Ethics and Responsible AI',
        topicTitle: 'AI ethics and responsible AI',
        subtopicTitle: 'Algorithmic bias, explainable AI (XAI), safety, and governance',
        position: 6,
        status: 'published',
        videoId: 'IHZwWFHWa-w',
        duration: '21:01',
        channelName: '3Blue1Brown',
        isPreview: 0,
        description: 'Examine responsible AI principles: mitigation of training bias, model explainability (SHAP/LIME), privacy preservation, and compliance.',
        content: `# AI Ethics and Responsible AI

As autonomous systems influence credit approvals, hiring, healthcare, and justice, responsible deployment is an engineering requirement.

## Pillars of Responsible AI
1. **Fairness & Bias Mitigation**:
   - Training datasets often reflect historical societal biases. Techniques like re-weighing, adversarial debiasing, and demographic parity ensure equitable outcomes.
2. **Transparency & Explainability (XAI)**:
   - Black-box models must be interpretable. Feature attribution tools like SHAP (Shapley Additive exPlanations) reveal which input features caused a specific prediction.
3. **Data Privacy & Governance**:
   - Compliance with regulations such as GDPR and CCPA. Utilizing differential privacy and federated learning prevents training data leakage.
4. **Safety & Robustness**:
   - Protecting against adversarial perturbation attacks where imperceptible noise alters model classifications.`,
        practicalExercise: 'Exercise: Perform an algorithmic audit on a credit scoring model. Identify potential proxy variables that could inadvertently encode demographic bias.',
        referenceUrls: [
          'https://www.nist.gov/itl/ai-risk-management-framework',
          'https://pair.withgoogle.com/'
        ]
      }
    ]
  },

  // ==========================================================
  // Course 2: Machine Learning Fundamentals
  // ==========================================================
  {
    id: 'c-ml-02',
    title: 'Machine Learning Fundamentals',
    description: 'A rigorous hands-on introduction to Machine Learning: data preprocessing, supervised regression and classification, unsupervised clustering, cross-validation, and production model serving.',
    category: 'Machine Learning',
    difficultyLevel: 'Intermediate',
    estimatedDuration: '7.0 hours',
    previewVideoId: 'Gv9_4yMHFhI',
    thumbnailUrl: '/images/course-ml.jpg',
    status: 'published',
    learningObjectives: [
      'Understand the mathematical foundations of supervised and unsupervised learning algorithms',
      'Preprocess raw datasets through imputation, feature scaling, encoding, and train/test splits',
      'Train, evaluate, and tune linear models, logistic regressors, decision boundaries, and clustering algorithms',
      'Diagnose overfitting and underfitting using cross-validation, learning curves, and regularization'
    ],
    lessons: [
      {
        id: 'l-ml-01',
        title: '1. Introduction to Machine Learning & Data Preparation',
        topicTitle: 'Introduction to Machine Learning',
        subtopicTitle: 'Supervised vs unsupervised learning, data splitting, feature scaling',
        position: 1,
        status: 'published',
        videoId: 'ukzFI9rgwfU',
        duration: '12:45',
        channelName: 'Simplilearn',
        isPreview: 1,
        description: 'Understand how machines learn from data, structure training and test partitions, and apply standard feature normalization.',
        content: `# Machine Learning & Data Preparation

Machine learning enables computers to learn patterns from empirical data without being explicitly programmed with rule-based heuristics.

## The Learning Paradigm
Given task $T$, performance metric $P$, and experience $E$, a computer program is said to learn from experience $E$ with respect to $T$ and $P$ if its performance at task $T$, as measured by $P$, improves with experience $E$.

## Essential Data Preparation Pipeline
1. **Train / Test Partitioning**:
   - Never evaluate a model on the data it was trained on. Reserve 70-80% for training and 20-30% for test holdout.
2. **Missing Data Imputation**:
   - Mean/Median imputation for numerical features; mode or indicator flags for categorical variables.
3. **Feature Scaling**:
   - **Standardization (Z-score)**: $z = \\frac{x - \\mu}{\\sigma}$ (Zero mean, unit variance).
   - **Min-Max Normalization**: $x' = \\frac{x - x_{min}}{x_{max} - x_{min}}$ (Scales values into $[0, 1]$).`,
        practicalExercise: 'Exercise: Write a Python/NumPy function to standardize a 2D matrix of features using column-wise mean and standard deviation.',
        referenceUrls: [
          'https://scikit-learn.org/stable/modules/preprocessing.html',
          'https://developers.google.com/machine-learning/crash-course'
        ]
      },
      {
        id: 'l-ml-02',
        title: '2. Supervised Learning & Regression Algorithms',
        topicTitle: 'Regression algorithms',
        subtopicTitle: 'Linear regression, cost functions, gradient descent optimization',
        position: 2,
        status: 'published',
        videoId: 'Gv9_4yMHFhI',
        duration: '24:10',
        channelName: 'StatQuest with Josh Starmer',
        isPreview: 0,
        description: 'Master Ordinary Least Squares (OLS), Mean Squared Error (MSE), learning rates, and gradient descent convergence.',
        content: `# Supervised Regression Algorithms

Regression models predict continuous quantitative outcomes from a set of input predictors.

## Simple and Multiple Linear Regression
The model hypothesis represents a linear combination of input features:
$$\\hat{y} = w_0 + w_1 x_1 + w_2 x_2 + \\dots + w_n x_n = \\mathbf{w}^T \\mathbf{x}$$

## Cost Function & Optimization
We minimize the **Mean Squared Error (MSE)** loss:
$$J(\\mathbf{w}) = \\frac{1}{2m} \\sum_{i=1}^m (\\hat{y}^{(i)} - y^{(i)})^2$$

### Gradient Descent Weight Update Rule:
$$w_j := w_j - \\alpha \\frac{\\partial J(\\mathbf{w})}{\\partial w_j} = w_j - \\frac{\\alpha}{m} \\sum_{i=1}^m (\\hat{y}^{(i)} - y^{(i)}) x_j^{(i)}$$
Where $\\alpha$ is the **learning rate**. Setting $\\alpha$ too high causes divergence; setting it too low causes slow convergence.`,
        practicalExercise: 'Exercise: Derive the gradient step for the intercept parameter $w_0$ in simple linear regression.',
        referenceUrls: [
          'https://scikit-learn.org/stable/modules/linear_model.html',
          'https://statquest.org/'
        ]
      },
      {
        id: 'l-ml-03',
        title: '3. Classification Algorithms & Decision Boundaries',
        topicTitle: 'Classification algorithms',
        subtopicTitle: 'Logistic regression, sigmoid activation, decision boundaries, and SVMs',
        position: 3,
        status: 'published',
        videoId: '7eh4d6sabA0',
        duration: '44:20',
        channelName: 'Programming with Mosh',
        isPreview: 0,
        description: 'Understand classification with logistic regression, log-odds, sigmoid function, cross-entropy loss, and Support Vector Machines.',
        content: `# Classification Algorithms

Classification models predict discrete class labels (e.g., spam vs. not spam, benign vs. malignant).

## Logistic Regression
Unlike linear regression, logistic regression maps real-valued outputs to probabilities within $(0, 1)$ using the **Sigmoid Function**:
$$\\sigma(z) = \\frac{1}{1 + e^{-z}}$$
Where $z = \\mathbf{w}^T \\mathbf{x}$.

### Binary Cross-Entropy (Log Loss):
$$J(\\mathbf{w}) = -\\frac{1}{m} \\sum_{i=1}^m \\left[ y^{(i)} \\log(\\hat{y}^{(i)}) + (1 - y^{(i)}) \\log(1 - \\hat{y}^{(i)}) \\right]$$

## Decision Boundaries
A decision boundary is the hypersurface where the posterior probability $\\hat{y} = 0.5$ (equivalent to $z = \\mathbf{w}^T \\mathbf{x} = 0$).`,
        practicalExercise: 'Exercise: Given a logistic model with weights $w_0 = -2$, $w_1 = 1$, $w_2 = 1$, compute the predicted probability for input point $(1, 2)$.',
        referenceUrls: [
          'https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html',
          'https://en.wikipedia.org/wiki/Logistic_regression'
        ]
      },
      {
        id: 'l-ml-04',
        title: '4. Unsupervised Learning & Clustering Algorithms',
        topicTitle: 'Clustering algorithms',
        subtopicTitle: 'K-Means clustering, centroid initialization, inertia, and Elbow Method',
        position: 4,
        status: 'published',
        videoId: 'KNAWp2S3w94',
        duration: '16:40',
        channelName: 'TensorFlow',
        isPreview: 0,
        description: 'Discover hidden structures without labels using K-Means clustering, Voronoi partitions, and cluster validation metrics.',
        content: `# Unsupervised Clustering Algorithms

Unsupervised learning identifies inherent clusters, groupings, and low-dimensional manifolds in unlabeled data.

## K-Means Algorithm
1. Randomly initialize $K$ cluster centroids $\\mu_1, \\mu_2, \\dots, \\mu_K$.
2. **Assignment Step**: Assign each observation $x^{(i)}$ to its closest centroid:
   $$c^{(i)} := \\arg\\min_j ||x^{(i)} - \\mu_j||^2$$
3. **Update Step**: Recompute centroids as the mean of all points assigned to that cluster:
   $$\\mu_j := \\frac{1}{|C_j|} \\sum_{i \\in C_j} x^{(i)}$$
4. Repeat until convergence.

## Determining Optimal K: The Elbow Method
Plot **Inertia** (Within-Cluster Sum of Squares) against varying values of $K$. The "elbow" point indicates where adding additional clusters yields diminishing returns.`,
        practicalExercise: 'Exercise: Given 4 points (1,1), (1,2), (5,5), (5,6) and initial centroids at (1,1) and (5,6), execute one complete iteration of K-Means.',
        referenceUrls: [
          'https://scikit-learn.org/stable/modules/clustering.html#k-means',
          'https://en.wikipedia.org/wiki/K-means_clustering'
        ]
      },
      {
        id: 'l-ml-05',
        title: '5. Model Evaluation: Overfitting, Underfitting & Cross-Validation',
        topicTitle: 'Model evaluation',
        subtopicTitle: 'Bias-variance tradeoff, k-fold cross validation, and regularization',
        position: 5,
        status: 'published',
        videoId: 'i_LwzRVP7bg',
        duration: '35:22',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Diagnose the bias-variance tradeoff, implement K-fold cross-validation, and prevent overfitting via L1 (Lasso) and L2 (Ridge) penalties.',
        content: `# Model Evaluation & The Bias-Variance Tradeoff

A central challenge in machine learning is ensuring the trained model generalizes accurately to unseen production data.

## The Bias-Variance Dilemma
- **High Bias (Underfitting)**: The model is overly simplistic and fails to capture underlying patterns (e.g., fitting a straight line to quadratic data). Results in high training error and high test error.
- **High Variance (Overfitting)**: The model memorizes training noise and idiosyncrasies. Results in low training error but poor generalization on test data.

## K-Fold Cross Validation
Divide training data into $K$ equal folds. Train on $K-1$ folds and validate on the remaining fold. Repeat $K$ times and compute the mean performance across all validation splits.

## Regularization Penalties
Add a complexity penalty to the loss function:
- **L2 Regularization (Ridge)**: Adds $\\lambda \\sum w_j^2$. Penalizes large weights smoothly.
- **L1 Regularization (Lasso)**: Adds $\\lambda \\sum |w_j|$. Drives non-essential weights strictly to zero (automatic feature selection).`,
        practicalExercise: 'Exercise: Contrast L1 and L2 regularization penalties and explain why L1 produces sparse weight vectors.',
        referenceUrls: [
          'https://scikit-learn.org/stable/modules/cross_validation.html',
          'https://en.wikipedia.org/wiki/Bias%E2%80%93variance_tradeoff'
        ]
      },
      {
        id: 'l-ml-06',
        title: '6. Feature Engineering & Evaluation Metrics',
        topicTitle: 'Feature engineering',
        subtopicTitle: 'Confusion matrices, precision, recall, F1-score, and ROC curves',
        position: 6,
        status: 'published',
        videoId: 'f_uwKZIAeM0',
        duration: '14:30',
        channelName: 'OxfordSparks',
        isPreview: 0,
        description: 'Construct confusion matrices, compute precision, recall, and F1-score for imbalanced datasets, and engineer interaction features.',
        content: `# Feature Engineering & Classification Metrics

Accuracy alone is misleading on imbalanced datasets (e.g., detecting rare diseases where 99.9% of samples are negative).

## The Confusion Matrix
| | Predicted Negative | Predicted Positive |
|---|---|---|
| **Actual Negative** | True Negative (TN) | False Positive (FP) |
| **Actual Positive** | False Negative (FN) | True Positive (TP) |

## Quantitative Evaluation Metrics
- **Accuracy**: $\\frac{TP + TN}{TP + TN + FP + FN}$
- **Precision**: $\\frac{TP}{TP + FP}$ (Quality of positive predictions; crucial when false alarms are costly)
- **Recall (Sensitivity)**: $\\frac{TP}{TP + FN}$ (Fraction of actual positives captured; crucial in medical screening)
- **F1-Score**: Harmonic mean of Precision and Recall:
  $$F_1 = 2 \\times \\frac{\\text{Precision} \\times \\text{Recall}}{\\text{Precision} + \\text{Recall}}$$`,
        practicalExercise: 'Exercise: A fraud detector flags 20 cases. 15 are genuine fraud (TP), 5 are false alarms (FP), and 10 fraudulent cases were missed (FN). Compute Precision, Recall, and F1.',
        referenceUrls: [
          'https://scikit-learn.org/stable/modules/model_evaluation.html',
          'https://en.wikipedia.org/wiki/Confusion_matrix'
        ]
      },
      {
        id: 'l-ml-07',
        title: '7. Model Deployment Fundamentals',
        topicTitle: 'Model deployment fundamentals',
        subtopicTitle: 'Model serialization, ONNX format, and low-latency REST inference endpoints',
        position: 7,
        status: 'published',
        videoId: 'GwIo3gDZCVQ',
        duration: '38:50',
        channelName: 'edureka!',
        isPreview: 0,
        description: 'Package trained models into portable artifacts, build REST microservice endpoints, and monitor data drift in production.',
        content: `# Model Deployment Fundamentals

An ML model delivers business value only when integrated into reliable software systems that serve real-time predictions.

## Serialization & Model Artifacts
- **Joblib / Pickle**: Serializes Python objects directly into binary files.
- **ONNX (Open Neural Network Exchange)**: An open format built to represent machine learning models, enabling cross-language inference (e.g., train in Python, execute in C++ or Node.js with high throughput).

## Production Serving Architectures
1. **Real-Time REST/gRPC API**: Client sends JSON payload $\\to$ model returns inference within 20ms.
2. **Batch Scoring**: Scheduled worker runs predictions across millions of records stored in data warehouses.
3. **Data Drift Monitoring**: Monitoring production input distributions against training baseline distributions using Kolmogorov-Smirnov statistical tests.`,
        practicalExercise: 'Exercise: Design a Node.js/Fastify endpoint that loads an exported model artifact and validates incoming JSON feature payloads.',
        referenceUrls: [
          'https://onnx.ai/',
          'https://ml-ops.org/'
        ]
      }
    ]
  },

  // ==========================================================
  // Course 3: Data Science and Analytics
  // ==========================================================
  {
    id: 'c-ds-03',
    title: 'Data Science and Analytics',
    description: 'Transform raw data into strategic business value: exploratory data analysis, data wrangling with Pandas, statistical hypothesis testing, beautiful visualizations, and data storytelling.',
    category: 'Data Science',
    difficultyLevel: 'Beginner',
    estimatedDuration: '6.0 hours',
    previewVideoId: 'ua-CiDNNj30',
    thumbnailUrl: '/images/course-ds.jpg',
    status: 'published',
    learningObjectives: [
      'Navigate the end-to-end data science lifecycle from business question to executive insight',
      'Wrangle messy real-world datasets with Pandas, handling missing values, duplicates, and type mismatches',
      'Compute descriptive statistics, inferential probability distributions, and execute statistical hypothesis tests',
      'Synthesize analytical findings into compelling visual narratives using charts, plots, and dashboards'
    ],
    lessons: [
      {
        id: 'l-ds-01',
        title: '1. The Data Science Lifecycle & Workflow',
        topicTitle: 'Data science lifecycle',
        subtopicTitle: 'CRISP-DM methodology, framing business questions, and pipeline design',
        position: 1,
        status: 'published',
        videoId: 'ua-CiDNNj30',
        duration: '42:10',
        channelName: 'freeCodeCamp.org',
        isPreview: 1,
        description: 'Understand the end-to-end lifecycle of data projects: question formulation, extraction, transformation, and validation.',
        content: `# The Data Science Lifecycle

Data science bridges technical statistical modeling with practical business decisions.

## The CRISP-DM Framework
1. **Business Understanding**: Define objectives and success criteria from a business perspective.
2. **Data Understanding**: Collect, inspect, and identify initial data quality concerns.
3. **Data Preparation**: Clean, construct, integrate, and format tabular datasets.
4. **Modeling**: Apply analytics and statistical techniques.
5. **Evaluation**: Assess model outputs against business objectives.
6. **Deployment**: Automate pipeline execution and reporting.`,
        practicalExercise: 'Exercise: Outline the 6 CRISP-DM steps for a churn prediction project in a subscription software business.',
        referenceUrls: [
          'https://en.wikipedia.org/wiki/Cross-industry_standard_process_for_data_mining',
          'https://www.datasciencecentral.com/'
        ]
      },
      {
        id: 'l-ds-02',
        title: '2. Data Collection & Cleaning with Pandas',
        topicTitle: 'Data cleaning',
        subtopicTitle: 'Ingesting CSV/JSON, handling null values, outlier filtering',
        position: 2,
        status: 'published',
        videoId: 'vmEHCJofslg',
        duration: '31:25',
        channelName: 'Keith Galli',
        isPreview: 0,
        description: 'Perform real-world data wrangling using Python and Pandas: parsing strings, coercing dates, and handling missing observations.',
        content: `# Data Wrangling with Pandas

In real-world data science, over 80% of project time is spent gathering and cleaning unstructured data.

## Fundamental Data Cleaning Operations
\`\`\`python
import pandas as pd

# Load dataset
df = pd.read_csv('telecom_churn.csv')

# Inspect missing values
print(df.isnull().sum())

# Impute median values for skewed numeric columns
df['monthly_charges'] = df['monthly_charges'].fillna(df['monthly_charges'].median())

# Coerce date strings to datetime objects
df['signup_date'] = pd.to_datetime(df['signup_date'], errors='coerce')

# Filter anomalous outliers via Interquartile Range (IQR)
Q1 = df['tenure'].quantile(0.25)
Q3 = df['tenure'].quantile(0.75)
IQR = Q3 - Q1
df = df[(df['tenure'] >= Q1 - 1.5 * IQR) & (df['tenure'] <= Q3 + 1.5 * IQR)]
\`\`\``,
        practicalExercise: 'Exercise: Write Pandas code to deduplicate a transaction table based on user_id and timestamp, keeping the most recent entry.',
        referenceUrls: [
          'https://pandas.pydata.org/docs/user_guide/index.html',
          'https://realpython.com/pandas-python-explore/'
        ]
      },
      {
        id: 'l-ds-03',
        title: '3. Exploratory Data Analysis & Descriptive Statistics',
        topicTitle: 'Exploratory data analysis',
        subtopicTitle: 'Measures of central tendency, dispersion, correlation matrices',
        position: 3,
        status: 'published',
        videoId: 'LHBE6Q9XlzI',
        duration: '28:40',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Compute summary statistics, analyze distributions, detect correlations, and identify anomalies before formal modeling.',
        content: `# Exploratory Data Analysis (EDA)

Exploratory Data Analysis is an investigative approach to analyzing datasets to summarize their main characteristics with visual and statistical methods.

## Summary Statistics
- **Central Tendency**: Mean (sensitive to outliers), Median (robust), Mode.
- **Dispersion**: Variance ($\\sigma^2$), Standard Deviation ($\\sigma$), Interquartile Range (IQR).
- **Correlation**: Pearson correlation coefficient measures linear relationship between two continuous variables:
  $$r = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum (x_i - \\bar{x})^2 \\sum (y_i - \\bar{y})^2}}$$
  Note: Correlation does not imply causation!`,
        practicalExercise: 'Exercise: Given a dataset with severe right skew, explain why the median is a more representative metric than the mean.',
        referenceUrls: [
          'https://en.wikipedia.org/wiki/Exploratory_data_analysis',
          'https://seaborn.pydata.org/'
        ]
      },
      {
        id: 'l-ds-04',
        title: '4. Probability Fundamentals & Hypothesis Testing',
        topicTitle: 'Hypothesis testing',
        subtopicTitle: 'Null hypothesis, p-values, significance levels (alpha), and two-sample t-tests',
        position: 4,
        status: 'published',
        videoId: 'xxpc-HPKN28',
        duration: '35:15',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Understand hypothesis testing, statistical significance, Type I/II errors, and validating product A/B tests.',
        content: `# Hypothesis Testing & Statistical Significance

Hypothesis testing provides a mathematical framework for deciding whether experimental differences are statistically significant or merely due to random chance.

## Core Hypothesis Testing Steps
1. **State Hypotheses**:
   - $H_0$ (Null Hypothesis): The treatment has no effect (e.g., Conversion Rate A = Conversion Rate B).
   - $H_1$ (Alternative Hypothesis): There is a true observed difference.
2. **Choose Significance Level ($\\alpha$)**: Typically set to 0.05 (5% risk of false positive).
3. **Compute Test Statistic**: (e.g., Student's $t$-statistic or $z$-score).
4. **Determine $p$-value**: The probability of observing results at least as extreme as the sample data, assuming $H_0$ is true.
   - If $p < \\alpha$: Reject $H_0$ (statistically significant).
   - If $p \\ge \\alpha$: Fail to reject $H_0$.`,
        practicalExercise: 'Exercise: A company runs an A/B test with 10,000 users per group. Group A converts at 4.2%, Group B converts at 4.8%. Set up the null and alternative hypotheses.',
        referenceUrls: [
          'https://openstax.org/details/books/introductory-statistics',
          'https://en.wikipedia.org/wiki/Statistical_hypothesis_testing'
        ]
      },
      {
        id: 'l-ds-05',
        title: '5. Data Visualization Essentials with Seaborn & Matplotlib',
        topicTitle: 'Data visualization',
        subtopicTitle: 'Chart types, color palettes, visual encodings, and multi-variable plots',
        position: 5,
        status: 'published',
        videoId: 'GPVsHOlRBBI',
        duration: '32:00',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Master visual encodings, choosing appropriate chart types, plotting distributions, and customizing publication-ready figures.',
        content: `# Data Visualization Essentials

Data visualization translates complex tabular figures into intuitive visual graphics that reveal patterns, trends, and outliers.

## Choosing the Right Chart Type
- **Distributions**: Histograms and Kernel Density Estimates (KDE).
- **Categorical Comparisons**: Bar charts and box plots (comparing median and quartiles across groups).
- **Continuous Relationships**: Scatter plots and line charts.
- **Correlations**: Heatmaps with annotated coefficients.

## Clean Design Rules
1. Eliminate non-data ink (excessive grid lines, redundant borders).
2. Use accessible color palettes (colorblind-friendly Viridis, Plasma).
3. Always label axes with physical units (e.g., "Revenue ($ Millions)").`,
        practicalExercise: 'Exercise: Generate a Seaborn pairplot comparing 4 numeric metrics across 3 customer tiers.',
        referenceUrls: [
          'https://matplotlib.org/stable/tutorials/index.html',
          'https://seaborn.pydata.org/tutorial.html'
        ]
      },
      {
        id: 'l-ds-06',
        title: '6. Business Analytics & Data Storytelling',
        topicTitle: 'Data storytelling',
        subtopicTitle: 'Actionable executive insights, narrative structure, and stakeholder presentations',
        position: 6,
        status: 'published',
        videoId: 'r-uOLxNrNk8',
        duration: '27:18',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Synthesize data analysis into compelling stories for executive decision-makers, connecting numbers to business impact.',
        content: `# Data Storytelling & Business Analytics

Data by itself is inert; insights become valuable only when communicated effectively to drive strategic organizational change.

## The Anatomy of a Data Story
1. **Context & Problem**: What business question or market challenge are we addressing?
2. **Climax (The Insight)**: What unexpected anomaly or breakthrough trend does the data reveal?
3. **Recommended Action**: What concrete operational steps should stakeholders execute based on the evidence?

## Tips for Executive Communication
- Start with the conclusion (BLUF: Bottom Line Up Front).
- Quantify financial and operational impact directly (e.g., "$1.2M potential cost savings").
- Anticipate counter-arguments and state confidence intervals explicitly.`,
        practicalExercise: 'Exercise: Write a 1-page executive memo summarizing an analysis of quarterly customer churn for the Chief Product Officer.',
        referenceUrls: [
          'https://www.storytellingwithdata.com/',
          'https://hbr.org/2013/04/how-to-tell-a-story-with-data'
        ]
      }
    ]
  },

  // ==========================================================
  // Course 4: Cybersecurity Fundamentals
  // ==========================================================
  {
    id: 'c-sec-04',
    title: 'Cybersecurity Fundamentals',
    description: 'Learn modern defense-in-depth security principles: the CIA triad, network security, packet analysis, identity and access management, encryption, web application vulnerabilities (OWASP), and incident response.',
    category: 'Cybersecurity',
    difficultyLevel: 'Intermediate',
    estimatedDuration: '5.5 hours',
    previewVideoId: 'inWWhr5tnEA',
    thumbnailUrl: '/images/course-security.jpg',
    status: 'published',
    learningObjectives: [
      'Apply the CIA Triad and defense-in-depth principles to evaluate organizational security architecture',
      'Analyze network traffic, protocols, and packet captures to detect unauthorized scanning and exfiltration',
      'Implement multi-factor authentication, role-based access control, and modern cryptographic protocols',
      'Identify and remediate the OWASP Top 10 web vulnerabilities including SQL Injection and Cross-Site Scripting'
    ],
    lessons: [
      {
        id: 'l-sec-01',
        title: '1. Security Principles & Threat Landscape',
        topicTitle: 'Security principles',
        subtopicTitle: 'The CIA Triad, Defense in Depth, and threat modeling frameworks',
        position: 1,
        status: 'published',
        videoId: 'inWWhr5tnEA',
        duration: '07:22',
        channelName: 'Simplilearn',
        isPreview: 1,
        description: 'Learn the cornerstone security principles: Confidentiality, Integrity, Availability, and STRIDE threat modeling.',
        content: `# Security Principles & Threat Landscape

Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks aimed at accessing, altering, or destroying sensitive information.

## The CIA Triad
1. **Confidentiality**: Ensuring data is accessible only to authorized entities (encryption, ACLs, classification).
2. **Integrity**: Safeguarding the accuracy and completeness of information against unauthorized modification (checksums, digital signatures, hashing).
3. **Availability**: Guaranteeing authorized users timely and reliable access to assets (redundancy, DDoS mitigation, failover clustering).

## Defense in Depth (Layered Defense)
Security is never a single wall. Multiple overlapping layers protect the perimeter:
- Perimeter (Firewalls, WAF)
- Network (VLAN segmentation, zero-trust routing)
- Endpoint (EDR, OS hardening)
- Application (Secure coding, input validation)
- Data (Encryption at rest and in transit)`,
        practicalExercise: 'Exercise: Conduct a STRIDE threat modeling analysis on an online banking password-reset workflow.',
        referenceUrls: [
          'https://csrc.nist.gov/glossary/term/cia_triad',
          'https://owasp.org/www-community/Threat_Modeling'
        ]
      },
      {
        id: 'l-sec-02',
        title: '2. Common Cyber Threats & Attack Vectors',
        topicTitle: 'Common cyber threats',
        subtopicTitle: 'Phishing, ransomware, social engineering, and supply chain attacks',
        position: 2,
        status: 'published',
        videoId: 'sdpxddDzXfE',
        duration: '18:50',
        channelName: 'NOVA PBS Official',
        isPreview: 0,
        description: 'Inspect modern attack vectors: spear phishing, ransomware extortion, credential stuffing, and third-party dependencies.',
        content: `# Common Cyber Threats & Attack Vectors

Understanding adversarial methodologies is required to construct robust defensive controls.

## Modern Threat Taxonomy
- **Phishing & Social Engineering**: Deceptive communications designed to trick users into divulging credentials or executing malware.
- **Ransomware**: Malicious payloads that encrypt local and network filesystems using strong asymmetric cryptography, demanding ransom for decryption keys.
- **Credential Stuffing**: Automated injection of breached username/password pairs across millions of login portals.
- **Supply Chain Attacks**: Compromising an upstream software dependency or build pipeline (e.g., SolarWinds, compromised npm packages).`,
        practicalExercise: 'Exercise: Inspect email headers from a simulated phishing message to extract origin IP addresses, SPF, and DKIM verification results.',
        referenceUrls: [
          'https://www.cisa.gov/topics/cyber-threats',
          'https://attack.mitre.org/'
        ]
      },
      {
        id: 'l-sec-03',
        title: '3. Network Security & Packet Inspection',
        topicTitle: 'Network security fundamentals',
        subtopicTitle: 'Firewalls, DMZ, Wireshark packet capture, and intrusion detection',
        position: 3,
        status: 'published',
        videoId: '3Kq1MIfTWCE',
        duration: '45:30',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Examine OSI layers, TCP three-way handshake, stateful packet filtering, and analyzing network traffic in Wireshark.',
        content: `# Network Security & Packet Inspection

Networks serve as the circulatory system of modern infrastructure. Defending them requires deep visibility into packet flows and protocol behavior.

## Packet Inspection & Wireshark
- **TCP Three-Way Handshake**: SYN $\\to$ SYN-ACK $\\to$ ACK.
- **Port Scanning**: Attackers probe open ports (e.g., via Nmap) using SYN scans.
- **Intrusion Detection Systems (IDS)**: Snort and Suricata inspect packet payloads against signature databases to alert on malicious traffic patterns.`,
        practicalExercise: 'Exercise: In a sandboxed Wireshark trace, identify an unauthorized port scan by analyzing TCP SYN packet distribution over time.',
        referenceUrls: [
          'https://www.wireshark.org/docs/',
          'https://nmap.org/book/man.html'
        ]
      },
      {
        id: 'l-sec-04',
        title: '4. Identity & Access Management (IAM)',
        topicTitle: 'Identity and access management',
        subtopicTitle: 'Authentication, Authorization, Multi-Factor Authentication (MFA), and RBAC',
        position: 4,
        status: 'published',
        videoId: 'qwA6MmbeGNo',
        duration: '32:15',
        channelName: 'The Cyber Mentors',
        isPreview: 0,
        description: 'Implement secure identity management: password hashing algorithms, FIDO2/WebAuthn MFA, and Role-Based Access Control.',
        content: `# Identity & Access Management (IAM)

Identity is the modern security perimeter in cloud and distributed architectures.

## Authentication vs. Authorization
- **Authentication (AuthN)**: Verifying who you are (passwords, biometrics, hardware tokens).
- **Authorization (AuthZ)**: Verifying what permissions you possess (RBAC, ABAC).

## Multi-Factor Authentication (MFA)
Requires proof from two or more independent factors:
1. Something you **know** (password, PIN).
2. Something you **have** (smartphone authenticator app, YubiKey hardware token).
3. Something you **are** (biometrics: fingerprint, retina).`,
        practicalExercise: 'Exercise: Design a Role-Based Access Control matrix for an LMS application supporting Student, Instructor, and Admin roles.',
        referenceUrls: [
          'https://auth0.com/intro-to-iam',
          'https://fidoalliance.org/fido2/'
        ]
      },
      {
        id: 'l-sec-05',
        title: '5. Encryption Basics & Cryptography',
        topicTitle: 'Encryption basics',
        subtopicTitle: 'Symmetric vs asymmetric ciphers, hashing, and TLS handshakes',
        position: 5,
        status: 'published',
        videoId: 'hXSFdwIOfnE',
        duration: '38:40',
        channelName: 'Simplilearn',
        isPreview: 0,
        description: 'Understand cryptography: AES-256 block ciphers, RSA public-key exchange, SHA-256 hashing, and TLS 1.3 encryption in transit.',
        content: `# Cryptography & Encryption Basics

Cryptography provides mathematical guarantees of confidentiality, data integrity, and non-repudiation.

## Symmetric vs. Asymmetric Encryption
- **Symmetric Encryption (AES-GCM)**: Uses the same secret key for encryption and decryption. Highly fast; ideal for encrypting bulk storage.
- **Asymmetric Encryption (RSA, ECC)**: Uses a mathematically paired public key (for encryption/verification) and private key (for decryption/signing). Solves the key exchange problem.

## Cryptographic Hashing
One-way mathematical functions (e.g., SHA-256):
- Deterministic: Same input always produces identical digest.
- Non-reversible: Cannot compute input from digest.
- Avalanche Effect: A 1-bit change in input alters over 50% of output bits.`,
        practicalExercise: 'Exercise: Generate an RSA-4096 keypair using openssl and encrypt a mock secret file with the public key.',
        referenceUrls: [
          'https://en.wikipedia.org/wiki/Transport_Layer_Security',
          'https://www.openssl.org/'
        ]
      },
      {
        id: 'l-sec-06',
        title: '6. Web Application Security & OWASP Top 10',
        topicTitle: 'Web application security',
        subtopicTitle: 'SQL injection, Cross-Site Scripting (XSS), CSRF, and defensive validation',
        position: 6,
        status: 'published',
        videoId: '2_lswM1S264',
        duration: '52:10',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Analyze the OWASP Top 10 vulnerabilities, understand exploitation mechanics, and write defensive code with parameterized queries.',
        content: `# Web Application Security & OWASP Top 10

Web applications represent the most accessible attack surface for organizations.

## Critical Vulnerabilities & Remediation
1. **Injection (SQLi)**: Untrusted input concatenated directly into SQL queries.
   - *Defense*: Parameterized queries and prepared statements.
2. **Cross-Site Scripting (XSS)**: Unsanitized user inputs reflected into browser DOM, executing arbitrary JavaScript.
   - *Defense*: Context-aware output encoding and Content Security Policy (CSP).
3. **Broken Object-Level Authorization (BOLA/IDOR)**: Exposing database primary keys without verifying user ownership.
   - *Defense*: Enforce strict server-side authorization checks on every resource request.`,
        practicalExercise: 'Exercise: Refactor a vulnerable raw SQL query string into a safe parameterized SQLite prepared statement.',
        referenceUrls: [
          'https://owasp.org/www-project-top-ten/',
          'https://cheatsheetseries.owasp.org/'
        ]
      },
      {
        id: 'l-sec-07',
        title: '7. Vulnerability Management & Incident Response',
        topicTitle: 'Incident response',
        subtopicTitle: 'CVE databases, patch management cycles, and NIST incident response phases',
        position: 7,
        status: 'published',
        videoId: 'dz7Ntp7KQGA',
        duration: '41:15',
        channelName: 'edureka!',
        isPreview: 0,
        description: 'Examine incident response procedures: NIST SP 800-61 phases, log auditing, containment strategies, and forensic analysis.',
        content: `# Vulnerability Management & Incident Response

Security incidents are inevitable. Effective organizations prepare playbooks to detect, contain, and recover with minimal operational downtime.

## NIST Incident Response Lifecycle
1. **Preparation**: Establish incident response teams, communication out-of-band channels, and monitoring tools.
2. **Detection & Analysis**: Correlate SIEM alerts, identify anomalous network flows, and verify breach validity.
3. **Containment, Eradication & Recovery**: Isolate compromised subnets, revoke leaked API keys, patch vulnerabilities, and restore from trusted backups.
4. **Post-Incident Activity (Lessons Learned)**: Root cause analysis (RCA), updating preventative controls and playbooks.`,
        practicalExercise: 'Exercise: Draft a 5-step containment procedure for a compromised production server exhibiting outbound cryptomining traffic.',
        referenceUrls: [
          'https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final',
          'https://nvd.nist.gov/'
        ]
      }
    ]
  },

  // ==========================================================
  // Course 5: Blockchain Technology
  // ==========================================================
  {
    id: 'c-block-05',
    title: 'Blockchain Technology',
    description: 'Understand the architecture of decentralized computing: distributed ledgers, cryptographic hashing, consensus algorithms (PoW vs PoS), smart contract development with Solidity, and dApps.',
    category: 'Blockchain',
    difficultyLevel: 'Intermediate',
    estimatedDuration: '5.0 hours',
    previewVideoId: 'bBC-nXj3Ng4',
    thumbnailUrl: '/images/course-blockchain.jpg',
    status: 'published',
    learningObjectives: [
      'Understand the architecture of distributed ledgers, blocks, and cryptographically linked chains',
      'Analyze the mechanics of hashing algorithms, public-private key cryptography, and digital signatures',
      'Compare consensus mechanisms including Proof of Work, Proof of Stake, and Byzantine Fault Tolerance',
      'Design, test, and audit smart contracts in safe local sandbox development environments'
    ],
    lessons: [
      {
        id: 'l-block-01',
        title: '1. Blockchain Fundamentals & Distributed Ledgers',
        topicTitle: 'Blockchain fundamentals',
        subtopicTitle: 'Peer-to-peer networks, block structure, and state transitions',
        position: 1,
        status: 'published',
        videoId: 'SSo_EIwHSd4',
        duration: '06:00',
        channelName: 'Simply Explained',
        isPreview: 1,
        description: 'Learn how blockchains maintain distributed consensus across trustless nodes without central authorities.',
        content: `# Blockchain Fundamentals & Distributed Ledgers

A blockchain is a decentralized, distributed, and cryptographically secured digital ledger that records transactions across a network of computers.

## The Anatomy of a Block
Every block in the chain consists of:
- **Block Header**: Contains version, timestamp, difficulty target, nonce, and the **hash of the previous block**.
- **Merkle Tree Root**: Cryptographic summary of all transactions included within the block.
- **Transaction List**: Verified atomic state transitions.`,
        practicalExercise: 'Exercise: Manually compute the link between two blocks by calculating the SHA-256 hash of a header containing the previous block hash.',
        referenceUrls: [
          'https://bitcoin.org/bitcoin.pdf',
          'https://ethereum.org/en/developers/docs/'
        ]
      },
      {
        id: 'l-block-02',
        title: '2. Cryptographic Hashing & Digital Signatures',
        topicTitle: 'Cryptographic hashing',
        subtopicTitle: 'SHA-256, Elliptic Curve Cryptography (ECDSA), and public/private key pairs',
        position: 2,
        status: 'published',
        videoId: 'bBC-nXj3Ng4',
        duration: '26:05',
        channelName: '3Blue1Brown',
        isPreview: 0,
        description: 'Understand the mathematics of SHA-256 hashing, asymmetric digital signatures, and public-key account derivation.',
        content: `# Cryptographic Hashing & Digital Signatures

Cryptographic primitives form the unforgeable trust layer of blockchain networks.

## Digital Signatures with ECDSA
- Private keys must remain strictly confidential.
- Public keys are derived from private keys via elliptic curve multiplication ($P = k \\cdot G$).
- Digital signatures prove ownership of assets without revealing the underlying private key.`,
        practicalExercise: 'Exercise: Write a Node.js crypto script that signs an arbitrary message with a private key and verifies the signature using the corresponding public key.',
        referenceUrls: [
          'https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm',
          'https://nodejs.org/api/crypto.html'
        ]
      },
      {
        id: 'l-block-03',
        title: '3. Consensus Mechanisms: PoW, PoS & BFT',
        topicTitle: 'Consensus mechanisms',
        subtopicTitle: 'Proof of Work, Proof of Stake, Byzantine Fault Tolerance, and finality',
        position: 3,
        status: 'published',
        videoId: 'qOVAbKKSH10',
        duration: '34:20',
        channelName: 'Coding Tech',
        isPreview: 0,
        description: 'Compare Proof of Work (Nakamoto consensus) and Proof of Stake (energy efficiency, slashing, finality).',
        content: `# Consensus Mechanisms in Distributed Networks

Consensus mechanisms solve the Byzantine Generals Problem: how can independent nodes agree on a single source of truth over an unreliable network?

## Proof of Work (PoW) vs. Proof of Stake (PoS)
- **Proof of Work**: Nodes (miners) compete to find a cryptographic nonce satisfying a difficulty target. Computationally intensive.
- **Proof of Stake**: Validators lock capital (stake) as collateral. A pseudo-random algorithm selects validators to propose and attest to new blocks. Misbehavior results in **slashing** (forfeiture of stake).`,
        practicalExercise: 'Exercise: Calculate how network difficulty dynamically adjusts when average block creation time drops below the target interval.',
        referenceUrls: [
          'https://ethereum.org/en/developers/docs/consensus-mechanisms/',
          'https://en.wikipedia.org/wiki/Proof_of_stake'
        ]
      },
      {
        id: 'l-block-04',
        title: '4. Smart Contract Fundamentals & The EVM',
        topicTitle: 'Smart contract fundamentals',
        subtopicTitle: 'Ethereum Virtual Machine (EVM), gas mechanics, and state persistence',
        position: 4,
        status: 'published',
        videoId: 'ZE2HxTmxfrI',
        duration: '04:12',
        channelName: 'Simply Explained',
        isPreview: 0,
        description: 'Learn deterministic code execution in the Ethereum Virtual Machine, gas metering, and contract state storage.',
        content: `# Smart Contracts & The Ethereum Virtual Machine

Smart contracts are autonomous computer programs deployed directly onto the blockchain that execute automatically when predefined conditions are met.

## Gas Mechanics & Halting Problem
Because the EVM is Turing-complete, an infinite loop could freeze the network. **Gas** solves this: every opcode consumes gas paid by the transaction sender. If gas is exhausted, state changes revert.`,
        practicalExercise: 'Exercise: Write a simple Solidity smart contract that implements an owner-restricted counter with increment and reset functions.',
        referenceUrls: [
          'https://docs.soliditylang.org/',
          'https://remix.ethereum.org/'
        ]
      },
      {
        id: 'l-block-05',
        title: '5. Decentralized Applications (dApps) & Web3',
        topicTitle: 'Decentralized applications',
        subtopicTitle: 'Frontend integration with Ethers.js, JSON-RPC providers, and IPFS storage',
        position: 5,
        status: 'published',
        videoId: 'coQ5dg8wM2o',
        duration: '48:10',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Connect client-side web applications to smart contracts using Web3 provider interfaces, wallet signatures, and event listeners.',
        content: `# Decentralized Applications (dApps) Architecture

A dApp pairs a modern reactive frontend (React, Vite) with backend smart contracts executing on a decentralized blockchain network.

## The dApp Architecture Stack
1. **Frontend**: Standard HTML/CSS/JS communicating via browser wallet extensions.
2. **Provider**: JSON-RPC connection to a blockchain node.
3. **Decentralized Storage**: Storing large binary assets (images, video metadata) on IPFS or Arweave rather than expensive on-chain storage.`,
        practicalExercise: 'Exercise: Write JavaScript code using ethers.js to query the current block number and account balance from a local test node.',
        referenceUrls: [
          'https://docs.ethers.org/',
          'https://ipfs.tech/'
        ]
      },
      {
        id: 'l-block-06',
        title: '6. Enterprise Blockchain & Security Auditing',
        topicTitle: 'Enterprise blockchain use cases',
        subtopicTitle: 'Permissioned ledgers, common smart contract vulnerabilities (Reentrancy), and audits',
        position: 6,
        status: 'published',
        videoId: 'M576WGiDBdQ',
        duration: '42:40',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Study enterprise permissioned networks (Hyperledger Fabric), supply chain tracking, and auditing for reentrancy attacks.',
        content: `# Blockchain Security & Enterprise Use Cases

Because smart contracts are immutable once deployed, security flaws cannot be patched via simple server restarts. Auditing is paramount.

## Classic Smart Contract Vulnerabilities
- **Reentrancy**: Occurs when an external contract calls back into the calling contract before state variables are updated (The DAO Hack).
  - *Fix*: Checks-Effects-Interactions pattern and OpenZeppelin ReentrancyGuard.
- **Integer Overflow/Underflow**: Prevented natively in modern Solidity (0.8+).
- **Enterprise Blockchains**: Permissioned networks (Hyperledger, Corda) restricting participation to verified enterprise consortium members.`,
        practicalExercise: 'Exercise: Review a code snippet containing a reentrancy vulnerability and refactor it using the Checks-Effects-Interactions pattern.',
        referenceUrls: [
          'https://consensys.github.io/smart-contract-best-practices/',
          'https://www.hyperledger.org/'
        ]
      }
    ]
  },

  // ==========================================================
  // Course 6: Internet of Things (IoT)
  // ==========================================================
  {
    id: 'c-iot-06',
    title: 'Internet of Things (IoT)',
    description: 'Connect the physical and digital worlds: embedded microcontrollers (ESP32/Arduino), sensors, actuators, edge telemetry, MQTT broker communications, and cloud IoT integration.',
    category: 'Internet of Things',
    difficultyLevel: 'Intermediate',
    estimatedDuration: '5.5 hours',
    previewVideoId: '6mBO2vqLv38',
    thumbnailUrl: '/images/course-iot.jpg',
    status: 'published',
    learningObjectives: [
      'Understand IoT multi-tier architecture spanning sensors, edge gateways, network brokers, and cloud data lakes',
      'Interface analog and digital sensors with microcontrollers using GPIO, ADC, PWM, I2C, and SPI protocols',
      'Implement reliable, low-bandwidth telemetry transmission using MQTT publish/subscribe messaging',
      'Design simulated edge computing workflows for device security, filtering, and telemetry pipelines'
    ],
    lessons: [
      {
        id: 'l-iot-01',
        title: '1. IoT Architecture & Ecosystem Overview',
        topicTitle: 'IoT architecture',
        subtopicTitle: 'Multi-layer IoT architecture: Perception, Network, Middleware, and Application layers',
        position: 1,
        status: 'published',
        videoId: '6mBO2vqLv38',
        duration: '06:12',
        channelName: 'Simplilearn',
        isPreview: 1,
        description: 'Explore the 4-layer IoT architecture, industrial vs smart home deployments, and edge-to-cloud telemetry pipelines.',
        content: `# Internet of Things (IoT) Architecture

The Internet of Things (IoT) describes the network of physical objects embedded with sensors, software, and connectivity to exchange data with other devices and systems over the internet.

## The 4-Tier IoT Architecture
1. **Perception Layer (Sensors & Actuators)**: Physical interactions—measuring temperature, humidity, acceleration, or triggering relays.
2. **Network Layer (Connectivity)**: Transmitting data via Wi-Fi, BLE, LoRaWAN, Cellular (NB-IoT), or Zigbee.
3. **Middleware Layer (Data Processing & Brokers)**: Message queuing, broker ingestion (MQTT), authentication, and device shadows.
4. **Application Layer (Analytics & Dashboards)**: Business monitoring, predictive maintenance alerts, and user controls.`,
        practicalExercise: 'Exercise: Draw an architectural diagram of a smart greenhouse IoT deployment showing sensors, edge microcontroller, MQTT broker, and cloud dashboard.',
        referenceUrls: [
          'https://en.wikipedia.org/wiki/Internet_of_things',
          'https://mqtt.org/'
        ]
      },
      {
        id: 'l-iot-02',
        title: '2. Sensors, Actuators & Signal Conversion',
        topicTitle: 'Sensors and actuators',
        subtopicTitle: 'Analog vs digital sensors, ADC conversion, GPIO pinout, and actuators',
        position: 2,
        status: 'published',
        videoId: 'UrwbeOIlc68',
        duration: '33:45',
        channelName: 'edureka!',
        isPreview: 0,
        description: 'Understand hardware interfaces: reading analog voltages with ADCs, digital pulses, pulse-width modulation (PWM), and driving actuators.',
        content: `# Sensors, Actuators & Signal Conversion

Microcontrollers bridge computational logic with physical physics through electrical signals.

## Signal Acquisition
- **Analog Sensors**: Output continuous voltages (e.g., photoresistors, thermistors). Requires an **Analog-to-Digital Converter (ADC)** to translate 0-3.3V into digital integers (e.g., 0-4095 on 12-bit ADC).
- **Digital Sensors**: Communicate via serial buses (I2C, SPI, UART) transmitting packets with integrated calibration (e.g., DHT22, BME280).
- **Actuators**: Components that act upon the physical world (solenoids, relays, stepper motors, servo controllers).`,
        practicalExercise: 'Exercise: Calculate the digital integer read by a 10-bit ADC (0-1023) receiving an analog sensor voltage of 1.65V from a 3.3V reference.',
        referenceUrls: [
          'https://learn.sparkfun.com/tutorials/analog-vs-digital',
          'https://www.adafruit.com/'
        ]
      },
      {
        id: 'l-iot-03',
        title: '3. Microcontroller Fundamentals (ESP32 / Arduino)',
        topicTitle: 'Microcontroller fundamentals',
        subtopicTitle: 'Microcontroller architectures, memory limitations, sleep modes, and firmware',
        position: 3,
        status: 'published',
        videoId: 'eidD14dXW8s',
        duration: '46:18',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Explore microcontroller constraints: dual-core processors, flash storage, deep-sleep power management, and real-time execution loops.',
        content: `# Microcontroller Fundamentals

Microcontrollers are compact integrated circuits designed to govern a specific operation in an embedded system.

## The ESP32 Platform
- Dual-core Xtensa 32-bit LX6 microprocessor.
- Integrated Wi-Fi (802.11 b/g/n) and Bluetooth (BLE).
- Low power consumption: Deep sleep draws only ~10$\\mu$A, enabling battery operation for years in remote environmental monitoring.
- Programming model: \`setup()\` runs once for initialization; \`loop()\` executes continuously.`,
        practicalExercise: 'Exercise: Write pseudocode for an ESP32 firmware routine that wakes from deep sleep, samples a temperature sensor, and returns to sleep for 60 seconds.',
        referenceUrls: [
          'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/',
          'https://www.arduino.cc/'
        ]
      },
      {
        id: 'l-iot-04',
        title: '4. Device Connectivity & MQTT Messaging',
        topicTitle: 'MQTT messaging',
        subtopicTitle: 'Publish/subscribe architecture, topic hierarchies, QoS levels, and keepalives',
        position: 4,
        status: 'published',
        videoId: 'LlhmzVL5bm8',
        duration: '38:10',
        channelName: 'edureka!',
        isPreview: 0,
        description: 'Master the lightweight MQTT protocol: broker architecture, topic filters, Quality of Service guarantees, and Last Will and Testament.',
        content: `# MQTT Messaging Protocol

HTTP has high header overhead ($>800$ bytes per request). In contrast, **MQTT** features a 2-byte fixed header, making it the industry standard protocol for resource-constrained IoT devices.

## Publish/Subscribe Model
- **Publishers**: Edge devices publishing sensor readings to topics (e.g., \`factory/line1/sensor/temperature\`).
- **Broker**: Central message distributor (e.g., Mosquitto, EMQX).
- **Subscribers**: Client applications listening on wildcard topics (e.g., \`factory/+/sensor/#\`).

## Quality of Service (QoS) Levels
- **QoS 0 (At most once)**: Fire and forget. No acknowledgment.
- **QoS 1 (At least once)**: Guaranteed delivery, possible duplicate messages.
- **QoS 2 (Exactly once)**: Four-step handshake ensuring zero duplicates.`,
        practicalExercise: 'Exercise: Design an MQTT topic taxonomy for an industrial warehouse tracking temperature, humidity, and vibration across 5 separate zones.',
        referenceUrls: [
          'https://mqtt.org/faq/',
          'https://mosquitto.org/'
        ]
      },
      {
        id: 'l-iot-05',
        title: '5. Edge Computing & IoT Data Collection',
        topicTitle: 'Edge computing',
        subtopicTitle: 'Local data aggregation, anomaly filtering, edge inference, and offline buffering',
        position: 5,
        status: 'published',
        videoId: 'eidD14dXW8s',
        duration: '32:40',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Understand edge computation: moving intelligence closer to data sources to reduce network latency, bandwidth consumption, and cloud storage costs.',
        content: `# Edge Computing in IoT

Streaming every raw sensor reading directly to the cloud consumes excessive bandwidth and drains battery reserves. Edge computing processes telemetry locally before transmission.

## Key Edge Computing Tasks
1. **Noise Filtering & Smoothing**: Applying moving average or Kalman filters locally on microcontroller RAM.
2. **Threshold Triggering**: Only transmitting telemetry to the cloud when values exceed safety boundaries (exception-based reporting).
3. **Local Store-and-Forward**: Buffering telemetry on local SPIFFS or SD flash when WAN connectivity is lost.`,
        practicalExercise: 'Exercise: Write a JavaScript/Node.js script that implements an exponential moving average (EMA) filter on a stream of noisy temperature data.',
        referenceUrls: [
          'https://www.ibm.com/topics/edge-computing',
          'https://en.wikipedia.org/wiki/Edge_computing'
        ]
      },
      {
        id: 'l-iot-06',
        title: '6. IoT Cloud Integration & Device Security',
        topicTitle: 'Device security',
        subtopicTitle: 'TLS encrypted connections, secure boot, OTA firmware updates, and cloud dashboards',
        position: 6,
        status: 'published',
        videoId: '6mBO2vqLv38',
        duration: '22:15',
        channelName: 'Simplilearn',
        isPreview: 0,
        description: 'Implement secure IoT operations: TLS certificate authentication, preventing botnet exploitation, and cloud telemetry visualization.',
        content: `# IoT Cloud Integration & Device Security

Security is critical in IoT. Compromised embedded devices can be recruited into massive DDoS botnets (e.g., Mirai) or used to pivot into internal enterprise networks.

## Core Security Controls
- **Mutual TLS (mTLS)**: Both the device and the cloud verify each other using X.509 cryptographic certificates.
- **Secure Boot & Flash Encryption**: Cryptographically verifying firmware images on boot to prevent unauthorized code tampering.
- **Over-The-Air (OTA) Updates**: Secure, signed firmware distribution pipelines allowing remote patching of discovered vulnerabilities.`,
        practicalExercise: 'Exercise: List the top 3 vulnerabilities from the OWASP IoT Top 10 and state how hardware root-of-trust mitigates them.',
        referenceUrls: [
          'https://owasp.org/www-project-internet-of-things/',
          'https://aws.amazon.com/iot-core/'
        ]
      }
    ]
  },

  // ==========================================================
  // Course 7: UI/UX Design Fundamentals
  // ==========================================================
  {
    id: 'c-ux-07',
    title: 'UI/UX Design Fundamentals',
    description: 'Master the principles of modern product design: user-centered research, empathy personas, user journeys, wireframing, high-fidelity Figma prototyping, typography, color theory, and accessibility (WCAG).',
    category: 'UI/UX Design',
    difficultyLevel: 'Beginner',
    estimatedDuration: '5.0 hours',
    previewVideoId: 'c9Wg6Cb_YlU',
    thumbnailUrl: '/images/course-uiux.jpg',
    status: 'published',
    learningObjectives: [
      'Apply the 5 stages of Design Thinking to discover user pain points and validate product concepts',
      'Construct user personas, empathy maps, journey flows, and clear information architectures',
      'Design low-fidelity wireframes and interactive high-fidelity clickable prototypes in Figma',
      'Incorporate accessible typography, 8pt spatial grid systems, and WCAG 2.2 color contrast compliance'
    ],
    lessons: [
      {
        id: 'l-ux-01',
        title: '1. User-Centered Design Principles',
        topicTitle: 'User-centered design',
        subtopicTitle: 'Design thinking framework, usability heuristics, and mental models',
        position: 1,
        status: 'published',
        videoId: 'j6Ule7GXaRs',
        duration: '31:10',
        channelName: 'Flux Academy',
        isPreview: 1,
        description: 'Learn the foundations of Human-Computer Interaction (HCI), Jakob Nielsen usability heuristics, and user-centered design methodologies.',
        content: `# User-Centered Design Principles

User-Centered Design (UCD) is an iterative design process in which designers focus on users and their needs in each phase of the design process.

## The 5 Stages of Design Thinking
1. **Empathize**: Research user needs through observation and interviews.
2. **Define**: State user problems and unmet needs clearly.
3. **Ideate**: Challenge assumptions and create a wide variety of ideas.
4. **Prototype**: Build tangible, testable representations of ideas.
5. **Test**: Put prototypes in front of real users for objective feedback.

## Jakob Nielsen's Core Usability Heuristics
- Visibility of system status (always provide immediate feedback).
- Match between system and the real world (speak the user's language).
- User control and freedom (provide clear "emergency exits" / undo actions).
- Consistency and standards (adhere to established platform patterns).`,
        practicalExercise: 'Exercise: Evaluate an existing web checkout workflow against Jakob Nielsen’s 10 Usability Heuristics and document 3 violations.',
        referenceUrls: [
          'https://www.nngroup.com/articles/ten-usability-heuristics/',
          'https://www.interaction-design.org/'
        ]
      },
      {
        id: 'l-ux-02',
        title: '2. User Research, Personas & User Journeys',
        topicTitle: 'User research',
        subtopicTitle: 'Qualitative interviews, empathy mapping, and user journey flows',
        position: 2,
        status: 'published',
        videoId: 'c9Wg6Cb_YlU',
        duration: '45:00',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Conduct user research, synthesize findings into actionable personas, and map emotional user journeys across product touchpoints.',
        content: `# User Research & Journey Mapping

Designing without research is merely guessing. User research uncovers genuine behaviors, motivations, and pain points.

## Constructing Actionable User Personas
A persona is a semi-fictional archetype representing a target audience segment:
- Demographics and professional background.
- Primary goals and motivations.
- Frustrations and current obstacles.
- Tech proficiency and device context.

## User Journey Mapping
A journey map visualizes the timeline of steps a user takes to achieve a goal:
- **Phases**: Awareness $\\to$ Consideration $\\to$ Onboarding $\\to$ Core Task $\\to$ Retention.
- **Actions**: What the user does at each step.
- **Thoughts & Emotions**: Peaks (delight) and valleys (frustration).
- **Opportunities**: Architectural or design improvements to eliminate friction.`,
        practicalExercise: 'Exercise: Create an Empathy Map for a non-technical adult learner enrolling in their first online coding bootcamp.',
        referenceUrls: [
          'https://www.nngroup.com/articles/user-journeys-vs-user-flows/',
          'https://miro.com/templates/empathy-map/'
        ]
      },
      {
        id: 'l-ux-03',
        title: '3. Information Architecture & Navigation Patterns',
        topicTitle: 'Information architecture',
        subtopicTitle: 'Card sorting, sitemap hierarchy, mental models, and search patterns',
        position: 3,
        status: 'published',
        videoId: '68w2VwalD5w',
        duration: '29:45',
        channelName: 'Bring Your Own Laptop',
        isPreview: 0,
        description: 'Organize and structure digital content so users intuitively find what they need: card sorting, taxonomies, and hierarchical sitemaps.',
        content: `# Information Architecture & Navigation

Information Architecture (IA) is the structural design of shared information environments, balancing user needs, business goals, and content taxonomy.

## Card Sorting Methodologies
- **Open Card Sorting**: Participants group topics into categories they label themselves. Ideal for discovering user mental models.
- **Closed Card Sorting**: Participants sort content items into predetermined categories. Ideal for validating established taxonomies.

## Established Navigation Patterns
- Top Header Bars: For global desktop navigation.
- Bottom Tabs: Thumb-friendly mobile navigation (3-5 primary destinations).
- Faceted Search & Filters: For expansive catalogs and e-commerce inventories.`,
        practicalExercise: 'Exercise: Conduct an open card sort with 15 course topics to structure the main navigation categories of an educational LMS.',
        referenceUrls: [
          'https://www.usability.gov/how-to-and-tools/methods/information-architecture.html',
          'https://boxesandarrows.com/'
        ]
      },
      {
        id: 'l-ux-04',
        title: '4. Wireframing & Interactive Prototyping in Figma',
        topicTitle: 'Wireframing',
        subtopicTitle: 'Low-fidelity paper sketches to high-fidelity clickable Figma prototypes',
        position: 4,
        status: 'published',
        videoId: 'FTFaQWZBqQ8',
        duration: '24:12',
        channelName: 'AJ&Smart',
        isPreview: 0,
        description: 'Build fast wireframes, transition to high-fidelity vector layouts, and connect interactive micro-animations and component variants in Figma.',
        content: `# Wireframing & Prototyping

Prototypes allow design teams to test assumptions and validate interactive flows before engineering teams write a single line of production code.

## Fidelity Spectrum
- **Low-Fidelity (Lo-Fi)**: Greyscale wireframes focusing purely on content placement, layout structure, and flow. No colors, fonts, or images.
- **High-Fidelity (Hi-Fi)**: Production-ready visual mockups with precise typographic scales, design tokens, asset imagery, and interactive states (hover, active, disabled).`,
        practicalExercise: 'Exercise: In Figma, build an interactive low-fidelity wireframe for a student learning progress dashboard.',
        referenceUrls: [
          'https://help.figma.com/hc/en-us/categories/360002042553-Figma-Design',
          'https://www.figma.com/community'
        ]
      },
      {
        id: 'l-ux-05',
        title: '5. Visual Design Principles: Typography, Color & 8pt Grids',
        topicTitle: 'Typography and color',
        subtopicTitle: 'Typographic hierarchy, 8pt spatial system, color harmony, and design tokens',
        position: 5,
        status: 'published',
        videoId: 'c9Wg6Cb_YlU',
        duration: '38:15',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Understand visual hierarchy: modular typographic scales, 60-30-10 color distribution, and maintaining rhythm with the 8-point spatial grid.',
        content: `# Visual Design: Typography, Colors & Grids

Visual design shapes the aesthetic appeal and usability of an interface through intentional typography, color relationships, and spatial balance.

## The 8-Point Spatial Grid System
All dimensions, margins, paddings, and line heights should be multiples of 8 (8px, 16px, 24px, 32px, 48px). This establishes visual rhythm and simplifies developer handoff.

## Typographic Hierarchy
- Use a maximum of 2 complementary font families.
- Maintain a consistent modular scale (e.g., 1.25 Major Third scale):
  - H1: 32px / 40px line-height
  - H2: 24px / 32px line-height
  - Body: 16px / 24px line-height
  - Small: 12px / 16px line-height`,
        practicalExercise: 'Exercise: Create an accessible UI color palette (Primary, Neutral, Success, Warning, Danger) complying with a 60-30-10 distribution ratio.',
        referenceUrls: [
          'https://spec.fm/specifics/8-pt-grid',
          'https://type-scale.com/'
        ]
      },
      {
        id: 'l-ux-06',
        title: '6. Usability Testing & Digital Accessibility (WCAG 2.2)',
        topicTitle: 'Accessibility',
        subtopicTitle: 'WCAG contrast ratios, screen reader compatibility, and moderated testing',
        position: 6,
        status: 'published',
        videoId: 'FTFaQWZBqQ8',
        duration: '31:40',
        channelName: 'AJ&Smart',
        isPreview: 0,
        description: 'Design inclusively for all abilities: meet WCAG AA contrast standards, keyboard focus states, screen reader semantics, and user testing.',
        content: `# Usability Testing & Digital Accessibility

Accessible design ensures interfaces are usable by everyone, including people with visual, auditory, motor, or cognitive impairments.

## Web Content Accessibility Guidelines (WCAG 2.2)
The four principles of accessibility (POUR):
1. **Perceivable**: Text alternatives for images, captions for video, minimum 4.5:1 contrast ratio for normal text (3:1 for large text).
2. **Operable**: Full keyboard navigability without mouse traps; sufficient time to read content.
3. **Understandable**: Predictable UI behaviors, clear error messages with remediation guidance.
4. **Robust**: Semantic HTML compatible with assistive technologies (screen readers).`,
        practicalExercise: 'Exercise: Run an accessibility audit on a course enrollment form using browser DevTools, verifying color contrast and ARIA labels.',
        referenceUrls: [
          'https://www.w3.org/WAI/standards-guidelines/wcag/',
          'https://webaim.org/'
        ]
      }
    ]
  },

  // ==========================================================
  // Course 8: Mobile App Development Fundamentals
  // ==========================================================
  {
    id: 'c-mob-08',
    title: 'Mobile App Development Fundamentals',
    description: 'Learn modern mobile application engineering: mobile OS lifecycles (iOS/Android), responsive mobile layouts, touch navigation, asynchronous API networking, local offline SQLite storage, and app publishing.',
    category: 'Mobile Development',
    difficultyLevel: 'Intermediate',
    estimatedDuration: '6.0 hours',
    previewVideoId: 'fis26HvvDII',
    thumbnailUrl: '/images/course-mobile.jpg',
    status: 'published',
    learningObjectives: [
      'Understand mobile application runtime architectures, memory constraints, and OS activity lifecycles',
      'Design adaptive mobile interfaces with touch targets, safe area insets, and gesture recognizers',
      'Implement asynchronous REST networking with offline-first caching and background syncing',
      'Store persistent offline data with local SQLite and secure keystore storage'
    ],
    lessons: [
      {
        id: 'l-mob-01',
        title: '1. Mobile Application Architecture & Operating System Lifecycles',
        topicTitle: 'Mobile application architecture',
        subtopicTitle: 'Native vs cross-platform, Android Activity / iOS UIViewController lifecycles',
        position: 1,
        status: 'published',
        videoId: 'fis26HvvDII',
        duration: '42:30',
        channelName: 'freeCodeCamp.org',
        isPreview: 1,
        description: 'Explore native vs cross-platform runtimes (React Native, Flutter, Swift, Kotlin), memory limits, and mobile application lifecycle events.',
        content: `# Mobile Application Architecture & Lifecycles

Mobile devices operate under constrained CPU thermal limits, limited RAM, and intermittent cellular connectivity.

## Native vs. Cross-Platform
- **Native (Swift / Kotlin)**: Direct access to platform APIs, optimal runtime speed and memory efficiency.
- **Cross-Platform (Flutter / React Native)**: Single codebase targeting both iOS and Android.

## Mobile Lifecycle Management
Unlike desktop software, mobile operating systems aggressively terminate background applications to conserve battery:
- **Created / Initialized**: Allocating view hierarchy.
- **Active / Resumed**: Application in foreground receiving user touch inputs.
- **Paused / Inactive**: Interrupted by incoming phone call or notification drawer.
- **Background**: Minimized; must serialize state to prevent data loss on sudden OS termination.`,
        practicalExercise: 'Exercise: Diagram the lifecycle state transitions when an app is interrupted by an incoming phone call and returned to the foreground.',
        referenceUrls: [
          'https://developer.android.com/guide/components/activities/activity-lifecycle',
          'https://developer.apple.com/documentation/uikit/app_and_environment/managing_your_app_s_life_cycle'
        ]
      },
      {
        id: 'l-mob-02',
        title: '2. Mobile UI Layouts & Adaptive Components',
        topicTitle: 'Mobile UI design',
        subtopicTitle: 'Touch targets, safe areas, viewport density (dp/pt), and scrollable lists',
        position: 2,
        status: 'published',
        videoId: '0-S5a0eXPoc',
        duration: '38:15',
        channelName: 'Programming with Mosh',
        isPreview: 0,
        description: 'Design mobile layouts that accommodate notches, dynamic islands, navigation gestures, and high-DPI displays.',
        content: `# Mobile UI Design & Adaptive Components

Designing for mobile requires accounting for physical finger sizes and diverse device screen aspect ratios.

## Touch Targets & Safe Areas
- **Minimum Touch Target**: At least 48x48dp (Android) or 44x44pt (Apple) to prevent accidental mis-taps.
- **Safe Area Insets**: Hardware cutouts (notches, dynamic islands, rounded corners, home indicator bars) require padding to prevent UI clipping.
- **Virtualized Lists**: Reusing memory views when scrolling through thousands of records (FlatList / RecyclerView).`,
        practicalExercise: 'Exercise: Write pseudocode for a virtualized scrollable list that recycles off-screen views for a catalog of 1,000 items.',
        referenceUrls: [
          'https://m3.material.io/',
          'https://developer.apple.com/design/human-interface-guidelines/'
        ]
      },
      {
        id: 'l-mob-03',
        title: '3. Navigation Patterns & Mobile State Management',
        topicTitle: 'Navigation patterns',
        subtopicTitle: 'Stack navigation, tab bars, drawer drawers, deep linking, and reactive state',
        position: 3,
        status: 'published',
        videoId: 'x0uinJvhNxI',
        duration: '35:40',
        channelName: 'Academind',
        isPreview: 0,
        description: 'Implement intuitive mobile navigation hierarchies, stack history management, bottom tabs, and universal deep links.',
        content: `# Mobile Navigation Patterns & State Management

Mobile navigation must provide immediate spatial orientation and predictable back-stack behavior.

## Core Mobile Navigation Patterns
1. **Stack Navigation**: Pushing and popping screens in a stack (e.g., Course List $\\to$ Course Details $\\to$ Lesson Viewer).
2. **Tab Navigation**: Persistent bottom bar switching between top-level app destinations.
3. **Modal Sheets**: Temporary interactive views for focused tasks (login, filter dialogs).
4. **Deep Linking**: Handling external URLs (e.g., \`learnsphere://courses/c-ai-01\`) to navigate directly to nested content.`,
        practicalExercise: 'Exercise: Configure a deep link schema that parses URL query parameters and routes the user to a specific lesson.',
        referenceUrls: [
          'https://reactnavigation.org/',
          'https://docs.flutter.dev/ui/navigation'
        ]
      },
      {
        id: 'l-mob-04',
        title: '4. Asynchronous API Integration & Offline-First Networking',
        topicTitle: 'API integration',
        subtopicTitle: 'REST/GraphQL, background retries, offline caching, and network resilience',
        position: 4,
        status: 'published',
        videoId: '1ukSR1GRtMU',
        duration: '29:50',
        channelName: 'Net Ninja',
        isPreview: 0,
        description: 'Build network clients that handle weak cellular connectivity, background request retries with exponential backoff, and caching.',
        content: `# Mobile API Integration & Network Resilience

Mobile apps must function gracefully in airplane mode, tunnels, or spotty connectivity without crashing or presenting frozen screens.

## Network Architecture Strategies
- **Optimistic UI Updates**: Immediately reflect user actions in the local UI before server acknowledgment, reconciling state when the network resolves.
- **Exponential Backoff with Jitter**: Prevent overwhelming servers upon reconnection:
  $$t_{\\text{wait}} = 2^{\\text{attempt}} + \\text{random\\_jitter}$$
- **Cache-Then-Network**: Render cached local responses instantly, fetching updated data in the background.`,
        practicalExercise: 'Exercise: Write a JavaScript fetch wrapper that retries failed 5xx network requests up to 3 times with exponential backoff.',
        referenceUrls: [
          'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API',
          'https://square.github.io/retrofit/'
        ]
      },
      {
        id: 'l-mob-05',
        title: '5. Local Data Storage & SQLite Mobile Databases',
        topicTitle: 'Local data storage',
        subtopicTitle: 'Key-value stores, local SQLite databases, encryption, and sync engines',
        position: 5,
        status: 'published',
        videoId: 'VPvVD8t02U8',
        duration: '45:10',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Store persistent offline state using SQLite, manage schema migrations on mobile devices, and secure sensitive tokens in keychains.',
        content: `# Local Storage & Mobile SQLite

Mobile devices require persistent relational storage to maintain offline access to lessons, downloads, and user progress.

## Storage Tiers on Mobile
- **Key-Value Storage (UserDefaults / SharedPreferences)**: For small UI preferences (dark mode, last viewed tab).
- **Encrypted Keystore (Keychain / Keystore)**: Storing JWT tokens and encryption keys with hardware-backed security.
- **Relational Databases (SQLite / Room / CoreData)**: Storing structured entity relations (courses, lessons, progress) with ACID guarantees.`,
        practicalExercise: 'Exercise: Design a local SQLite schema for an offline mobile reading queue with synchronization timestamp flags.',
        referenceUrls: [
          'https://developer.android.com/training/data-storage/room',
          'https://developer.apple.com/documentation/coredata'
        ]
      },
      {
        id: 'l-mob-06',
        title: '6. Mobile Authentication, Push Notifications & App Release',
        topicTitle: 'App release fundamentals',
        subtopicTitle: 'Biometric authentication, APNs/FCM push notifications, app signing, and store deployment',
        position: 6,
        status: 'published',
        videoId: 'F9UC9DY-vIU',
        duration: '38:00',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Implement biometric logins, configure push notifications (FCM/APNs), generate release bundles, and navigate App Store review guidelines.',
        content: `# Mobile Authentication & Release

The final mile of mobile engineering is releasing verified, secure application binaries to global app store marketplaces.

## Biometric Authentication
Use platform biometrics (Face ID, Touch ID, Android BiometricPrompt) to unlock stored credentials securely without exposing plaintext passwords.

## Push Notifications Pipeline
1. Client requests notification permission from user.
2. Device registers with Apple APNs or Google FCM to obtain a unique device token.
3. Backend sends push payload with device token to FCM/APNs.
4. OS wakes the application to display banner or background-sync data.

## App Store & Google Play Release
- Code signing with developer certificates and provisioning profiles.
- Adhering to privacy nutrition labels and runtime permission prompts.`,
        practicalExercise: 'Exercise: Outline the security verification steps required before releasing an updated mobile app binary to production stores.',
        referenceUrls: [
          'https://developer.apple.com/app-store/review/guidelines/',
          'https://play.google.com/console/about/guides/'
        ]
      }
    ]
  },

  // ==========================================================
  // Course 9: Linux and Operating Systems
  // ==========================================================
  {
    id: 'c-lin-09',
    title: 'Linux and Operating Systems',
    description: 'Master operating system fundamentals and professional Linux administration: kernel vs user space, filesystem hierarchy, POSIX permissions, process management with systemd, shell scripting, and diagnostics.',
    category: 'Operating Systems',
    difficultyLevel: 'Beginner',
    estimatedDuration: '6.0 hours',
    previewVideoId: 'ROjZy1WbCIA',
    thumbnailUrl: '/images/course-linux.jpg',
    status: 'published',
    learningObjectives: [
      'Understand core operating system concepts: kernel, system calls, virtual memory, and process scheduling',
      'Navigate the Linux Filesystem Hierarchy (FHS) and manage file access permissions (chmod, chown, umask)',
      'Manage processes, monitor system resource utilization, and configure background services using systemd',
      'Automate system administration tasks using Bash shell scripts, environment variables, and exit codes'
    ],
    lessons: [
      {
        id: 'l-lin-01',
        title: '1. Operating System Fundamentals & Linux Architecture',
        topicTitle: 'Operating system fundamentals',
        subtopicTitle: 'Kernel vs User Space, system calls, distributions, and shell interfaces',
        position: 1,
        status: 'published',
        videoId: 'V1y-mbWM3B8',
        duration: '18:40',
        channelName: 'Guru99',
        isPreview: 1,
        description: 'Understand the architecture of Unix-like operating systems: monolithic kernels, CPU rings, system calls, and distributions.',
        content: `# Operating System Fundamentals & Linux Architecture

An Operating System (OS) manages hardware resources and provides common abstraction services for computer programs.

## Kernel Space vs. User Space
- **Kernel Space (Ring 0)**: Unrestricted access to physical CPU, memory, and hardware controllers. Executes core scheduling, device drivers, and memory paging.
- **User Space (Ring 3)**: Isolated execution environment for user applications (Node.js, databases, web browsers). Cannot directly access hardware.
- **System Calls (Syscalls)**: The programmatic portal through which user space programs request kernel services (\`read\`, \`write\`, \`fork\`, \`socket\`).`,
        practicalExercise: 'Exercise: Trace how a user-space command like "cat file.txt" triggers the "open" and "read" system calls to the Linux kernel.',
        referenceUrls: [
          'https://www.kernel.org/',
          'https://man7.org/linux/man-pages/man2/syscalls.2.html'
        ]
      },
      {
        id: 'l-lin-02',
        title: '2. Filesystem Hierarchy & Terminal Navigation',
        topicTitle: 'Filesystem navigation',
        subtopicTitle: 'The Linux FHS (/etc, /var, /home, /bin), relative vs absolute paths, and searching',
        position: 2,
        status: 'published',
        videoId: 'ROjZy1WbCIA',
        duration: '48:12',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Explore the Filesystem Hierarchy Standard, navigate directory structures, create symbolic links, and find files with find/grep.',
        content: `# The Linux Filesystem Hierarchy Standard (FHS)

Everything in Linux is treated as a file, arranged in a single inverted directory tree originating at the root directory (\`/\`).

## Crucial System Directories
- \`/bin\` & \`/usr/bin\`: Essential executable binary programs.
- \`/etc\`: System-wide configuration files.
- \`/var\`: Variable data (application logs, spoolers, databases).
- \`/home\`: User personal directories and dotfile configurations.
- \`/dev\`: Special device files representing hardware peripherals.
- \`/proc\` & \`/sys\`: Virtual pseudo-filesystems exposing kernel metrics in real-time.`,
        practicalExercise: 'Exercise: Use the "find" command to locate all .log files modified within the last 24 hours under the /var/log directory.',
        referenceUrls: [
          'https://refspecs.linuxfoundation.org/FHS_3.0/fhs-3.0.html',
          'https://linuxjourney.com/'
        ]
      },
      {
        id: 'l-lin-03',
        title: '3. File Permissions, Users & Groups',
        topicTitle: 'File permissions',
        subtopicTitle: 'POSIX permission bits (rwx), octal notation, chown, chmod, and sudo privileges',
        position: 3,
        status: 'published',
        videoId: 'wBp0Rb-ZJak',
        duration: '35:20',
        channelName: 'Joseph Delgadillo',
        isPreview: 0,
        description: 'Master the POSIX security model: read/write/execute permissions for User, Group, and Others, octal calculations, and sudo access.',
        content: `# File Permissions, Users & Groups

Linux is a multi-user operating system with granular access control based on POSIX permission attributes.

## The Permission Triad (rwx)
Each file has permission sets for **User (u)**, **Group (g)**, and **Others (o)**:
- **r (read)** = Value 4
- **w (write)** = Value 2
- **x (execute)** = Value 1

Example: \`chmod 755 script.sh\`
- User: $4+2+1 = 7$ (Read, Write, Execute)
- Group: $4+0+1 = 5$ (Read, Execute)
- Others: $4+0+1 = 5$ (Read, Execute)`,
        practicalExercise: 'Exercise: Calculate the octal permission value for a file where the owner can read/write, group can read-only, and others have zero permissions.',
        referenceUrls: [
          'https://wiki.archlinux.org/title/File_permissions_and_attributes',
          'https://www.gnu.org/software/coreutils/manual/html_node/chmod-invocation.html'
        ]
      },
      {
        id: 'l-lin-04',
        title: '4. Processes, Services & Systemd Management',
        topicTitle: 'Processes and services',
        subtopicTitle: 'Process trees, signals (SIGTERM/SIGKILL), top/htop, systemctl, and unit files',
        position: 4,
        status: 'published',
        videoId: 'sWbUDq4S6Y8',
        duration: '42:15',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Understand process lifecycles (PID 1), sending signals, monitoring system resources, and managing systemd daemon unit files.',
        content: `# Process Management & Systemd Services

Every running program on a Linux machine is represented as a process with a unique **Process ID (PID)**.

## Signals and Termination
- **SIGTERM (15)**: Graceful shutdown request allowing processes to save state and close network sockets.
- **SIGKILL (9)**: Immediate kernel-level destruction. Cannot be caught or ignored.

## Systemd Service Units
Systemd is the default init system (PID 1) on modern Linux distributions:
\`\`\`ini
[Unit]
Description=LearnSphere LMS Backend Service
After=network.target

[Service]
ExecStart=/usr/bin/node /app/src/server.js
Restart=always
User=node

[Install]
WantedBy=multi-user.target
\`\`\``,
        practicalExercise: 'Exercise: Write a systemd service unit file that starts a Node.js web server and automatically restarts it on crash.',
        referenceUrls: [
          'https://systemd.io/',
          'https://man7.org/linux/man-pages/man1/systemctl.1.html'
        ]
      },
      {
        id: 'l-lin-05',
        title: '5. Package Management & Bash Shell Scripting',
        topicTitle: 'Shell scripting fundamentals',
        subtopicTitle: 'Package repositories (apt/dnf), bash variables, loops, conditionals, and exit codes',
        position: 5,
        status: 'published',
        videoId: 'e7BufAVwDiM',
        duration: '54:30',
        channelName: 'linuxhint',
        isPreview: 0,
        description: 'Automate system administration with Bash: package updates, shell variables, control loops, error checking, and exit codes.',
        content: `# Package Management & Shell Scripting

Bash scripting automates repetitive tasks by chaining commands, pipes, and control flow.

## Idiomatic Bash Scripting
\`\`\`bash
#!/usr/bin/env bash
set -euo pipefail  # Strict error handling

BACKUP_DIR="/app/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "Starting backup at \${TIMESTAMP}..."

if [ ! -d "\${BACKUP_DIR}" ]; then
  mkdir -p "\${BACKUP_DIR}"
fi

sqlite3 /app/data/learnsphere.sqlite ".backup '\${BACKUP_DIR}/db_\${TIMESTAMP}.sqlite'"

echo "Backup completed successfully."
exit 0
\`\`\``,
        practicalExercise: 'Exercise: Write a Bash script that checks disk space utilization and logs a warning if / is over 85% capacity.',
        referenceUrls: [
          'https://www.gnu.org/software/bash/manual/',
          'https://github.com/dylanaraps/pure-bash-bible'
        ]
      },
      {
        id: 'l-lin-06',
        title: '6. Logs, System Diagnostics & Administration',
        topicTitle: 'Logs and troubleshooting',
        subtopicTitle: 'Journalctl log analysis, network diagnostics (netstat/ss/curl), and troubleshooting',
        position: 6,
        status: 'published',
        videoId: 'tK9Oc6AEnR4',
        duration: '39:45',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Diagnose server incidents: query systemd logs with journalctl, inspect listening ports with ss, and troubleshoot performance bottlenecks.',
        content: `# System Diagnostics & Troubleshooting

When production systems fail, systematic diagnostic methodologies pinpoint the bottleneck: CPU, memory, disk I/O, or network.

## Key Diagnostic Command Toolkit
- **journalctl -u service -f**: Live stream systemd logs.
- **ss -tulpn**: View listening TCP/UDP sockets and owning processes.
- **df -h & du -sh**: Inspect filesystem disk usage.
- **vmstat 1**: Real-time breakdown of CPU wait states and virtual memory paging.`,
        practicalExercise: 'Exercise: Use "journalctl" commands to filter and extract all error-level log messages from the last 2 hours.',
        referenceUrls: [
          'https://man7.org/linux/man-pages/man1/journalctl.1.html',
          'https://brendangregg.com/linuxperf.html'
        ]
      }
    ]
  },

  // ==========================================================
  // Course 10: Software Architecture and Design Patterns
  // ==========================================================
  {
    id: 'c-pat-10',
    title: 'Software Architecture and Design Patterns',
    description: 'Design robust, maintainable enterprise software: clean architecture, SOLID principles, creational, structural, and behavioral design patterns (GoF), dependency injection, and repository patterns.',
    category: 'Software Engineering',
    difficultyLevel: 'Advanced',
    estimatedDuration: '6.5 hours',
    previewVideoId: 'tv-_1er1mWI',
    thumbnailUrl: '/images/course-architecture.jpg',
    status: 'published',
    learningObjectives: [
      'Deconstruct complex domains into modular, layered architectures with clear separation of concerns',
      'Apply all five SOLID principles to create extensible, testable, and loosely-coupled object models',
      'Implement classic Gang-of-Four design patterns: Factory, Strategy, Observer, Decorator, and Adapter',
      'Architect decoupled applications utilizing Dependency Injection and the Repository pattern'
    ],
    lessons: [
      {
        id: 'l-pat-01',
        title: '1. Software Architecture Fundamentals & Layered Modular Design',
        topicTitle: 'Software architecture fundamentals',
        subtopicTitle: 'Separation of concerns, clean architecture boundaries, and high cohesion',
        position: 1,
        status: 'published',
        videoId: 'FLmBqI3IKMA',
        duration: '22:15',
        channelName: 'Traversy Media',
        isPreview: 1,
        description: 'Learn enterprise architectural structuring: presentation, business logic, persistence layers, and dependency inversion.',
        content: `# Software Architecture Fundamentals & Modular Design

Software architecture represents the set of significant design decisions that shape the structural integrity, maintainability, and evolution of a system.

## The Three-Tier Layered Architecture
1. **Presentation Layer**: Handles incoming HTTP requests, input validation, and user interface rendering.
2. **Business Logic Layer (Services)**: Contains domain business rules, orchestration, and transaction boundaries.
3. **Data Access Layer (Repositories)**: Encapsulates database queries, object relational mappings, and persistence mechanics.

## Core Architectural Metrics
- **High Cohesion**: Elements within a module belong together and execute a single focused purpose.
- **Loose Coupling**: Modules interact through well-defined abstract interfaces rather than concrete implementations.`,
        practicalExercise: 'Exercise: Draw a dependency diagram demonstrating why controllers must never make direct database queries in layered architecture.',
        referenceUrls: [
          'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html',
          'https://martinfowler.com/architecture/'
        ]
      },
      {
        id: 'l-pat-02',
        title: '2. SOLID Principles in Practice',
        topicTitle: 'SOLID principles',
        subtopicTitle: 'SRP, OCP, LSP, ISP, and DIP with concrete refactoring examples',
        position: 2,
        status: 'published',
        videoId: 'pTB30aXS77U',
        duration: '31:40',
        channelName: 'ArjanCodes',
        isPreview: 0,
        description: 'Examine the five SOLID object-oriented design principles and refactor brittle code into modular, extensible components.',
        content: `# The SOLID Principles of Object-Oriented Design

Formulated by Robert C. Martin ("Uncle Bob"), the SOLID principles provide guidelines for creating maintainable, understandable, and flexible codebases.

## The Five Principles
1. **S - Single Responsibility Principle**: A class should have one, and only one, reason to change.
2. **O - Open/Closed Principle**: Software entities should be open for extension, but closed for modification.
3. **L - Liskov Substitution Principle**: Subtypes must be substitutable for their base types without altering program correctness.
4. **I - Interface Segregation Principle**: Clients should not be forced to depend on methods they do not use.
5. **D - Dependency Inversion Principle**: High-level modules should not depend on low-level modules; both should depend on abstractions.`,
        practicalExercise: 'Exercise: Refactor a God class handling user registration, email dispatch, and database writes into three distinct single-responsibility classes.',
        referenceUrls: [
          'https://en.wikipedia.org/wiki/SOLID',
          'https://refactoring.guru/solid-principles'
        ]
      },
      {
        id: 'l-pat-03',
        title: '3. Creational Design Patterns: Factory, Builder & Singleton',
        topicTitle: 'Factory and strategy patterns',
        subtopicTitle: 'Factory Method, Abstract Factory, Builder, and Singleton patterns',
        position: 3,
        status: 'published',
        videoId: 'rylaiB2uH2A',
        duration: '45:20',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Master creational mechanisms: abstracting object instantiation, assembling complex composite objects, and managing global singletons.',
        content: `# Creational Design Patterns

Creational patterns provide mechanisms for creating objects in a manner suitable to the situation, decoupling object creation from usage.

## Factory Method Pattern
Defines an interface for creating an object, but lets subclasses decide which class to instantiate:
\`\`\`javascript
class NotificationFactory {
  static create(type) {
    switch (type) {
      case 'email': return new EmailNotifier();
      case 'sms': return new SmsNotifier();
      default: throw new Error('Unknown notification channel');
    }
  }
}
\`\`\``,
        practicalExercise: 'Exercise: Implement the Builder pattern in JavaScript to assemble a complex SQL query object with dynamic SELECT, WHERE, and LIMIT clauses.',
        referenceUrls: [
          'https://refactoring.guru/design-patterns/creational-patterns',
          'https://sourcemaking.com/design_patterns'
        ]
      },
      {
        id: 'l-pat-04',
        title: '4. Structural Design Patterns: Adapter, Decorator & Facade',
        topicTitle: 'Modular design',
        subtopicTitle: 'Adapting incompatible interfaces, dynamically adding responsibilities, and facades',
        position: 4,
        status: 'published',
        videoId: 'vNHpsC5ng_E',
        duration: '38:15',
        channelName: 'Derek Banas',
        isPreview: 0,
        description: 'Assemble flexible class structures: wrap legacy code with Adapters, extend functionality with Decorators, and simplify subsystems with Facades.',
        content: `# Structural Design Patterns

Structural patterns explain how to assemble objects and classes into larger structures while keeping these structures flexible and efficient.

## Key Patterns
- **Adapter**: Allows objects with incompatible interfaces to collaborate by wrapping one interface into another expected by client code.
- **Decorator**: Attaches new behaviors to objects dynamically without subclassing.
- **Facade**: Provides a simplified, high-level interface to a complex library or subsystem.`,
        practicalExercise: 'Exercise: Write an Adapter class that wraps a third-party payment gateway into your application’s standardized IPaymentProcessor interface.',
        referenceUrls: [
          'https://refactoring.guru/design-patterns/structural-patterns',
          'https://en.wikipedia.org/wiki/Adapter_pattern'
        ]
      },
      {
        id: 'l-pat-05',
        title: '5. Behavioral Design Patterns: Strategy, Observer & Command',
        topicTitle: 'Event-driven architecture',
        subtopicTitle: 'Strategy algorithm switching, Observer pub/sub, and Command encapsulation',
        position: 5,
        status: 'published',
        videoId: 'v9ejT8FO-7I',
        duration: '28:50',
        channelName: 'Christopher Okhravi',
        isPreview: 0,
        description: 'Manage communication between objects: swap algorithms at runtime with Strategy, decouple publishers and subscribers with Observer.',
        content: `# Behavioral Design Patterns

Behavioral design patterns identify common communication patterns between objects and realize these patterns.

## The Strategy Pattern
Defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime:
\`\`\`javascript
class PaymentContext {
  setStrategy(strategy) { this.strategy = strategy; }
  executePayment(amount) { return this.strategy.pay(amount); }
}
\`\`\`

## The Observer Pattern
Defines a subscription mechanism to notify multiple observers about any events that happen to the subject they are observing.`,
        practicalExercise: 'Exercise: Implement the Observer pattern in JavaScript to notify audit loggers and analytics tracking whenever a user enrolls in a course.',
        referenceUrls: [
          'https://refactoring.guru/design-patterns/behavioral-patterns',
          'https://en.wikipedia.org/wiki/Observer_pattern'
        ]
      },
      {
        id: 'l-pat-06',
        title: '6. Dependency Injection & The Repository Pattern',
        topicTitle: 'Dependency injection',
        subtopicTitle: 'Inversion of Control (IoC), decoupled persistence, and test mocking',
        position: 6,
        status: 'published',
        videoId: 'tv-_1er1mWI',
        duration: '10:05',
        channelName: 'Fireship',
        isPreview: 0,
        description: 'Decouple business logic from database engines: pass dependencies explicitly, implement mock repositories, and achieve 100% test coverage.',
        content: `# Dependency Injection & The Repository Pattern

High-level business logic must never be tightly coupled to concrete database drivers or third-party SDKs.

## The Repository Pattern
The Repository mediates between the domain and data mapping layers, acting like an in-memory domain object collection:
\`\`\`javascript
class CourseService {
  constructor(courseRepository) {
    this.courseRepo = courseRepository; // Injected dependency
  }

  async getPublishedCourses() {
    return this.courseRepo.findAllPublished();
  }
}
\`\`\`
By injecting \`courseRepository\`, we can easily substitute a MockCourseRepository in unit tests without touching a real database.`,
        practicalExercise: 'Exercise: Write a unit test for CourseService using a mock repository object without connecting to SQLite.',
        referenceUrls: [
          'https://martinfowler.com/eaaCatalog/repository.html',
          'https://en.wikipedia.org/wiki/Dependency_injection'
        ]
      },
      {
        id: 'l-pat-07',
        title: '7. Architecture Documentation & Architectural Decision Records (ADRs)',
        topicTitle: 'Architecture documentation',
        subtopicTitle: 'The C4 model, documenting tradeoffs, and writing Architectural Decision Records',
        position: 7,
        status: 'published',
        videoId: 'y8OnoxKotPQ',
        duration: '03:15',
        channelName: 'KRAZAM',
        isPreview: 0,
        description: 'Document architectural intent: create C4 context and container diagrams, write structured ADRs, and communicate technical tradeoffs.',
        content: `# Architecture Documentation & ADRs

The true value of software architecture is preserving context for why decisions were made when constraints evolve over time.

## Architectural Decision Records (ADRs)
An ADR captures an architectural decision along with its context and consequences:
- **Title**: e.g., "ADR-004: Use SQLite with WAL mode for local persistent cache"
- **Status**: Proposed / Accepted / Deprecated / Superseded
- **Context**: The problem and technical constraints motivating the decision.
- **Decision**: The selected strategy or technology choice.
- **Consequences**: Positive and negative tradeoffs resulting from the decision.`,
        practicalExercise: 'Exercise: Write an Architectural Decision Record (ADR) justifying the choice of SQLite WAL mode vs PostgreSQL for a modular single-node LMS.',
        referenceUrls: [
          'https://adr.github.io/',
          'https://c4model.com/'
        ]
      }
    ]
  },

  // ==========================================================
  // Course 11: Business Intelligence and Data Visualization
  // ==========================================================
  {
    id: 'c-bi-11',
    title: 'Business Intelligence and Data Visualization',
    description: 'Transform organizational data into strategic operational intelligence: KPI definition, dimensional data modeling (Star schema), dashboard design principles, interactive drill-downs, and reporting automation.',
    category: 'Business Intelligence',
    difficultyLevel: 'Intermediate',
    estimatedDuration: '5.0 hours',
    previewVideoId: 'CQBwx3BEDXw',
    thumbnailUrl: '/images/course-bi.jpg',
    status: 'published',
    learningObjectives: [
      'Understand business intelligence architecture, data warehousing, and OLAP analytical queries',
      'Design strategic operational KPIs and dimensional data models (fact and dimension tables)',
      'Construct high-impact executive dashboards adhering to visual hierarchy and low cognitive load',
      'Implement interactive filtering, cross-highlighting, and automated scheduled reporting'
    ],
    lessons: [
      {
        id: 'l-bi-01',
        title: '1. Business Intelligence Fundamentals & Data Architecture',
        topicTitle: 'Business intelligence fundamentals',
        subtopicTitle: 'OLTP vs OLAP, data warehouses, marts, and BI pipelines',
        position: 1,
        status: 'published',
        videoId: 'CQBwx3BEDXw',
        duration: '45:10',
        channelName: 'Simplilearn',
        isPreview: 1,
        description: 'Learn the architectural foundations of BI: transactional systems (OLTP) vs analytical data warehouses (OLAP).',
        content: `# Business Intelligence Fundamentals

Business Intelligence (BI) comprises the strategies and technologies used by enterprises for the data analysis and management of business information.

## OLTP vs. OLAP
- **OLTP (Online Transaction Processing)**: Normalized 3NF databases optimized for high-speed atomic transactions (INSERT, UPDATE) with ACID guarantees.
- **OLAP (Online Analytical Processing)**: Denormalized dimensional databases optimized for complex analytical aggregations (SUM, AVG) over historical datasets.`,
        practicalExercise: 'Exercise: Compare the query execution performance of a SUM() aggregation over 10 million rows on a normalized transactional DB vs an OLAP columnar table.',
        referenceUrls: [
          'https://en.wikipedia.org/wiki/Business_intelligence',
          'https://cloud.google.com/learn/what-is-business-intelligence'
        ]
      },
      {
        id: 'l-bi-02',
        title: '2. KPI Design & Metrics Definition',
        topicTitle: 'KPI design',
        subtopicTitle: 'Leading vs lagging indicators, North Star metrics, and SMART goals',
        position: 2,
        status: 'published',
        videoId: 'bPp64H7oE-Y',
        duration: '38:20',
        channelName: 'edureka!',
        isPreview: 0,
        description: 'Define meaningful business metrics: leading vs lagging indicators, avoiding vanity metrics, and aligning team outputs with business outcomes.',
        content: `# Key Performance Indicators (KPIs) Design

A Key Performance Indicator is a measurable value that demonstrates how effectively a company is achieving key business objectives.

## Leading vs. Lagging Indicators
- **Lagging Indicators**: Measure outcomes after the fact (e.g., Quarterly Revenue, Churned Customers). Easy to measure, hard to influence directly.
- **Leading Indicators**: Measure inputs and upstream activities that predict future outcomes (e.g., Daily Active Users, Course Completion Rate in First 7 Days).`,
        practicalExercise: 'Exercise: Formulate 3 leading indicators and 2 lagging indicators for measuring student success in an online technical academy.',
        referenceUrls: [
          'https://www.klipfolio.com/resources/kpi-guide',
          'https://hbr.org/2019/09/dont-let-metrics-undermine-your-business'
        ]
      },
      {
        id: 'l-bi-03',
        title: '3. Dimensional Data Modeling: Star & Snowflake Schemas',
        topicTitle: 'Data modeling',
        subtopicTitle: 'Fact tables, dimension tables, star schema, and slowly changing dimensions',
        position: 3,
        status: 'published',
        videoId: 'imjqNDtfdGs',
        duration: '32:45',
        channelName: 'Simplilearn',
        isPreview: 0,
        description: 'Structure analytical databases using Kimball dimensional modeling: central fact tables, surrounding dimensions, and grain definition.',
        content: `# Dimensional Modeling: Star & Snowflake Schemas

Dimensional modeling organizes data into intuitive business measurement structures.

## Core Modeling Concepts
- **Fact Tables**: Contain quantitative measurements/metrics (e.g., \`enrollment_id\`, \`completion_score\`, \`time_spent_seconds\`).
- **Dimension Tables**: Contain descriptive context attributes (e.g., \`student_region\`, \`course_category\`, \`date_calendar\`).
- **Star Schema**: Direct relationships from fact table to surrounding dimension tables without normalization. Provides fastest analytical query performance.`,
        practicalExercise: 'Exercise: Design a Star Schema diagram with a central FactEnrollment table connected to DimStudent, DimCourse, and DimDate tables.',
        referenceUrls: [
          'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/',
          'https://en.wikipedia.org/wiki/Star_schema'
        ]
      },
      {
        id: 'l-bi-04',
        title: '4. Dashboard Design Principles & Visual Hierarchy',
        topicTitle: 'Dashboard design',
        subtopicTitle: 'The 5-second rule, cognitive load, visual layout grids, and color strategy',
        position: 4,
        status: 'published',
        videoId: 'TPMlZxRRaBQ',
        duration: '42:10',
        channelName: 'freeCodeCamp.org',
        isPreview: 0,
        description: 'Design intuitive executive dashboards: establish clear focal points, apply F-shaped reading patterns, and eliminate cognitive clutter.',
        content: `# Dashboard Design & Visual Hierarchy

An executive dashboard must communicate key health metrics within five seconds of inspection.

## Principles of Executive Dashboard Design
1. **The 5-Second Rule**: Primary KPIs must be immediately visible at the top-left in large typographic cards.
2. **Progressive Disclosure**: High-level summaries on the main view with drill-down options for granular transaction investigation.
3. **Purposeful Color Usage**: Use neutral greys for layout structure and reserve bright saturation strictly for alerts and active filters.`,
        practicalExercise: 'Exercise: Redesign a cluttered 15-chart spreadsheet report into a clean, 4-quadrant executive operational dashboard layout.',
        referenceUrls: [
          'https://www.tableau.com/learn/articles/dashboard-design-principles',
          'https://powerbi.microsoft.com/en-us/blog/'
        ]
      },
      {
        id: 'l-bi-05',
        title: '5. Chart Selection, Interactive Filtering & Drill-Downs',
        topicTitle: 'Chart selection',
        subtopicTitle: 'Selecting chart types, cross-filtering, slicers, and drill-through paths',
        position: 5,
        status: 'published',
        videoId: 'P5E-FNdCse0',
        duration: '31:20',
        channelName: 'Job Ready Programmer',
        isPreview: 0,
        description: 'Select appropriate visualizations, implement interactive slicers, cross-highlight related metrics, and establish drill-down paths.',
        content: `# Chart Selection & Interactive Filtering

Interactive filtering empowers end-users to explore multidimensional data independently without requiring new SQL reports from engineering.

## Matching Analytical Intent with Visuals
- Comparison over Time: Line chart.
- Part-to-Whole Relationship: Stacked 100% bar chart (avoid crowded pie charts!).
- Correlation between Two Metrics: Scatter plot with trendline.
- Geographic Distribution: Choropleth map.`,
        practicalExercise: 'Exercise: Configure cross-filtering behavior so that clicking a course category bar filters all enrollment trend lines across the dashboard.',
        referenceUrls: [
          'https://datavizcatalogue.com/',
          'https://docs.microsoft.com/en-us/power-bi/create-reports/service-reports-visual-interactions'
        ]
      },
      {
        id: 'l-bi-06',
        title: '6. Data Storytelling & Reporting Automation',
        topicTitle: 'Data storytelling',
        subtopicTitle: 'Synthesizing insights, automated scheduled reports, and alert triggers',
        position: 6,
        status: 'published',
        videoId: 'CQBwx3BEDXw',
        duration: '36:15',
        channelName: 'Simplilearn',
        isPreview: 0,
        description: 'Automate reporting pipelines, configure threshold notification alerts, and present data stories that drive decisive business action.',
        content: `# Reporting Automation & Data Storytelling

Manual weekly PDF generation is error-prone. Modern BI platforms automate report delivery and alert on anomalous KPI deviations.

## Automated Distribution Pipelines
- Scheduled email snapshots delivered ahead of executive review meetings.
- Real-time webhook notifications triggered when error rates or drop-off thresholds exceed statistical boundaries.
- Contextual annotations explaining seasonal variance or external marketing campaign spikes.`,
        practicalExercise: 'Exercise: Set up an automated alert rule that triggers a team notification whenever course completion rates drop by more than 15% week-over-week.',
        referenceUrls: [
          'https://www.gartner.com/en/information-technology/glossary/business-intelligence-bi-software',
          'https://cloud.google.com/looker'
        ]
      }
    ]
  },

  // ==========================================================
  // Course 12: Agile Project Management
  // ==========================================================
  {
    id: 'c-agile-12',
    title: 'Agile Project Management',
    description: 'Master agile product development and delivery: The Agile Manifesto, Scrum roles, writing user stories (INVEST), sprint planning, daily stand-ups, retrospectives, and Kanban flow metrics.',
    category: 'Project Management',
    difficultyLevel: 'Beginner',
    estimatedDuration: '4.5 hours',
    previewVideoId: '9TycLR0TqFA',
    thumbnailUrl: '/images/course-agile.jpg',
    status: 'published',
    learningObjectives: [
      'Understand the 4 core values and 12 principles of the Agile Manifesto versus Waterfall approaches',
      'Execute the Scrum framework: Product Owner, Scrum Master, Developers, and core ceremonies',
      'Author high-quality user stories with acceptance criteria satisfying the INVEST framework',
      'Optimize team delivery flow using Kanban boards, Work-in-Progress (WIP) limits, and burndown charts'
    ],
    lessons: [
      {
        id: 'l-agile-01',
        title: '1. Agile Principles & The Agile Manifesto',
        topicTitle: 'Agile principles',
        subtopicTitle: 'The 4 Core Values, 12 Agile Principles, and Agile vs Waterfall',
        position: 1,
        status: 'published',
        videoId: 'P1mbqnACR0M',
        duration: '38:20',
        channelName: 'Simplilearn',
        isPreview: 1,
        description: 'Understand the philosophical roots of Agile: adapting to change, customer collaboration, working software, and incremental delivery.',
        content: `# The Agile Manifesto & Core Principles

Authored in 2001 by seventeen software leaders, the Agile Manifesto revolutionized software development by replacing rigid predictive planning with iterative delivery.

## The 4 Core Values
1. **Individuals and interactions** over processes and tools.
2. **Working software** over comprehensive documentation.
3. **Customer collaboration** over contract negotiation.
4. **Responding to change** over following a plan.

*Note*: While there is value in the items on the right, Agile values the items on the left more.`,
        practicalExercise: 'Exercise: Compare a 12-month Waterfall project with a 2-week Agile sprint cycle and identify when customer feedback is integrated in each.',
        referenceUrls: [
          'https://agilemanifesto.org/',
          'https://agilemanifesto.org/principles.html'
        ]
      },
      {
        id: 'l-agile-02',
        title: '2. The Scrum Framework & Roles',
        topicTitle: 'Scrum framework',
        subtopicTitle: 'Product Owner, Scrum Master, Developers, and cross-functional teams',
        position: 2,
        status: 'published',
        videoId: '9TycLR0TqFA',
        duration: '07:15',
        channelName: 'Uzility',
        isPreview: 0,
        description: 'Examine the three core Scrum accountabilities: Product Owner (the What), Scrum Master (the How/Process), and Developers (Implementation).',
        content: `# The Scrum Framework & Accountabilities

Scrum is a lightweight framework that helps people, teams, and organizations generate value through adaptive solutions for complex problems.

## The Three Accountabilities in Scrum
1. **Product Owner**: Maximizes product value. Accountable for effective Product Backlog management, ordering items, and clearly expressing backlog goals.
2. **Scrum Master**: Establishes Scrum as defined in the Scrum Guide. Acts as a servant leader, removing impediments and fostering psychological safety.
3. **Developers**: The people committed to creating any aspect of a usable Increment each Sprint. Self-organizing and cross-functional.`,
        practicalExercise: 'Exercise: A stakeholder demands an immediate feature addition mid-sprint. Describe how the Scrum Master and Product Owner respond.',
        referenceUrls: [
          'https://scrumguides.org/',
          'https://www.scrum.org/'
        ]
      },
      {
        id: 'l-agile-03',
        title: '3. Product Backlog & User Stories (INVEST Framework)',
        topicTitle: 'Product backlog',
        subtopicTitle: 'Writing user stories, acceptance criteria, INVEST criteria, and backlog refinement',
        position: 3,
        status: 'published',
        videoId: '502ILHjX9EE',
        duration: '15:20',
        channelName: 'Henrik Kniberg',
        isPreview: 0,
        description: 'Write effective user stories using the "As a... I want... So that..." template, define acceptance criteria, and refine backlogs.',
        content: `# Product Backlog & User Stories

A Product Backlog is an emergent, ordered list of what is needed to improve the product.

## User Story Syntax
\`\`\`
As a [type of user],
I want to [perform an action],
So that [achieve a business benefit].
\`\`\`

## The INVEST Criteria
- **I - Independent**: Can be developed without tightly coupling to another story.
- **N - Negotiable**: Captures essence of requirement, not rigid contract.
- **V - Valuable**: Delivers demonstrable value to users.
- **E - Estimable**: Clear enough for engineers to size.
- **S - Small**: Fits comfortably within a single sprint.
- **T - Testable**: Clear acceptance criteria allow objective pass/fail verification.`,
        practicalExercise: 'Exercise: Write a complete user story with at least 3 Given-When-Then acceptance criteria for a student password-reset feature.',
        referenceUrls: [
          'https://www.mountaingoatsoftware.com/agile/user-stories',
          'https://en.wikipedia.org/wiki/INVEST_(mnemonic)'
        ]
      },
      {
        id: 'l-agile-04',
        title: '4. Sprint Planning, Execution & Daily Stand-ups',
        topicTitle: 'Sprint planning',
        subtopicTitle: 'Story points, Planning Poker, Definition of Done, and the Daily Scrum',
        position: 4,
        status: 'published',
        videoId: 's4thQcgLCqk',
        duration: '14:25',
        channelName: 'TEDx Talks',
        isPreview: 0,
        description: 'Plan and execute sprints: estimate complexity using Planning Poker Fibonacci points, establish Sprint Goals, and run 15-minute stand-ups.',
        content: `# Sprint Planning & Execution

The Sprint is the heartbeat of Scrum, where ideas are turned into value.

## Sprint Planning Ceremonies
- Establish the **Sprint Goal**: The overarching business objective the team commits to achieving.
- Select backlog items from the Product Backlog into the **Sprint Backlog**.
- Estimate relative effort using **Story Points** (Fibonacci sequence: 1, 2, 3, 5, 8, 13) rather than raw hours.

## The Daily Scrum (Stand-up)
A 15-minute time-boxed event for Developers to inspect progress toward the Sprint Goal:
1. What did I accomplish yesterday that helped achieve the Sprint Goal?
2. What will I work on today?
3. What impediments or blockers are in my way?`,
        practicalExercise: 'Exercise: Conduct a simulated Planning Poker estimation round for a multi-page registration form with email validation.',
        referenceUrls: [
          'https://www.scrumalliance.org/',
          'https://en.wikipedia.org/wiki/Planning_poker'
        ]
      },
      {
        id: 'l-agile-05',
        title: '5. Sprint Reviews, Retrospectives & Continuous Improvement',
        topicTitle: 'Retrospectives',
        subtopicTitle: 'Product demonstrations, blameless retrospectives, Kaizen action items',
        position: 5,
        status: 'published',
        videoId: 'KS-wzI8BLDc',
        duration: '42:15',
        channelName: 'Simplilearn',
        isPreview: 0,
        description: 'Inspect increments in Sprint Reviews and facilitate blameless Sprint Retrospectives to drive continuous team improvement.',
        content: `# Sprint Reviews & Retrospectives

Inspection and Adaptation are the twin empirical pillars of Scrum.

## Sprint Review vs. Sprint Retrospective
- **Sprint Review**: Inspects the **Increment** with stakeholders. Live demonstration of working software. Solicits feedback to adapt the future Product Backlog.
- **Sprint Retrospective**: Inspects the **Process and Team Dynamics**. The team reflects on what went well, what problems arose, and identifies actionable process improvements (Kaizen) for the next sprint.`,
        practicalExercise: 'Exercise: Facilitate a "Start - Stop - Continue" retrospective session identifying 2 concrete improvements for a team struggling with mid-sprint scope creep.',
        referenceUrls: [
          'https://retrium.com/resources/sprint-retrospectives-guide',
          'https://www.scrum.org/resources/what-is-a-sprint-retrospective'
        ]
      },
      {
        id: 'l-agile-06',
        title: '6. Kanban Workflows & Delivery Flow Metrics',
        topicTitle: 'Kanban workflows',
        subtopicTitle: 'WIP limits, cycle time, lead time, cumulative flow diagrams, and burndown charts',
        position: 6,
        status: 'published',
        videoId: 'XU0llRltyFM',
        duration: '09:40',
        channelName: 'Axosoft',
        isPreview: 0,
        description: 'Visualize work with Kanban: set Work-in-Progress (WIP) limits, measure Cycle Time vs Lead Time, and interpret Burndown Charts.',
        content: `# Kanban Workflows & Delivery Metrics

Kanban visualizes workflow, limits work-in-progress (WIP), and maximizes operational flow efficiency.

## Core Kanban Practices
1. **Visualize the Workflow**: Columns representing stages (To Do $\\to$ In Progress $\\to$ Code Review $\\to$ QA $\\to$ Done).
2. **Limit Work in Progress (WIP)**: Restricting the number of active cards in any column prevents multitasking and exposes bottlenecks.
3. **Manage Flow**: Measuring **Cycle Time** (time from work starting to completion) and **Lead Time** (time from request submission to delivery).`,
        practicalExercise: 'Exercise: Given a Kanban board where "Code Review" has a WIP limit of 3 and currently holds 3 tasks, explain what developers must do when finishing a new coding task.',
        referenceUrls: [
          'https://kanbanize.com/kanban-resources/getting-started/what-is-kanban',
          'https://en.wikipedia.org/wiki/Kanban_(development)'
        ]
      }
    ]
  }
];

export function seedNewCourses(customDb = null) {
  const db = customDb || getDatabase();
  const now = new Date().toISOString();

  // Find default instructor ID
  let instructorId = 'u-inst-01';
  const instructorRow = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (instructorRow && instructorRow.id) {
    instructorId = instructorRow.id;
  }

  logger.info({ totalCourses: NEW_COURSES_DATA.length }, 'Seeding new educational courses and verified YouTube video lessons');

  const insertCourse = db.prepare(`
    INSERT INTO courses (
      id, title, description, category, instructor_id,
      thumbnail_url, status, estimated_duration, preview_video_id,
      difficulty_level, learning_objectives,
      created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      category = excluded.category,
      thumbnail_url = excluded.thumbnail_url,
      status = excluded.status,
      estimated_duration = excluded.estimated_duration,
      preview_video_id = excluded.preview_video_id,
      difficulty_level = excluded.difficulty_level,
      learning_objectives = excluded.learning_objectives,
      updated_at = excluded.updated_at
  `);

  const insertLesson = db.prepare(`
    INSERT INTO lessons (
      id, course_id, title, content, position, status,
      video_id, video_url, duration, description, channel_name, is_preview,
      topic_title, subtopic_title, practical_exercise, reference_urls,
      created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      course_id = excluded.course_id,
      title = excluded.title,
      content = excluded.content,
      position = excluded.position,
      status = excluded.status,
      video_id = excluded.video_id,
      video_url = excluded.video_url,
      duration = excluded.duration,
      description = excluded.description,
      channel_name = excluded.channel_name,
      is_preview = excluded.is_preview,
      topic_title = excluded.topic_title,
      subtopic_title = excluded.subtopic_title,
      practical_exercise = excluded.practical_exercise,
      reference_urls = excluded.reference_urls,
      updated_at = excluded.updated_at
  `);

  let coursesAdded = 0;
  let lessonsAdded = 0;

  const transaction = db.transaction(() => {
    for (const course of NEW_COURSES_DATA) {
      insertCourse.run(
        course.id,
        course.title,
        course.description,
        course.category,
        instructorId,
        course.thumbnailUrl,
        course.status,
        course.estimatedDuration,
        course.previewVideoId,
        course.difficultyLevel,
        JSON.stringify(course.learningObjectives || []),
        now,
        now
      );
      coursesAdded++;

      for (const lesson of course.lessons) {
        insertLesson.run(
          lesson.id,
          course.id,
          lesson.title,
          lesson.content,
          lesson.position,
          lesson.status,
          lesson.videoId,
          normalizeYouTubeUrl(lesson.videoId),
          lesson.duration,
          lesson.description,
          lesson.channelName,
          lesson.isPreview ? 1 : 0,
          lesson.topicTitle,
          lesson.subtopicTitle,
          lesson.practicalExercise,
          JSON.stringify(lesson.referenceUrls || []),
          now,
          now
        );
        lessonsAdded++;
      }
    }
  });

  transaction();

  logger.info({ coursesAdded, lessonsAdded }, 'Successfully seeded all new courses and topic/subtopic lessons');
  return { coursesAdded, lessonsAdded };
}

// Allow CLI execution: `node src/database/seedNewCourses.js`
if (process.argv[1] && process.argv[1].endsWith('seedNewCourses.js')) {
  try {
    const stats = seedNewCourses();
    console.log(`[SeedNewCourses] Added/Updated ${stats.coursesAdded} courses and ${stats.lessonsAdded} lessons successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('[SeedNewCourses] Seeding error:', err);
    process.exit(1);
  }
}
