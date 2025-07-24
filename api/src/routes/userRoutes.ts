import { Router } from 'express';
import type { Request, Response } from 'express';

import { ApiMessages } from '../messages/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { UserService } from '../services/userService.js';
import type {
  User,
  UpdateUserRequest,
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
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users with pagination
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of users to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of users to skip
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                         users:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/User'
 *                         total:
 *                           type: integer
 *                         hasMore:
 *                           type: boolean
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// GET /api/users
router.get(
  '/',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

      const result = await UserService.getAllUsers(limit, offset);
      
      res.json(
        createApiResponse(
          result,
          ApiMessages.success.users.retrieved(),
          result.users.length
        )
      );
    } catch {
      res.status(500).json(
        createErrorResponse('Internal server error occurred while fetching users', 500)
      );
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *           format: uuid
 *           example: d952abd1-0df6-4433-a9f4-f68ed64c1217
 *     responses:
 *       200:
 *         description: User retrieved successfully
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
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// GET /api/users/:id
router.get(
  '/:id',
  async (
    req: Request,
    res: Response<ApiResponse<User> | ReturnType<typeof createErrorResponse>>
  ): Promise<void> => {
    const id = req.params.id ?? '';

    try {
      const user = await UserService.getUserById(id);

      if (!user) {
        res
          .status(404)
          .json(
            createErrorResponse(
              ApiMessages.errors.validation.userNotFound(),
              404
            )
          );
        return;
      }

      res.json(createApiResponse(user, ApiMessages.success.users.fetched()));
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid user ID format') {
        res
          .status(400)
          .json(
            createErrorResponse(
              ApiMessages.errors.validation.invalidUserId(),
              400
            )
          );
        return;
      }

      res.status(500).json(createErrorResponse('Internal server error', 500));
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     description: Update a specific user by their ID (requires authentication)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *           format: uuid
 *           example: d952abd1-0df6-4433-a9f4-f68ed64c1217
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user
 *                 example: "John Doe Updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user
 *                 example: "john.updated@example.com"
 *               password:
 *                 type: string
 *                 description: New password (optional)
 *                 example: "NewSecureP@ss123"
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Can only update own profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Conflict - Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// PUT /api/users/:id
router.put(
  '/:id',
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<User> | ReturnType<typeof createErrorResponse>>
  ): Promise<void> => {
    const id = req.params.id ?? '';
    const updateData = req.body as UpdateUserRequest;

    if (!req.user) {
      res
        .status(401)
        .json(createErrorResponse('User not authenticated', 401));
      return;
    }

    try {
      const updatedUser = await UserService.updateUser(
        id,
        updateData,
        req.user.id
      );

      if (!updatedUser) {
        res.status(404).json(createErrorResponse('User not found', 404));
        return;
      }

      res.json(createApiResponse(updatedUser, 'User updated successfully'));
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'Invalid user ID format':
            res.status(400).json(createErrorResponse('Invalid user ID', 400));
            return;
          case 'You can only update your own profile':
            res
              .status(403)
              .json(createErrorResponse(error.message, 403));
            return;
          case 'Name must be a valid string':
          case 'Email must be valid':
            res.status(400).json(createErrorResponse(error.message, 400));
            return;
          case 'Email already exists':
            res.status(409).json(createErrorResponse(error.message, 409));
            return;
          case 'User not found':
            res.status(404).json(createErrorResponse(error.message, 404));
            return;
        }
      }

      res.status(500).json(createErrorResponse('Failed to update user', 500));
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     description: Delete a specific user by their ID (requires authentication)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *           format: uuid
 *           example: d952abd1-0df6-4433-a9f4-f68ed64c1217
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                         deleted:
 *                           type: boolean
 *                           example: true
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Can only delete own profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// DELETE /api/users/:id
router.delete(
  '/:id',
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response<
      ApiResponse<{ deleted: boolean }> | ReturnType<typeof createErrorResponse>
    >
  ): Promise<void> => {
    const id = req.params.id ?? '';

    if (!req.user) {
      res
        .status(401)
        .json(createErrorResponse('User not authenticated', 401));
      return;
    }

    try {
      const deleted = await UserService.deleteUser(id, req.user.id);

      if (!deleted) {
        res.status(404).json(createErrorResponse('User not found', 404));
        return;
      }

      res.json(
        createApiResponse({ deleted: true }, 'User deleted successfully')
      );
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'Invalid user ID format':
            res.status(400).json(createErrorResponse('Invalid user ID', 400));
            return;
          case 'You can only delete your own profile':
            res
              .status(403)
              .json(createErrorResponse(error.message, 403));
            return;
          case 'User not found':
            res.status(404).json(createErrorResponse(error.message, 404));
            return;
        }
      }

      res.status(500).json(createErrorResponse('Failed to delete user', 500));
    }
  }
);

export { router as userRoutes };
