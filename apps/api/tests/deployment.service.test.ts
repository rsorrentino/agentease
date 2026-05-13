import { IAgentforceService } from '@agentease/cli-wrapper';
import { DeploymentService } from '../src/modules/deployment/service';
import { DeploymentRepository } from '../src/modules/deployment/repository';
import { AgentService } from '../src/modules/agent/service';
import { OrgService } from '../src/modules/org/service';

describe('DeploymentService', () => {
  let deploymentRepo: DeploymentRepository;
  let agentService: AgentService;
  let orgService: OrgService;
  let agentforceService: IAgentforceService;
  let deploymentService: DeploymentService;

  beforeEach(() => {
    deploymentRepo = {
      create: jest.fn(async (input) => ({
        id: 'd1',
        agentId: input.agentId,
        salesforceOrgId: input.salesforceOrgId,
        status: input.status,
        logs: input.logs,
        errors: [],
        createdAt: new Date()
      })),
      list: jest.fn(async () => [])
    };

    agentService = {
      getById: jest.fn(async (id) => ({
        id,
        name: 'Support Agent',
        description: 'Helps with support',
        promptTemplate: 'Assist user with their questions',
        tools: [],
        dataSources: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    } as unknown as AgentService;

    orgService = {
      getById: jest.fn(async (id) => ({
        id,
        name: 'Dev Org',
        username: 'user@example.com',
        alias: 'dev',
        instanceUrl: 'https://example.my.salesforce.com',
        encryptedAccessToken: 'encrypted_token',
        encryptedRefreshToken: 'encrypted_refresh',
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    } as unknown as OrgService;

    agentforceService = {
      createAgent: jest.fn(),
      previewAgent: jest.fn(),
      deployAgent: jest.fn(async () => ({ success: true, logs: ['Deployment started', 'Deployment completed'], errors: [] }))
    };

    deploymentService = new DeploymentService(deploymentRepo, agentService, orgService, agentforceService);
  });

  describe('deploy - happy path', () => {
    it('deploys agent successfully and stores status', async () => {
      const result = await deploymentService.deploy({ agentId: 'a1', orgId: 'o1' });

      expect(result.status).toBe('SUCCEEDED');
      expect(result.logs).toContain('Deployment started');
      expect(result.logs).toContain('Deployment completed');
      expect(deploymentRepo.create).toHaveBeenCalledWith({
        agentId: 'a1',
        salesforceOrgId: 'o1',
        status: 'SUCCEEDED',
        logs: ['Deployment started', 'Deployment completed']
      });
    });

    it('passes correct agent config to CLI', async () => {
      await deploymentService.deploy({ agentId: 'a1', orgId: 'o1' });

      expect(agentforceService.deployAgent).toHaveBeenCalledWith(
        { name: 'Support Agent', promptTemplate: 'Assist user with their questions' },
        { username: 'user@example.com', alias: 'dev' }
      );
    });

    it('returns deployment with logs and errors', async () => {
      agentforceService.deployAgent = jest.fn(async () => ({
        success: true,
        logs: ['Step 1', 'Step 2'],
        errors: ['Warning: deprecated API']
      }));

      const result = await deploymentService.deploy({ agentId: 'a1', orgId: 'o1' });

      expect(result.logs).toEqual(['Step 1', 'Step 2', 'Warning: deprecated API']);
      expect(result.errors).toEqual(['Warning: deprecated API']);
    });
  });

  describe('deploy - validation errors', () => {
    it('throws error when agentId is missing', async () => {
      await expect(
        deploymentService.deploy({ agentId: '', orgId: 'o1' })
      ).rejects.toThrow();
    });

    it('throws error when orgId is missing', async () => {
      await expect(
        deploymentService.deploy({ agentId: 'a1', orgId: '' })
      ).rejects.toThrow();
    });

    it('throws error when agent does not exist', async () => {
      agentService.getById = jest.fn(async () => {
        throw new Error('Agent not found');
      });

      await expect(
        deploymentService.deploy({ agentId: 'nonexistent', orgId: 'o1' })
      ).rejects.toThrow('Agent not found');

      expect(agentforceService.deployAgent).not.toHaveBeenCalled();
    });

    it('throws error when org does not exist', async () => {
      orgService.getById = jest.fn(async () => {
        throw new Error('Salesforce org not found');
      });

      await expect(
        deploymentService.deploy({ agentId: 'a1', orgId: 'nonexistent' })
      ).rejects.toThrow('Salesforce org not found');

      expect(agentforceService.deployAgent).not.toHaveBeenCalled();
    });
  });

  describe('deploy - CLI failure scenarios', () => {
    it('marks deployment as FAILED when CLI returns success: false', async () => {
      agentforceService.deployAgent = jest.fn(async () => ({
        success: false,
        logs: ['Starting deployment', 'Connection failed'],
        errors: ['Error: Unable to connect to Salesforce org']
      }));

      const result = await deploymentService.deploy({ agentId: 'a1', orgId: 'o1' });

      expect(result.status).toBe('FAILED');
      expect(result.errors).toContain('Error: Unable to connect to Salesforce org');
      expect(deploymentRepo.create).toHaveBeenCalledWith({
        agentId: 'a1',
        salesforceOrgId: 'o1',
        status: 'FAILED',
        logs: ['Starting deployment', 'Connection failed', 'Error: Unable to connect to Salesforce org']
      });
    });

    it('handles CLI timeout error', async () => {
      agentforceService.deployAgent = jest.fn(async () => ({
        success: false,
        logs: ['Deployment started'],
        errors: ['Error: Deployment timeout after 300s']
      }));

      const result = await deploymentService.deploy({ agentId: 'a1', orgId: 'o1' });

      expect(result.status).toBe('FAILED');
      expect(result.errors).toContain('Error: Deployment timeout after 300s');
    });

    it('handles CLI authentication failure', async () => {
      agentforceService.deployAgent = jest.fn(async () => ({
        success: false,
        logs: ['Authenticating...'],
        errors: ['Error: Invalid credentials or expired session']
      }));

      const result = await deploymentService.deploy({ agentId: 'a1', orgId: 'o1' });

      expect(result.status).toBe('FAILED');
      expect(result.errors).toContain('Error: Invalid credentials or expired session');
    });

    it('handles CLI permission error', async () => {
      agentforceService.deployAgent = jest.fn(async () => ({
        success: false,
        logs: ['Validating permissions...'],
        errors: ['Error: Insufficient permissions to deploy agent']
      }));

      const result = await deploymentService.deploy({ agentId: 'a1', orgId: 'o1' });

      expect(result.status).toBe('FAILED');
      expect(result.errors).toContain('Error: Insufficient permissions to deploy agent');
    });

    it('handles CLI network error', async () => {
      agentforceService.deployAgent = jest.fn(async () => {
        throw new Error('Network error: ECONNREFUSED');
      });

      await expect(
        deploymentService.deploy({ agentId: 'a1', orgId: 'o1' })
      ).rejects.toThrow('Network error: ECONNREFUSED');
    });

    it('handles CLI crash with no error message', async () => {
      agentforceService.deployAgent = jest.fn(async () => ({
        success: false,
        logs: ['Starting...'],
        errors: []
      }));

      const result = await deploymentService.deploy({ agentId: 'a1', orgId: 'o1' });

      expect(result.status).toBe('FAILED');
      expect(result.logs).toContain('Starting...');
    });
  });

  describe('deploy - repository failure scenarios', () => {
    it('throws error when deployment record creation fails', async () => {
      deploymentRepo.create = jest.fn(async () => {
        throw new Error('Database connection lost');
      });

      await expect(
        deploymentService.deploy({ agentId: 'a1', orgId: 'o1' })
      ).rejects.toThrow('Database connection lost');

      expect(agentforceService.deployAgent).toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('returns all deployments when no agentId provided', async () => {
      deploymentRepo.list = jest.fn(async () => [
        { id: 'd1', agentId: 'a1', salesforceOrgId: 'o1', status: 'SUCCEEDED', logs: [], errors: [], createdAt: new Date() },
        { id: 'd2', agentId: 'a2', salesforceOrgId: 'o1', status: 'FAILED', logs: [], errors: [], createdAt: new Date() }
      ]);

      const result = await deploymentService.list();

      expect(result).toHaveLength(2);
      expect(deploymentRepo.list).toHaveBeenCalledWith(undefined);
    });

    it('returns filtered deployments when agentId provided', async () => {
      deploymentRepo.list = jest.fn(async (agentId) => [
        { id: 'd1', agentId: 'a1', salesforceOrgId: 'o1', status: 'SUCCEEDED', logs: [], errors: [], createdAt: new Date() }
      ]);

      const result = await deploymentService.list('a1');

      expect(result).toHaveLength(1);
      expect(result[0].agentId).toBe('a1');
      expect(deploymentRepo.list).toHaveBeenCalledWith('a1');
    });
  });
});
