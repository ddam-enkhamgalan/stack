#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { resolve } from 'path';

interface OpenApiResponse {
  description: string;
  content?: Record<string, unknown>;
}

interface OpenApiSchema {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  [key: string]: unknown;
}

interface OpenApiSpec {
  openapi: string;
  info: object;
  paths: Record<string, Record<string, unknown>>;
  components?: {
    schemas?: Record<string, OpenApiSchema>;
    responses?: Record<string, OpenApiResponse>;
  };
  [key: string]: unknown; // Allow additional properties
}

const validateOpenApiSchema = (): void => {
  try {
    const schemaPath = resolve(process.cwd(), 'openapi.json');
    const schemaContent = readFileSync(schemaPath, 'utf8');
    const schema = JSON.parse(schemaContent) as OpenApiSpec;

    // eslint-disable-next-line no-console
    console.log('🔍 Validating OpenAPI Schema...\n');

    // Basic structure validation
    const requiredFields = ['openapi', 'info', 'paths'];
    const missingFields = requiredFields.filter(field => !(field in schema));

    if (missingFields.length > 0) {
      // eslint-disable-next-line no-console
      console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
      process.exit(1);
    }

    // Check OpenAPI version
    if (!schema.openapi.startsWith('3.')) {
      // eslint-disable-next-line no-console
      console.error(
        `❌ Invalid OpenAPI version: ${schema.openapi}. Expected 3.x.x`
      );
      process.exit(1);
    }

    // Validate component references
    const allRefs: string[] = [];
    const findRefs = (
      obj: Record<string, unknown> | unknown[] | null
    ): void => {
      if (obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach(item => {
            if (typeof item === 'object' && item !== null) {
              findRefs(item as Record<string, unknown>);
            }
          });
        } else if (typeof obj === 'object') {
          for (const [key, value] of Object.entries(obj)) {
            if (key === '$ref' && typeof value === 'string') {
              allRefs.push(value);
            } else if (typeof value === 'object' && value !== null) {
              if (Array.isArray(value)) {
                findRefs(value);
              } else {
                findRefs(value as Record<string, unknown>);
              }
            }
          }
        }
      }
    };

    findRefs(schema);

    const invalidRefs: string[] = [];
    const components = schema.components ?? {};

    for (const ref of allRefs) {
      if (ref.startsWith('#/components/')) {
        const refPath = ref.replace('#/components/', '');
        const refParts = refPath.split('/');
        const componentType = refParts[0];
        const componentName = refParts[1];

        if (componentType && componentName) {
          if (
            componentType === 'schemas' &&
            !components.schemas?.[componentName]
          ) {
            invalidRefs.push(ref);
          } else if (
            componentType === 'responses' &&
            !components.responses?.[componentName]
          ) {
            invalidRefs.push(ref);
          }
        }
      }
    }

    if (invalidRefs.length > 0) {
      // eslint-disable-next-line no-console
      console.error('❌ Invalid component references found:');
      invalidRefs.forEach(ref => {
        // eslint-disable-next-line no-console
        console.error(`   - ${ref}`);
      });
      process.exit(1);
    }

    // Success summary
    // eslint-disable-next-line no-console
    console.log('✅ OpenAPI Schema Validation Passed!');
    // eslint-disable-next-line no-console
    console.log(`📊 Summary:`);
    // eslint-disable-next-line no-console
    console.log(`   - OpenAPI Version: ${schema.openapi}`);
    // eslint-disable-next-line no-console
    console.log(`   - Paths: ${Object.keys(schema.paths).length}`);
    // eslint-disable-next-line no-console
    console.log(
      `   - Schemas: ${Object.keys(components.schemas ?? {}).length}`
    );
    // eslint-disable-next-line no-console
    console.log(
      `   - Response Components: ${Object.keys(components.responses ?? {}).length}`
    );
    // eslint-disable-next-line no-console
    console.log(`   - References Validated: ${allRefs.length}`);
    // eslint-disable-next-line no-console
    console.log(`\n🔗 Schema is ready for Swagger UI!`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error validating OpenAPI schema:', error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateOpenApiSchema();
}

export { validateOpenApiSchema };
