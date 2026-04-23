import { IAgentforceService } from '@agentease/cli-wrapper';
import { z } from 'zod';
import { AgentService } from '../agent/service.js';
import { OrgService } from '../org/service.js';
import { DeploymentRepository } from './repository.js';
import { DeployAgentDTO, DeploymentResult } from './types.js';

const deploySchema = z.object({
  agentId: z.string().min(1),
  orgId: z.string().min(1)
});

export class DeploymentService {
  constructor(
    private readonly deploymentRepository: DeploymentRepository,
    private readonly agentService: AgentService,
    private readonly orgService: OrgService,
    private readonly agentforceService: IAgentforceService
  ) {}

  async list(agentId?: string): Promise<DeploymentResult[]> {
    return this.deploymentRepository.list(agentId);
  }

  async deploy(input: DeployAgentDTO): Promise<DeploymentResult> {
    const parsed = deploySchema.parse(input);
    const agent = await this.agentService.getById(parsed.agentId);
    const org = await this.orgService.getById(parsed.orgId);

    const cliResult = await this.agentforceService.deployAgent(
      { name: agent.name, promptTemplate: agent.promptTemplate },
      { username: org.username, alias: org.alias }
    );

    const saved = await this.deploymentRepository.create({
      agentId: agent.id,
      salesforceOrgId: org.id,
      status: cliResult.success ? 'SUCCEEDED' : 'FAILED',
      logs: [...cliResult.logs, ...cliResult.errors]
    });

    return { ...saved, errors: cliResult.errors };
  }
}
