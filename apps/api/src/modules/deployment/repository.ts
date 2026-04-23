import { PrismaClient } from '@prisma/client';
import { DeploymentResult } from './types.js';

export interface DeploymentRepository {
  create(input: {
    agentId: string;
    salesforceOrgId: string;
    status: string;
    logs: string[];
  }): Promise<DeploymentResult>;
  list(agentId?: string): Promise<DeploymentResult[]>;
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
        logsJson: JSON.stringify(input.logs)
      }
    });

    return {
      id: result.id,
      status: result.status,
      logs: JSON.parse(result.logsJson) as string[],
      errors: []
    };
  }

  async list(agentId?: string): Promise<DeploymentResult[]> {
    const records = await this.db.deployment.findMany({
      where: agentId ? { agentId } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    return records.map((r) => ({
      id: r.id,
      status: r.status,
      logs: JSON.parse(r.logsJson) as string[],
      errors: []
    }));
  }
}
