import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: process.env.API_TITLE ?? 'Stack API',
      version: process.env.API_VERSION ?? '1.0.0',
      description: process.env.API_DESCRIPTION ?? 'Stack API',
      contact: {
        name: process.env.API_CONTACT_NAME ?? 'Enkh',
        email:
          process.env.API_CONTACT_EMAIL ?? 'amgaa.lcs@gmail.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL ?? 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'name', 'email', 'createdAt'],
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier for the user',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Full name of the user',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
              example: 'john@example.com',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
              example: '2025-07-23T12:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp',
              example: '2025-07-23T12:00:00.000Z',
            },
          },
        },
        CreateUserRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              description: 'Full name of the user',
              example: 'John Doe',
              minLength: 1,
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address of the user',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              description:
                'Password (min 8 chars, must contain uppercase, lowercase, number, special char)',
              example: 'SecureP@ss123',
              minLength: 8,
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              description: 'Password',
              example: 'SecureP@ss123',
            },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              description: 'JWT refresh token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User',
            },
            token: {
              type: 'string',
              description: 'JWT access token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            refreshToken: {
              type: 'string',
              description: 'JWT refresh token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            data: {
              description: 'The response data',
            },
            message: {
              type: 'string',
              description: 'Response message',
              example: 'Operation successful',
            },
            count: {
              type: 'integer',
              description: 'Number of items (for array responses)',
              example: 10,
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          required: ['error'],
          properties: {
            error: {
              type: 'object',
              required: ['message', 'status'],
              properties: {
                message: {
                  type: 'string',
                  description: 'Error message',
                  example: 'User not found',
                },
                status: {
                  type: 'integer',
                  description: 'HTTP status code',
                  example: 404,
                },
                stack: {
                  type: 'string',
                  description: 'Error stack trace (development only)',
                },
              },
            },
          },
        },
        HealthCheck: {
          type: 'object',
          required: ['status', 'timestamp', 'uptime'],
          properties: {
            status: {
              type: 'string',
              enum: ['OK', 'ERROR'],
              description: 'Health status',
              example: 'OK',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Current timestamp',
              example: '2025-07-23T12:00:00.000Z',
            },
            uptime: {
              type: 'number',
              description: 'Server uptime in seconds',
              example: 3600,
            },
          },
        },
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        BadRequest: {
          description: 'Bad request - Invalid input data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        TooManyRequests: {
          description: 'Too many requests - Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/index.ts'], // Paths to files containing OpenAPI definitions
};

export const specs = swaggerJSDoc(options);
export default specs;
