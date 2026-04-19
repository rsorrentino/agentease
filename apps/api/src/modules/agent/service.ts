import { AgentConfigService } from '@agentease/agent-engine';
import { z } from 'zod';
import { AgentRepository } from './repository.js';
import { AgentResponse, CreateAgentDTO } from './types.js';

const createAgentSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  promptTemplate: z.string().min(1),
  tools: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      type: z.enum(['salesforce-action', 'http', 'knowledge'])
    })
  ),
  dataSources: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      kind: z.enum(['salesforce-object', 'knowledge-base', 'api']),
      config: z.record(z.string())
    })
  )
});

export class AgentService {
  constructor(
    private readonly repository: AgentRepository,
    private readonly configService: AgentConfigService
  ) {}

  async create(input: CreateAgentDTO): Promise<AgentResponse> {
    const parsed = createAgentSchema.parse(input);
    const validationErrors = this.configService.validate(parsed);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(' '));
    }

    return this.repository.create(parsed);
  }

  async list(): Promise<AgentResponse[]> {
    return this.repository.list();
  }

  async getById(id: string): Promise<AgentResponse> {
    const agent = await this.repository.findById(id);
    if (!agent) throw new Error('Agent not found');
    return agent;
  }
}
