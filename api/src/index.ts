import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { specs } from './config/swagger.js';
import { ApiMessages, HealthMessages } from './messages/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './middleware/logger.js';
import { apiRoutes } from './routes/index.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100'), // limit each IP
  message: {
    error: ApiMessages.errors.http.rateLimitExceeded(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet());
app.use(limiter);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  })
);
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: process.env.JSON_LIMIT ?? '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.URL_ENCODED_LIMIT ?? '10mb' }));

// Custom middleware
app.use(logger);

// Routes
app.use('/api', apiRoutes);

// OpenAPI/Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: process.env.SWAGGER_EXPLORER === 'true',
  customCss: process.env.SWAGGER_CUSTOM_CSS ?? '.swagger-ui .topbar { display: none }',
  customSiteTitle: process.env.SWAGGER_CUSTOM_SITE_TITLE ?? 'Stack API Documentation',
}));

// Serve OpenAPI JSON
app.get('/openapi.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check if the API server is running and healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    // Import database utilities dynamically to avoid issues if pg is not installed
    const { healthCheck } = await import('./utils/database.js');
    const dbHealth = await healthCheck();
    
    const healthStatus = {
      status: HealthMessages.status.ok(),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealth,
    };

    // Return 503 if database is not healthy
    if (!dbHealth.healthy) {
      res.status(503).json({
        ...healthStatus,
        status: 'Service Unavailable',
      });
      return;
    }

    res.status(200).json(healthStatus);
  } catch {
    // Fallback if database utils are not available
    res.status(200).json({
      status: HealthMessages.status.ok(),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        healthy: false,
        message: 'Database utilities not available'
      }
    });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: ApiMessages.errors.http.notFound(),
    message: ApiMessages.errors.http.notFoundDescription(),
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
  console.log(`🚀 Server running on port ${PORT}`);
    // eslint-disable-next-line no-console
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
    // eslint-disable-next-line no-console
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api`);
    // eslint-disable-next-line no-console
  console.log(`📚 API documentation: http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    // eslint-disable-next-line no-console
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
    // eslint-disable-next-line no-console
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
