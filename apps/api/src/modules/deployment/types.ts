import { DeploymentRequest } from '@agentease/types';

export type DeployAgentDTO = DeploymentRequest;

export interface DeploymentResult {
  id: string;
  status: string;
  logs: string[];
  errors: string[];
}
