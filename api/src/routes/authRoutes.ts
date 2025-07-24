import { Router } from 'express';
import type { Request, Response } from 'express';

import { authenticateToken } from '../middleware/auth.js';
import { AuthService } from '../services/authService.js';
import type {
  AuthResponse,
  CreateUserRequest,
  LoginRequest,
  RefreshTokenRequest,
  User,
  ApiResponse,
  AuthenticatedRequest,
} from '../types/index.js';
import {
  createApiResponse,
  createErrorResponse,
} from '../utils/helpers.js';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 description: Password for the account (minimum 8 characters)
 *                 example: "SecureP@ss123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict - User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// POST /api/auth/register
router.post(
  '/register',
  async (
    req: Request,
    res: Response<ApiResponse<AuthResponse> | ReturnType<typeof createErrorResponse>>
  ): Promise<void> => {
    const userData = req.body as CreateUserRequest;

    try {
      const authResponse = await AuthService.register(userData);
      
      res.status(201).json(
        createApiResponse(authResponse, 'User registered successfully')
      );
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'Name is required':
          case 'Valid email is required':
          case 'Password is required':
            res.status(400).json(createErrorResponse(error.message, 400));
            return;
          case 'User already exists':
            res.status(409).json(createErrorResponse(error.message, 409));
            return;
        }
      }

      res.status(500).json(createErrorResponse('Failed to register user', 500));
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password, returns access and refresh tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 description: Password for the account
 *                 example: "SecureP@ss123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         accessToken:
 *                           type: string
 *                           description: JWT access token
 *                         refreshToken:
 *                           type: string
 *                           description: JWT refresh token
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// POST /api/auth/login
router.post(
  '/login',
  async (
    req: Request,
    res: Response<ApiResponse<AuthResponse> | ReturnType<typeof createErrorResponse>>
  ): Promise<void> => {
    const { email, password } = req.body as LoginRequest;

    try {
      const authResponse = await AuthService.login(email, password);

      res.json(createApiResponse(authResponse, 'Login successful'));
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'Valid email is required':
          case 'Password is required':
            res.status(400).json(createErrorResponse(error.message, 400));
            return;
          case 'Invalid credentials':
            res.status(401).json(createErrorResponse('Invalid email or password', 401));
            return;
        }
      }

      res.status(500).json(createErrorResponse('Login failed', 500));
    }
  }
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         accessToken:
 *                           type: string
 *                           description: New JWT access token
 *       400:
 *         description: Bad request - Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Not found - User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// POST /api/auth/refresh
router.post(
  '/refresh',
  async (
    req: Request,
    res: Response<
      ApiResponse<{ user: User; accessToken: string }> | ReturnType<typeof createErrorResponse>
    >
  ): Promise<void> => {
    const { refreshToken } = req.body as RefreshTokenRequest;

    if (!refreshToken) {
      res.status(400).json(createErrorResponse('Refresh token is required', 400));
      return;
    }

    try {
      // Use AuthService to refresh token
      const authResponse = await AuthService.refreshToken(refreshToken);

      res.json(
        createApiResponse(
          { user: authResponse.user, accessToken: authResponse.token },
          'Token refreshed successfully'
        )
      );
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'Refresh token is required':
            res.status(400).json(createErrorResponse(error.message, 400));
            return;
          case 'Invalid or expired refresh token':
          case 'Token refresh failed':
            res.status(401).json(createErrorResponse('Invalid refresh token', 401));
            return;
          case 'User not found':
            res.status(404).json(createErrorResponse(error.message, 404));
            return;
        }
      }

      res.status(500).json(createErrorResponse('Failed to refresh token', 500));
    }
  }
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Get the profile information of the currently authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// GET /api/auth/me
router.get(
  '/me',
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<User> | ReturnType<typeof createErrorResponse>>
  ): Promise<void> => {
    if (!req.user) {
      res.status(401).json(createErrorResponse('User not authenticated', 401));
      return;
    }

    try {
      res.json(
        createApiResponse(req.user, 'User profile retrieved successfully')
      );
    } catch {
      res.status(500).json(createErrorResponse('Failed to retrieve user profile', 500));
    }
  }
);

export { router as authRoutes };
