import { PrismaClient } from '@prisma/client';
import { AgentResponse, CreateAgentDTO } from './types.js';

export interface AgentRepository {
  create(input: CreateAgentDTO): Promise<AgentResponse>;
  list(): Promise<AgentResponse[]>;
  findById(id: string): Promise<AgentResponse | null>;
}

function mapAgent(record: {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  toolsJson: string;
  dataSourcesJson: string;
  createdAt: Date;
  updatedAt: Date;
}): AgentResponse {
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    promptTemplate: record.promptTemplate,
    tools: JSON.parse(record.toolsJson),
    dataSources: JSON.parse(record.dataSourcesJson),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

export class PrismaAgentRepository implements AgentRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(input: CreateAgentDTO): Promise<AgentResponse> {
    const created = await this.db.agent.create({
      data: {
        name: input.name,
        description: input.description,
        promptTemplate: input.promptTemplate,
        toolsJson: JSON.stringify(input.tools),
        dataSourcesJson: JSON.stringify(input.dataSources)
      }
    });

    return mapAgent(created);
  }

  async list(): Promise<AgentResponse[]> {
    const agents = await this.db.agent.findMany({ orderBy: { createdAt: 'desc' } });
    return agents.map(mapAgent);
  }

  async findById(id: string): Promise<AgentResponse | null> {
    const agent = await this.db.agent.findUnique({ where: { id } });
    return agent ? mapAgent(agent) : null;
  }
}
