import { AuthService } from '../src/modules/auth/service';
import { AuthRepository } from '../src/modules/auth/repository';
import { ISalesforceOAuthClient, TokenVault } from '@agentease/salesforce';
import { OrgService } from '../src/modules/org/service';

describe('AuthService', () => {
  let authRepo: AuthRepository;
  let oauthClient: ISalesforceOAuthClient;
  let tokenVault: TokenVault;
  let orgService: OrgService;
  let authService: AuthService;

  beforeEach(() => {
    authRepo = {
      saveState: jest.fn(async () => {}),
      validateState: jest.fn(async () => true)
    };

    oauthClient = {
      buildAuthorizationUrl: jest.fn((state: string) => `https://login.salesforce.com/oauth?state=${state}`),
      exchangeCodeForToken: jest.fn(async () => ({
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_456',
        instanceUrl: 'https://example.my.salesforce.com'
      }))
    };

    tokenVault = {
      encrypt: jest.fn(async (token: string) => `encrypted_${token}`),
      decrypt: jest.fn(async (encrypted: string) => encrypted.replace('encrypted_', ''))
    };

    orgService = {
      create: jest.fn(async (input) => ({ id: 'org1', ...input, createdAt: new Date(), updatedAt: new Date() })),
      list: jest.fn(async () => []),
      getById: jest.fn(async () => null)
    } as unknown as OrgService;

    authService = new AuthService(authRepo, oauthClient, tokenVault, orgService);
  });

  describe('buildConnectionUrl', () => {
    it('generates OAuth URL and saves state', async () => {
      const userId = 'user123';
      const url = await authService.buildConnectionUrl(userId);

      expect(url).toContain('https://login.salesforce.com/oauth?state=');
      expect(authRepo.saveState).toHaveBeenCalledWith(userId, expect.any(String));
    });

    it('generates unique state for each request', async () => {
      const url1 = await authService.buildConnectionUrl('user1');
      const url2 = await authService.buildConnectionUrl('user2');

      expect(url1).not.toBe(url2);
      expect(authRepo.saveState).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleCallback', () => {
    it('exchanges code for tokens and creates org when state is valid', async () => {
      const userId = 'user123';
      const code = 'auth_code_xyz';
      const state = 'valid_state';

      await authService.handleCallback(userId, code, state);

      expect(authRepo.validateState).toHaveBeenCalledWith(userId, state);
      expect(oauthClient.exchangeCodeForToken).toHaveBeenCalledWith(code);
      expect(tokenVault.encrypt).toHaveBeenCalledWith('access_token_123');
      expect(tokenVault.encrypt).toHaveBeenCalledWith('refresh_token_456');
      expect(orgService.create).toHaveBeenCalledWith({
        name: 'Org https://example.my.salesforce.com',
        username: userId,
        instanceUrl: 'https://example.my.salesforce.com',
        encryptedAccessToken: 'encrypted_access_token_123',
        encryptedRefreshToken: 'encrypted_refresh_token_456'
      });
    });

    it('throws error when OAuth state is invalid', async () => {
      authRepo.validateState = jest.fn(async () => false);

      await expect(
        authService.handleCallback('user123', 'code', 'invalid_state')
      ).rejects.toThrow('Invalid OAuth state');

      expect(oauthClient.exchangeCodeForToken).not.toHaveBeenCalled();
      expect(orgService.create).not.toHaveBeenCalled();
    });

    it('throws error when token exchange fails', async () => {
      oauthClient.exchangeCodeForToken = jest.fn(async () => {
        throw new Error('Token exchange failed');
      });

      await expect(
        authService.handleCallback('user123', 'bad_code', 'valid_state')
      ).rejects.toThrow('Token exchange failed');

      expect(orgService.create).not.toHaveBeenCalled();
    });

    it('throws error when org creation fails', async () => {
      orgService.create = jest.fn(async () => {
        throw new Error('Database error');
      });

      await expect(
        authService.handleCallback('user123', 'code', 'valid_state')
      ).rejects.toThrow('Database error');
    });

    it('handles missing refresh token gracefully', async () => {
      oauthClient.exchangeCodeForToken = jest.fn(async () => ({
        accessToken: 'access_token_123',
        refreshToken: '',
        instanceUrl: 'https://example.my.salesforce.com'
      }));

      await authService.handleCallback('user123', 'code', 'valid_state');

      expect(tokenVault.encrypt).toHaveBeenCalledWith('');
      expect(orgService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          encryptedRefreshToken: 'encrypted_'
        })
      );
    });
  });

  describe('OAuth flow edge cases', () => {
    it('handles concurrent OAuth requests for same user', async () => {
      const userId = 'user123';

      const [url1, url2] = await Promise.all([
        authService.buildConnectionUrl(userId),
        authService.buildConnectionUrl(userId)
      ]);

      expect(url1).not.toBe(url2);
      expect(authRepo.saveState).toHaveBeenCalledTimes(2);
    });

    it('rejects callback with state from different user', async () => {
      await authService.buildConnectionUrl('user1');

      authRepo.validateState = jest.fn(async (userId, state) => userId === 'user1');

      await expect(
        authService.handleCallback('user2', 'code', 'user1_state')
      ).rejects.toThrow('Invalid OAuth state');
    });

    it('handles token vault encryption failure', async () => {
      tokenVault.encrypt = jest.fn(async () => {
        throw new Error('Encryption failed');
      });

      await expect(
        authService.handleCallback('user123', 'code', 'valid_state')
      ).rejects.toThrow('Encryption failed');
    });
  });
});
