import type { OAuthConfig, OAuthTokenResponse, TokenState } from '../types/index.js';
import { startOAuthBrowserFlow, loadPersistedTokens, persistTokens } from './oauth-browser-flow.js';

const BITBUCKET_AUTH_URL = 'https://bitbucket.org/site/oauth2/authorize';
const BITBUCKET_TOKEN_URL = 'https://bitbucket.org/site/oauth2/access_token';

export class BitbucketOAuth {
  private config: OAuthConfig;
  private tokenState: TokenState | null = null;
  private useBasicAuth: boolean = false;
  private authInProgress: Promise<TokenState> | null = null;

  constructor(config: OAuthConfig) {
    this.config = config;

    // Determine auth method: if username is provided, use Basic auth (app passwords)
    // Otherwise use Bearer token (OAuth)
    if (config.username && config.accessToken) {
      this.useBasicAuth = true;
      this.tokenState = {
        accessToken: config.accessToken,
        refreshToken: '',
        expiresAt: Date.now() + 365 * 24 * 3600 * 1000, // App passwords don't expire
      };
    } else if (config.accessToken) {
      // Bearer token mode (OAuth access token provided via env)
      this.tokenState = {
        accessToken: config.accessToken,
        refreshToken: config.refreshToken ?? '',
        expiresAt: Date.now() + 3600 * 1000, // Assume 1 hour if not known
      };
    } else {
      // Try to load persisted tokens
      const persisted = loadPersistedTokens();
      if (persisted && persisted.clientId === config.clientId) {
        console.error('Loaded persisted OAuth tokens');
        this.tokenState = {
          accessToken: persisted.accessToken,
          refreshToken: persisted.refreshToken,
          expiresAt: persisted.expiresAt,
        };
      }
    }
  }

  /**
   * Check if using Basic auth (app passwords)
   */
  isBasicAuth(): boolean {
    return this.useBasicAuth;
  }

  /**
   * Get the username for Basic auth
   */
  getUsername(): string | undefined {
    return this.config.username;
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

    // Persist refreshed tokens
    persistTokens({
      ...this.tokenState,
      clientId: this.config.clientId,
    });

    return this.tokenState;
  }

  /**
   * Initiate OAuth browser flow for authentication
   */
  async initiateOAuthFlow(): Promise<TokenState> {
    // Prevent multiple simultaneous auth flows
    if (this.authInProgress) {
      return this.authInProgress;
    }

    this.authInProgress = startOAuthBrowserFlow(this.config)
      .then((tokenState) => {
        this.tokenState = tokenState;
        this.authInProgress = null;
        return tokenState;
      })
      .catch((error) => {
        this.authInProgress = null;
        throw error;
      });

    return this.authInProgress;
  }

  /**
   * Get a valid access token, initiating OAuth flow if needed
   */
  async getAccessToken(): Promise<string> {
    // If no token state, try OAuth browser flow
    if (!this.tokenState) {
      if (this.config.clientId && this.config.clientSecret) {
        console.error('No authentication tokens found, initiating OAuth flow...');
        await this.initiateOAuthFlow();
      } else {
        throw new Error(
          'Not authenticated. Please set one of:\n' +
            '  1. BITBUCKET_ACCESS_TOKEN (for direct token auth)\n' +
            '  2. BITBUCKET_USERNAME + BITBUCKET_TOKEN (for app password auth)\n' +
            '  3. BITBUCKET_CLIENT_ID + BITBUCKET_CLIENT_SECRET (for OAuth)\n'
        );
      }
    }

    // Refresh if token expires in less than 5 minutes
    const expiresIn = this.tokenState!.expiresAt - Date.now();
    if (expiresIn < 5 * 60 * 1000) {
      if (this.tokenState!.refreshToken && this.config.clientId && this.config.clientSecret) {
        try {
          await this.refreshAccessToken();
        } catch {
          console.error('Failed to refresh token, initiating new OAuth flow...');
          await this.initiateOAuthFlow();
        }
      } else if (this.config.clientId && this.config.clientSecret) {
        // No refresh token, need new auth
        console.error('Token expired, initiating new OAuth flow...');
        await this.initiateOAuthFlow();
      }
    }

    return this.tokenState!.accessToken;
  }

  /**
   * Check if currently authenticated
   */
  isAuthenticated(): boolean {
    return this.tokenState !== null;
  }

  /**
   * Check if OAuth credentials are configured
   */
  hasOAuthCredentials(): boolean {
    return !!(this.config.clientId && this.config.clientSecret);
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
