import { spawn } from 'child_process';
import { CliExecutionResult } from '@agentease/types';

interface CliRunnerOptions {
  cliBinary: string;
  cwd?: string;
}

export interface AgentCliConfig {
  name: string;
  promptTemplate: string;
  [key: string]: unknown;
}

export interface OrgConnection {
  username: string;
  alias?: string;
}

export interface IAgentforceService {
  createAgent(config: AgentCliConfig): Promise<CliExecutionResult>;
  previewAgent(config: AgentCliConfig): Promise<CliExecutionResult>;
  deployAgent(config: AgentCliConfig, org: OrgConnection): Promise<CliExecutionResult>;
}

export class AgentforceService implements IAgentforceService {
  constructor(private readonly options: CliRunnerOptions) {}

  async createAgent(config: AgentCliConfig): Promise<CliExecutionResult> {
    return this.runCommand(['agent', 'create', '--json-input', JSON.stringify(config)]);
  }

  async previewAgent(config: AgentCliConfig): Promise<CliExecutionResult> {
    return this.runCommand(['agent', 'preview', '--json-input', JSON.stringify(config)]);
  }

  async deployAgent(config: AgentCliConfig, org: OrgConnection): Promise<CliExecutionResult> {
    return this.runCommand([
      'agent',
      'deploy',
      '--target-org',
      org.alias ?? org.username,
      '--json-input',
      JSON.stringify(config)
    ]);
  }

  private runCommand(args: string[]): Promise<CliExecutionResult> {
    return new Promise((resolve) => {
      const logs: string[] = [];
      const errors: string[] = [];
      const metadata: Record<string, unknown> = {};

      const proc = spawn(this.options.cliBinary, args, {
        cwd: this.options.cwd,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      proc.stdout.on('data', (chunk: Buffer) => {
        const line = chunk.toString('utf8').trim();
        if (!line) return;
        logs.push(line);
        this.parseLine(line, metadata, errors);
      });

      proc.stderr.on('data', (chunk: Buffer) => {
        const line = chunk.toString('utf8').trim();
        if (!line) return;
        errors.push(line);
      });

      proc.on('close', (code) => {
        resolve({
          success: code === 0 && errors.length === 0,
          logs,
          errors,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined
        });
      });
    });
  }

  private parseLine(line: string, metadata: Record<string, unknown>, errors: string[]): void {
    try {
      const parsed = JSON.parse(line) as Record<string, unknown>;
      if (parsed.level === 'error' && typeof parsed.message === 'string') {
        errors.push(parsed.message);
      }
      if (parsed.type && parsed.value) {
        metadata[String(parsed.type)] = parsed.value;
      }
    } catch {
      // non-JSON logs are already captured in logs array
    }
  }
}
