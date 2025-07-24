#!/usr/bin/env tsx

import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { specs } from '../config/swagger.js';

const serveOpenApiDocs = (): void => {
  const app = express();
  const PORT = parseInt(process.env.DOCS_SERVER_PORT ?? '4000', 10);

  // Serve OpenAPI JSON
  app.get('/openapi.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(specs, null, 2));
  });

  // Serve Swagger UI
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: process.env.SWAGGER_EXPLORER === 'true',
      customCss:
        process.env.SWAGGER_CUSTOM_CSS ??
        '.swagger-ui .topbar { display: none }',
      customSiteTitle:
        process.env.SWAGGER_CUSTOM_SITE_TITLE ?? 'Stack API Documentation',
    })
  );

  // Root redirect
  app.get('/', (_req, res) => {
    res.redirect('/docs');
  });

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`📚 OpenAPI documentation server running on port ${PORT}`);
    // eslint-disable-next-line no-console
    console.log(`🔗 Swagger UI: http://localhost:${PORT}/docs`);
    // eslint-disable-next-line no-console
    console.log(`📄 OpenAPI JSON: http://localhost:${PORT}/openapi.json`);
  });
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  serveOpenApiDocs();
}

export { serveOpenApiDocs };
