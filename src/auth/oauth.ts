import type { OAuthConfig, OAuthTokenResponse, TokenState } from '../types/index.js';

const BITBUCKET_AUTH_URL = 'https://bitbucket.org/site/oauth2/authorize';
const BITBUCKET_TOKEN_URL = 'https://bitbucket.org/site/oauth2/access_token';

export class BitbucketOAuth {
  private config: OAuthConfig;
  private tokenState: TokenState | null = null;

  constructor(config: OAuthConfig) {
    this.config = config;

    // Initialize with pre-configured tokens if provided
    if (config.accessToken) {
      this.tokenState = {
        accessToken: config.accessToken,
        refreshToken: config.refreshToken ?? '',
        expiresAt: Date.now() + 3600 * 1000, // Assume 1 hour if not known
      };
    }
  }

  /**
   * Generate the authorization URL for OAuth flow
   */
  getAuthorizationUrl(
    scopes: string[] = ['repository', 'pullrequest', 'issue', 'pipeline']
  ): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      scope: scopes.join(' '),
    });

    return `${BITBUCKET_AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<TokenState> {
    const response = await fetch(BITBUCKET_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    const data = (await response.json()) as OAuthTokenResponse;

    this.tokenState = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    return this.tokenState;
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshAccessToken(): Promise<TokenState> {
    if (!this.tokenState?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(BITBUCKET_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.tokenState.refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    const data = (await response.json()) as OAuthTokenResponse;

    this.tokenState = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    return this.tokenState;
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    if (!this.tokenState) {
      throw new Error('Not authenticated. Please complete OAuth flow first.');
    }

    // Refresh if token expires in less than 5 minutes
    const expiresIn = this.tokenState.expiresAt - Date.now();
    if (expiresIn < 5 * 60 * 1000 && this.tokenState.refreshToken) {
      await this.refreshAccessToken();
    }

    return this.tokenState.accessToken;
  }

  /**
   * Check if currently authenticated
   */
  isAuthenticated(): boolean {
    return this.tokenState !== null;
  }

  /**
   * Set token state directly (for restoration from storage)
   */
  setTokenState(state: TokenState): void {
    this.tokenState = state;
  }

  /**
   * Get current token state (for persistence)
   */
  getTokenState(): TokenState | null {
    return this.tokenState;
  }

  /**
   * Clear authentication state
   */
  clearAuth(): void {
    this.tokenState = null;
  }
}
