import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(currentDir, '../../../../');

config({ path: resolve(repoRoot, '.env') });
config({ path: resolve(repoRoot, '.env.example') });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1).default('file:./prisma/agentease.db'),
  JWT_SECRET: z.string().min(12),
  SALESFORCE_CLIENT_ID: z.string().min(1),
  SALESFORCE_CLIENT_SECRET: z.string().min(1),
  SALESFORCE_REDIRECT_URI: z.string().url(),
  SALESFORCE_LOGIN_URL: z.string().url(),
  AGENTFORCE_CLI_BIN: z.string().default('sf')
});

export const env = schema.parse(process.env);
