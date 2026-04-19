import { Router } from 'express';
import { AgentConfigService } from '@agentease/agent-engine';
import { prisma } from '../lib/prisma.js';
import { createAgentController } from '../modules/agent/controller.js';
import { PrismaAgentRepository } from '../modules/agent/repository.js';
import { AgentService } from '../modules/agent/service.js';
import { createAuthController } from '../modules/auth/controller.js';
import { InMemoryAuthRepository } from '../modules/auth/repository.js';
import { AuthService } from '../modules/auth/service.js';
import { createDeploymentController } from '../modules/deployment/controller.js';
import { PrismaDeploymentRepository } from '../modules/deployment/repository.js';
import { DeploymentService } from '../modules/deployment/service.js';
import { createOrgController } from '../modules/org/controller.js';
import { PrismaOrgRepository } from '../modules/org/repository.js';
import { OrgService } from '../modules/org/service.js';
import { createAgentforceIntegration } from '../integrations/agentforce.integration.js';
import {
  createSalesforceOAuthClient,
  createTokenVault
} from '../integrations/salesforce.integration.js';

export function createApiRouter(): Router {
  const router = Router();

  const orgService = new OrgService(new PrismaOrgRepository(prisma));
  const agentService = new AgentService(new PrismaAgentRepository(prisma), new AgentConfigService());

  const authService = new AuthService(
    new InMemoryAuthRepository(),
    createSalesforceOAuthClient(),
    createTokenVault(),
    orgService
  );

  const deploymentService = new DeploymentService(
    new PrismaDeploymentRepository(prisma),
    agentService,
    orgService,
    createAgentforceIntegration()
  );

  router.use(createAgentController(agentService));
  router.use(createDeploymentController(deploymentService));
  router.use(createOrgController(orgService));
  router.use(createAuthController(authService));

  return router;
}
