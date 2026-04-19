import { AgentInput } from '@agentease/types';

export type CreateAgentDTO = AgentInput;

export interface AgentResponse {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  tools: unknown;
  dataSources: unknown;
  createdAt: Date;
  updatedAt: Date;
}
