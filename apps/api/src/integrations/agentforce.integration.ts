import { AgentforceService, IAgentforceService } from '@agentease/cli-wrapper';
import { env } from '../config/env.js';

export function createAgentforceIntegration(): IAgentforceService {
  return new AgentforceService({ cliBinary: env.AGENTFORCE_CLI_BIN, cwd: process.cwd() });
}
