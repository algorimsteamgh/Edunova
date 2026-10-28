import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { NotFoundError } from './utils/errors.js';

// Route modules
import authRoutes from './modules/auth/routes.js';
import coursesRoutes from './modules/courses/routes.js';
import { courseLessonsRouter, lessonsRouter } from './modules/lessons/routes.js';
import { courseEnrollRouter, myEnrollmentsRouter } from './modules/enrollments/routes.js';
import progressRouter from './modules/progress/routes.js';
import adminRoutes from './modules/admin/routes.js';
import healthRoutes from './modules/health/routes.js';

export function createApp() {
  const app = express();

  // 1. Security & Core Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin === '*' ? true : config.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 2. HTTP Request Logging (exclude in test runs)
  if (config.env !== 'test') {
    app.use(
      pinoHttp({
        logger,
        autoLogging: {
          ignore: (req) => req.url.startsWith('/health'),
        },
      })
    );
  }

  // 3. Operational Probes & Cloud Run Test Handler
  app.use('/health', healthRoutes);

  // Cloud Run service test & welcome endpoint
  app.all('/', (req, res) => {
    const name = req.body?.name || 'Developer';
    res.status(200).json({
      service: 'LearnSphere LMS API',
      status: 'ONLINE',
      greeting: `Hello ${name}! LearnSphere LMS backend is running successfully on Google Cloud Run.`,
      documentation: '/api/v1/courses',
      health: '/health/ready',
      version: '2.0.0',
    });
  });

  // 4. API v1 Routing
  const apiV1 = express.Router();
  apiV1.use('/auth', authRoutes);
  apiV1.use('/courses', coursesRoutes);
  apiV1.use('/courses/:courseId/lessons', courseLessonsRouter);
  apiV1.use('/courses/:courseId/enroll', courseEnrollRouter);
  apiV1.use('/lessons', lessonsRouter);
  apiV1.use('/me/enrollments', myEnrollmentsRouter);
  apiV1.use('/enrollments', progressRouter);
  apiV1.use('/admin', adminRoutes);

  app.use('/api/v1', apiV1);

  // 5. 404 Handler
  app.use((req, _res, next) => {
    next(new NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`));
  });

  // 6. Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export default createApp;
