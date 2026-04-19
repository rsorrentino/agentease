import { PrismaClient } from '@prisma/client';
import { DeploymentResult } from './types.js';

export interface DeploymentRepository {
  create(input: {
    agentId: string;
    salesforceOrgId: string;
    status: string;
    logs: string[];
  }): Promise<DeploymentResult>;
}

export class PrismaDeploymentRepository implements DeploymentRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(input: {
    agentId: string;
    salesforceOrgId: string;
    status: string;
    logs: string[];
  }): Promise<DeploymentResult> {
    const result = await this.db.deployment.create({
      data: {
        agentId: input.agentId,
        salesforceOrgId: input.salesforceOrgId,
        status: input.status,
        logsJson: input.logs
      }
    });

    return {
      id: result.id,
      status: result.status,
      logs: result.logsJson as string[],
      errors: []
    };
  }
}
