export interface Tool {
  id: string;
  name: string;
  description: string;
  type: 'salesforce-action' | 'http' | 'knowledge';
}

export interface DataSource {
  id: string;
  name: string;
  kind: 'salesforce-object' | 'knowledge-base' | 'api';
  config: Record<string, string>;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  tools: Tool[];
  dataSources: DataSource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentInput {
  name: string;
  description: string;
  promptTemplate: string;
  tools: Tool[];
  dataSources: DataSource[];
}

export interface CliExecutionResult {
  success: boolean;
  logs: string[];
  errors: string[];
  metadata?: Record<string, unknown>;
}

export interface DeploymentRequest {
  agentId: string;
  orgId: string;
}

export interface SalesforceOrgDTO {
  id: string;
  name: string;
  instanceUrl: string;
}
