export interface OAuthTokenSet {
  accessToken: string;
  refreshToken: string;
  instanceUrl: string;
  issuedAt: string;
}

export interface ISalesforceOAuthClient {
  buildAuthorizationUrl(state: string): string;
  exchangeCodeForToken(code: string): Promise<OAuthTokenSet>;
}

export interface TokenVault {
  encrypt(plainText: string): Promise<string>;
  decrypt(cipherText: string): Promise<string>;
}

export class PlaceholderTokenVault implements TokenVault {
  async encrypt(plainText: string): Promise<string> {
    return Buffer.from(plainText, 'utf8').toString('base64');
  }

  async decrypt(cipherText: string): Promise<string> {
    return Buffer.from(cipherText, 'base64').toString('utf8');
  }
}

export class SalesforceOAuthClient implements ISalesforceOAuthClient {
  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly redirectUri: string,
    private readonly loginUrl: string
  ) {}

  buildAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state
    });
    return `${this.loginUrl}/services/oauth2/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<OAuthTokenSet> {
    const response = await fetch(`${this.loginUrl}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri
      })
    });

    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${response.status}`);
    }

    const json = (await response.json()) as Record<string, string>;
    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      instanceUrl: json.instance_url,
      issuedAt: json.issued_at
    };
  }
}
