import { Agent, AgentInput } from '@agentease/types';

export class AgentConfigService {
  build(input: AgentInput): Omit<Agent, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: input.name.trim(),
      description: input.description.trim(),
      promptTemplate: input.promptTemplate.trim(),
      tools: input.tools,
      dataSources: input.dataSources
    };
  }

  validate(input: AgentInput): string[] {
    const errors: string[] = [];
    if (!input.name.trim()) errors.push('Agent name is required.');
    if (!input.promptTemplate.trim()) errors.push('Prompt template is required.');
    return errors;
  }
}
