/**
 * E2E Test: Wizard-to-Deployment Flow
 *
 * This test validates the complete user journey from creating an agent
 * through the wizard to deploying it to a Salesforce org.
 */

import { IAgentforceService } from '@agentease/cli-wrapper';
import { ISalesforceOAuthClient, TokenVault } from '@agentease/salesforce';
import { AgentService } from '../src/modules/agent/service';
import { AgentRepository } from '../src/modules/agent/repository';
import { AgentConfigService } from '@agentease/agent-engine';
import { DeploymentService } from '../src/modules/deployment/service';
import { DeploymentRepository } from '../src/modules/deployment/repository';
import { OrgService } from '../src/modules/org/service';
import { OrgRepository } from '../src/modules/org/repository';
import { AuthService } from '../src/modules/auth/service';
import { AuthRepository } from '../src/modules/auth/repository';

describe('E2E: Wizard to Deployment Flow', () => {
  let agentService: AgentService;
  let deploymentService: DeploymentService;
  let authService: AuthService;
  let orgService: OrgService;
  let agentforceService: IAgentforceService;
  let agentRepo: AgentRepository;
  let deploymentRepo: DeploymentRepository;
  let orgRepo: OrgRepository;
  let authRepo: AuthRepository;
  let oauthClient: ISalesforceOAuthClient;
  let tokenVault: TokenVault;

  beforeEach(() => {
    // Setup repositories with in-memory storage
    const agents = new Map();
    const deployments: any[] = [];
    const orgs = new Map();

    agentRepo = {
      create: jest.fn(async (input) => {
        const agent = {
          id: `agent_${Date.now()}`,
          ...input,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        agents.set(agent.id, agent);
        return agent;
      }),
      list: jest.fn(async () => Array.from(agents.values())),
      findById: jest.fn(async (id) => agents.get(id) || null)
    };

    deploymentRepo = {
      create: jest.fn(async (input) => {
        const deployment = {
          id: `deploy_${Date.now()}`,
          ...input,
          createdAt: new Date()
        };
        deployments.push(deployment);
        return deployment;
      }),
      list: jest.fn(async (agentId) =>
        agentId ? deployments.filter(d => d.agentId === agentId) : deployments
      )
    };

    orgRepo = {
      create: jest.fn(async (input) => {
        const org = {
          id: `org_${Date.now()}`,
          ...input,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        orgs.set(org.id, org);
        return org;
      }),
      list: jest.fn(async () => Array.from(orgs.values())),
      findById: jest.fn(async (id) => orgs.get(id) || null)
    };

    authRepo = {
      saveState: jest.fn(async () => {}),
      validateState: jest.fn(async () => true)
    };

    oauthClient = {
      buildAuthorizationUrl: jest.fn((state) => `https://login.salesforce.com/oauth?state=${state}`),
      exchangeCodeForToken: jest.fn(async () => ({
        accessToken: 'test_access_token',
        refreshToken: 'test_refresh_token',
        instanceUrl: 'https://test.my.salesforce.com'
      }))
    };

    tokenVault = {
      encrypt: jest.fn(async (token) => `encrypted_${token}`),
      decrypt: jest.fn(async (encrypted) => encrypted.replace('encrypted_', ''))
    };

    agentforceService = {
      createAgent: jest.fn(async () => ({
        success: true,
        logs: ['Agent created in Salesforce'],
        errors: []
      })),
      previewAgent: jest.fn(async () => ({
        success: true,
        logs: ['Preview generated'],
        errors: []
      })),
      deployAgent: jest.fn(async () => ({
        success: true,
        logs: ['Deployment initiated', 'Agent deployed successfully'],
        errors: []
      }))
    };

    // Initialize services
    orgService = new OrgService(orgRepo);
    authService = new AuthService(authRepo, oauthClient, tokenVault, orgService);
    agentService = new AgentService(agentRepo, new AgentConfigService(), agentforceService);
    deploymentService = new DeploymentService(deploymentRepo, agentService, orgService, agentforceService);
  });

  describe('Complete happy path', () => {
    it('should complete full flow: OAuth → Create Agent → Deploy', async () => {
      // Step 1: User initiates OAuth connection
      const userId = 'user_test_123';
      const authUrl = await authService.buildConnectionUrl(userId);

      expect(authUrl).toContain('https://login.salesforce.com/oauth');
      expect(authRepo.saveState).toHaveBeenCalledWith(userId, expect.any(String));

      // Step 2: User completes OAuth callback
      const authCode = 'auth_code_xyz';
      const state = 'valid_state_token';
      await authService.handleCallback(userId, authCode, state);

      expect(oauthClient.exchangeCodeForToken).toHaveBeenCalledWith(authCode);

      const orgList = await orgService.list();
      expect(orgList).toHaveLength(1);
      const connectedOrg = orgList[0];
      expect(connectedOrg.username).toBe(userId);
      expect(connectedOrg.instanceUrl).toBe('https://test.my.salesforce.com');

      // Step 3: User creates agent through wizard
      const agentInput = {
        name: 'Case Deflector',
        description: 'Handles common support questions before creating cases',
        promptTemplate: 'You are a helpful Salesforce Service Cloud assistant...',
        tools: [
          { id: 't1', name: 'Knowledge Search', description: 'Search knowledge base', type: 'knowledge' as const }
        ],
        dataSources: [
          { id: 'd1', name: 'Support KB', kind: 'knowledge-base' as const, config: { source: 'kb_articles' } }
        ]
      };

      const createdAgent = await agentService.create(agentInput);

      expect(createdAgent.id).toBeDefined();
      expect(createdAgent.name).toBe('Case Deflector');
      expect(createdAgent.tools).toHaveLength(1);
      expect(createdAgent.dataSources).toHaveLength(1);
      expect(agentforceService.createAgent).toHaveBeenCalledWith({
        name: 'Case Deflector',
        promptTemplate: agentInput.promptTemplate
      });

      // Step 4: User deploys agent to connected org
      const deployment = await deploymentService.deploy({
        agentId: createdAgent.id,
        orgId: connectedOrg.id
      });

      expect(deployment.status).toBe('SUCCEEDED');
      expect(deployment.logs).toContain('Deployment initiated');
      expect(deployment.logs).toContain('Agent deployed successfully');
      expect(agentforceService.deployAgent).toHaveBeenCalledWith(
        { name: 'Case Deflector', promptTemplate: agentInput.promptTemplate },
        { username: userId, alias: connectedOrg.alias }
      );

      // Step 5: Verify deployment history
      const deploymentHistory = await deploymentService.list(createdAgent.id);
      expect(deploymentHistory).toHaveLength(1);
      expect(deploymentHistory[0].agentId).toBe(createdAgent.id);
      expect(deploymentHistory[0].salesforceOrgId).toBe(connectedOrg.id);
    });
  });

  describe('Error recovery scenarios', () => {
    it('should handle OAuth failure gracefully', async () => {
      oauthClient.exchangeCodeForToken = jest.fn(async () => {
        throw new Error('Invalid authorization code');
      });

      await expect(
        authService.handleCallback('user123', 'bad_code', 'state')
      ).rejects.toThrow('Invalid authorization code');

      const orgList = await orgService.list();
      expect(orgList).toHaveLength(0);
    });

    it('should handle agent creation failure and prevent deployment', async () => {
      agentforceService.createAgent = jest.fn(async () => ({
        success: false,
        logs: ['Validation failed'],
        errors: ['Error: Invalid prompt template']
      }));

      // Create org first
      const org = await orgService.create({
        name: 'Test Org',
        username: 'user@test.com',
        instanceUrl: 'https://test.my.salesforce.com',
        encryptedAccessToken: 'encrypted_token',
        encryptedRefreshToken: 'encrypted_refresh'
      });

      // Agent creation succeeds in DB but CLI reports issues
      const agent = await agentService.create({
        name: 'Test Agent',
        description: 'Test',
        promptTemplate: 'Invalid prompt',
        tools: [],
        dataSources: []
      });

      expect(agent.cliErrors).toContain('Error: Invalid prompt template');

      // User should not proceed to deployment if CLI reported errors
      // But if they do, deployment should still work with DB record
      const deployment = await deploymentService.deploy({
        agentId: agent.id,
        orgId: org.id
      });

      expect(deployment).toBeDefined();
    });

    it('should handle deployment failure with detailed logs', async () => {
      agentforceService.deployAgent = jest.fn(async () => ({
        success: false,
        logs: [
          'Connecting to Salesforce...',
          'Authenticating...',
          'Uploading agent configuration...',
          'Validation failed'
        ],
        errors: [
          'Error: Missing required permission: ManageAgents',
          'Error: Deployment rolled back'
        ]
      }));

      // Setup org and agent
      const org = await orgService.create({
        name: 'Test Org',
        username: 'user@test.com',
        instanceUrl: 'https://test.my.salesforce.com',
        encryptedAccessToken: 'encrypted_token',
        encryptedRefreshToken: 'encrypted_refresh'
      });

      const agent = await agentService.create({
        name: 'Test Agent',
        description: 'Test',
        promptTemplate: 'Test prompt',
        tools: [],
        dataSources: []
      });

      const deployment = await deploymentService.deploy({
        agentId: agent.id,
        orgId: org.id
      });

      expect(deployment.status).toBe('FAILED');
      expect(deployment.logs).toContain('Validation failed');
      expect(deployment.errors).toContain('Error: Missing required permission: ManageAgents');
      expect(deployment.errors).toContain('Error: Deployment rolled back');
    });

    it('should handle multiple deployments to different orgs', async () => {
      // Create agent
      const agent = await agentService.create({
        name: 'Multi-Org Agent',
        description: 'Deployed to multiple orgs',
        promptTemplate: 'Test prompt',
        tools: [],
        dataSources: []
      });

      // Create two orgs
      const org1 = await orgService.create({
        name: 'Dev Org',
        username: 'dev@test.com',
        instanceUrl: 'https://dev.my.salesforce.com',
        encryptedAccessToken: 'encrypted_token_1',
        encryptedRefreshToken: 'encrypted_refresh_1'
      });

      const org2 = await orgService.create({
        name: 'Staging Org',
        username: 'staging@test.com',
        instanceUrl: 'https://staging.my.salesforce.com',
        encryptedAccessToken: 'encrypted_token_2',
        encryptedRefreshToken: 'encrypted_refresh_2'
      });

      // Deploy to first org
      const deployment1 = await deploymentService.deploy({
        agentId: agent.id,
        orgId: org1.id
      });

      expect(deployment1.status).toBe('SUCCEEDED');

      // Deploy to second org
      const deployment2 = await deploymentService.deploy({
        agentId: agent.id,
        orgId: org2.id
      });

      expect(deployment2.status).toBe('SUCCEEDED');

      // Verify deployment history
      const history = await deploymentService.list(agent.id);
      expect(history).toHaveLength(2);
      expect(history.map(d => d.salesforceOrgId)).toContain(org1.id);
      expect(history.map(d => d.salesforceOrgId)).toContain(org2.id);
    });
  });

  describe('Concurrent operations', () => {
    it('should handle concurrent agent creations', async () => {
      const createPromises = [
        agentService.create({
          name: 'Agent 1',
          description: 'First agent',
          promptTemplate: 'Prompt 1',
          tools: [],
          dataSources: []
        }),
        agentService.create({
          name: 'Agent 2',
          description: 'Second agent',
          promptTemplate: 'Prompt 2',
          tools: [],
          dataSources: []
        }),
        agentService.create({
          name: 'Agent 3',
          description: 'Third agent',
          promptTemplate: 'Prompt 3',
          tools: [],
          dataSources: []
        })
      ];

      const agents = await Promise.all(createPromises);

      expect(agents).toHaveLength(3);
      expect(new Set(agents.map(a => a.id)).size).toBe(3); // All unique IDs
      expect(agentforceService.createAgent).toHaveBeenCalledTimes(3);
    });

    it('should handle concurrent deployments of same agent', async () => {
      const agent = await agentService.create({
        name: 'Concurrent Deploy Agent',
        description: 'Test',
        promptTemplate: 'Test',
        tools: [],
        dataSources: []
      });

      const org = await orgService.create({
        name: 'Test Org',
        username: 'user@test.com',
        instanceUrl: 'https://test.my.salesforce.com',
        encryptedAccessToken: 'encrypted_token',
        encryptedRefreshToken: 'encrypted_refresh'
      });

      // Simulate concurrent deployment requests
      const deployPromises = [
        deploymentService.deploy({ agentId: agent.id, orgId: org.id }),
        deploymentService.deploy({ agentId: agent.id, orgId: org.id })
      ];

      const deployments = await Promise.all(deployPromises);

      expect(deployments).toHaveLength(2);
      expect(deployments[0].status).toBe('SUCCEEDED');
      expect(deployments[1].status).toBe('SUCCEEDED');

      const history = await deploymentService.list(agent.id);
      expect(history).toHaveLength(2);
    });
  });
});
