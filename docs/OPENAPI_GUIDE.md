# Adding OpenAPI Documentation to New Endpoints

This guide shows how to add OpenAPI documentation to new API endpoints.

## Basic Swagger/OpenAPI Comments

Use JSDoc comments with `@swagger` to document your endpoints:

```typescript
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
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', (req, res) => {
  // Implementation here
});
```

## Schema References

Use `$ref` to reference schemas defined in `src/config/swagger.ts`:

- `#/components/schemas/User`
- `#/components/schemas/ApiResponse`
- `#/components/schemas/ErrorResponse`
- `#/components/responses/NotFound`
- `#/components/responses/BadRequest`

## Adding New Schemas

Edit `src/config/swagger.ts` to add new schemas:

```typescript
components: {
  schemas: {
    NewEntity: {
      type: 'object',
      required: ['id', 'name'],
      properties: {
        id: {
          type: 'integer',
          description: 'Unique identifier',
          example: 1,
        },
        name: {
          type: 'string',
          description: 'Entity name',
          example: 'Example Name',
        },
      },
    },
  },
}
```

## Generating Documentation

After adding documentation comments:

1. Generate schema files: `npm run docs:generate`
2. Start server: `npm run dev`
3. View docs at: `http://localhost:3000/api-docs`

## Best Practices

1. Always include `tags` to group related endpoints
2. Provide clear `summary` and `description`
3. Document all parameters and request bodies
4. Include example values
5. Reference common response schemas
6. Keep documentation up-to-date with code changes
