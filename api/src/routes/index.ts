import { Router } from 'express';

import { authRoutes } from './authRoutes.js';
import { userRoutes } from './userRoutes.js';

const router = Router();

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Get API information
 *     description: Get basic information about the API and available endpoints
 *     tags: [API Info]
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Stack API"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     health:
 *                       type: string
 *                       example: "/health"
 *                     users:
 *                       type: string
 *                       example: "/api/users"
 */
// API version and info
router.get('/', (_req, res) => {
  res.json({
    message: process.env.API_TITLE ?? 'Stack API',
    version: process.env.API_VERSION ?? '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
    },
  });
});

// Route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export { router as apiRoutes };
