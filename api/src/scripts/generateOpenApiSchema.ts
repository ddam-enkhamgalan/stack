#!/usr/bin/env tsx

import { writeFileSync } from 'fs';
import { resolve } from 'path';

import { specs } from '../config/swagger.js';

interface OpenApiSpec {
  paths?: Record<string, unknown>;
  components?: {
    schemas?: Record<string, unknown>;
  };
  servers?: unknown[];
}

const generateOpenApiSchema = (): void => {
  try {
    const outputPath = resolve(process.cwd(), 'openapi.json');
    const yamlOutputPath = resolve(process.cwd(), 'openapi.yaml');

    // Generate JSON schema
    writeFileSync(outputPath, JSON.stringify(specs, null, 2));
    // eslint-disable-next-line no-console
    console.log(`✅ OpenAPI JSON schema generated at: ${outputPath}`);

    // Generate YAML schema (basic conversion)
    const yamlContent = JSON.stringify(specs, null, 2)
      .replace(/"([^"]+)":/g, '$1:')
      .replace(/"/g, '')
      .split('\n')
      .map(line => line.replace(/^ {2}/g, ''))
      .join('\n');

    writeFileSync(yamlOutputPath, yamlContent);
    // eslint-disable-next-line no-console
    console.log(`✅ OpenAPI YAML schema generated at: ${yamlOutputPath}`);

    const typedSpecs = specs as OpenApiSpec;

    // eslint-disable-next-line no-console
    console.log('\n📊 Schema Statistics:');
    // eslint-disable-next-line no-console
    console.log(`- Paths: ${Object.keys(typedSpecs.paths ?? {}).length}`);
    // eslint-disable-next-line no-console
    console.log(
      `- Components: ${Object.keys(typedSpecs.components?.schemas ?? {}).length} schemas`
    );
    // eslint-disable-next-line no-console
    console.log(`- Servers: ${typedSpecs.servers?.length ?? 0}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error generating OpenAPI schema:', error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateOpenApiSchema();
}

export { generateOpenApiSchema };
