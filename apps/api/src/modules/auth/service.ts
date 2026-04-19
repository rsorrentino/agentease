import { randomUUID } from 'crypto';
import { ISalesforceOAuthClient, TokenVault } from '@agentease/salesforce';
import { AuthRepository } from './repository.js';
import { OrgService } from '../org/service.js';

export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly oauthClient: ISalesforceOAuthClient,
    private readonly tokenVault: TokenVault,
    private readonly orgService: OrgService
  ) {}

  async buildConnectionUrl(userId: string): Promise<string> {
    const state = randomUUID();
    await this.authRepository.saveState(userId, state);
    return this.oauthClient.buildAuthorizationUrl(state);
  }

  async handleCallback(userId: string, code: string, state: string): Promise<void> {
    const isValid = await this.authRepository.validateState(userId, state);
    if (!isValid) throw new Error('Invalid OAuth state');

    const tokens = await this.oauthClient.exchangeCodeForToken(code);
    await this.orgService.create({
      name: `Org ${tokens.instanceUrl}`,
      username: userId,
      instanceUrl: tokens.instanceUrl,
      encryptedAccessToken: await this.tokenVault.encrypt(tokens.accessToken),
      encryptedRefreshToken: await this.tokenVault.encrypt(tokens.refreshToken)
    });
  }
}
