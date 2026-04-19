import { PrismaClient } from '@prisma/client';
import { AgentResponse, CreateAgentDTO } from './types.js';

export interface AgentRepository {
  create(input: CreateAgentDTO): Promise<AgentResponse>;
  list(): Promise<AgentResponse[]>;
  findById(id: string): Promise<AgentResponse | null>;
}

export class PrismaAgentRepository implements AgentRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(input: CreateAgentDTO): Promise<AgentResponse> {
    return this.db.agent.create({
      data: {
        name: input.name,
        description: input.description,
        promptTemplate: input.promptTemplate,
        toolsJson: input.tools,
        dataSourcesJson: input.dataSources
      }
    });
  }

  async list(): Promise<AgentResponse[]> {
    return this.db.agent.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string): Promise<AgentResponse | null> {
    return this.db.agent.findUnique({ where: { id } });
  }
}
