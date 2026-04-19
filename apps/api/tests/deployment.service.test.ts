import { IAgentforceService } from '@agentease/cli-wrapper';
import { DeploymentService } from '../src/modules/deployment/service';
import { DeploymentRepository } from '../src/modules/deployment/repository';
import { AgentService } from '../src/modules/agent/service';
import { OrgService } from '../src/modules/org/service';

describe('DeploymentService', () => {
  it('deploys and stores status', async () => {
    const deploymentRepo: DeploymentRepository = {
      create: jest.fn(async () => ({ id: 'd1', status: 'SUCCEEDED', logs: ['ok'], errors: [] }))
    };

    const agentService = {
      getById: jest.fn(async () => ({ id: 'a1', name: 'A', promptTemplate: 'P' }))
    } as unknown as AgentService;

    const orgService = {
      getById: jest.fn(async () => ({ id: 'o1', username: 'user@example.com', alias: 'dev' }))
    } as unknown as OrgService;

    const agentforceService: IAgentforceService = {
      createAgent: jest.fn(),
      previewAgent: jest.fn(),
      deployAgent: jest.fn(async () => ({ success: true, logs: ['done'], errors: [] }))
    };

    const service = new DeploymentService(deploymentRepo, agentService, orgService, agentforceService);
    const result = await service.deploy({ agentId: 'a1', orgId: 'o1' });

    expect(result.status).toBe('SUCCEEDED');
    expect(deploymentRepo.create).toHaveBeenCalled();
  });
});
