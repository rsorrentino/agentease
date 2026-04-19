import { AgentConfigService } from '@agentease/agent-engine';
import { AgentService } from '../src/modules/agent/service';
import { AgentRepository } from '../src/modules/agent/repository';

describe('AgentService', () => {
  it('creates an agent when input is valid', async () => {
    const repo: AgentRepository = {
      create: jest.fn(async (input) => ({
        id: 'a1',
        ...input,
        tools: input.tools,
        dataSources: input.dataSources,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      list: jest.fn(async () => []),
      findById: jest.fn(async () => null)
    };

    const service = new AgentService(repo, new AgentConfigService());
    const result = await service.create({
      name: 'Support Agent',
      description: 'Helps with support',
      promptTemplate: 'Assist user',
      tools: [{ id: 't1', name: 'Case Lookup', description: 'Reads cases', type: 'salesforce-action' }],
      dataSources: [{ id: 'd1', name: 'Knowledge', kind: 'knowledge-base', config: { source: 'kb' } }]
    });

    expect(result.id).toBe('a1');
    expect(repo.create).toHaveBeenCalled();
  });
});
