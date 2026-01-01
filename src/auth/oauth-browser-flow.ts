import http from 'http';
import { URL } from 'url';
import { exec } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';
import type { OAuthConfig, TokenState } from '../types/index.js';

const BITBUCKET_AUTH_URL = 'https://bitbucket.org/site/oauth2/authorize';
const BITBUCKET_TOKEN_URL = 'https://bitbucket.org/site/oauth2/access_token';
const CALLBACK_PORT = 9876;
const TOKEN_FILE_PATH = join(homedir(), '.config', 'bitbucket-mcp', 'tokens.json');

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  clientId: string;
}

/**
 * Load persisted tokens from disk
 */
export function loadPersistedTokens(): StoredTokens | null {
  try {
    if (existsSync(TOKEN_FILE_PATH)) {
      const data = JSON.parse(readFileSync(TOKEN_FILE_PATH, 'utf-8')) as StoredTokens;
      return data;
    }
  } catch (error) {
    console.error('Failed to load persisted tokens:', error);
  }
  return null;
}

/**
 * Save tokens to disk for persistence
 */
export function persistTokens(tokens: StoredTokens): void {
  try {
    const dir = dirname(TOKEN_FILE_PATH);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(TOKEN_FILE_PATH, JSON.stringify(tokens, null, 2), { mode: 0o600 });
    console.error('Tokens persisted to', TOKEN_FILE_PATH);
  } catch (error) {
    console.error('Failed to persist tokens:', error);
  }
}

/**
 * Open a URL in the default browser
 */
function openBrowser(url: string): void {
  const cmd =
    process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';

  exec(`${cmd} "${url}"`, (err) => {
    if (err) {
      console.error('Could not open browser automatically.');
      console.error('Please open this URL manually:', url);
    }
  });
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const response = await fetch(BITBUCKET_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
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

  return response.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>;
}

/**
 * Start the OAuth browser flow
 * Returns a promise that resolves with the token state
 */
export function startOAuthBrowserFlow(config: OAuthConfig): Promise<TokenState> {
  return new Promise((resolve, reject) => {
    if (!config.clientId || !config.clientSecret) {
      reject(
        new Error(
          'OAuth requires BITBUCKET_CLIENT_ID and BITBUCKET_CLIENT_SECRET.\n' +
            'Create an OAuth consumer at: https://bitbucket.org/<workspace>/workspace/settings/oauth-consumers\n' +
            'Set callback URL to: http://localhost:9876/callback'
        )
      );
      return;
    }

    let server: http.Server | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (server) {
        server.close();
        server = null;
      }
    };

    server = http.createServer((req, res) => {
      const url = new URL(req.url ?? '/', `http://localhost:${CALLBACK_PORT}`);

      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const errorParam = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        if (errorParam) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>Authentication Failed</title></head>
              <body style="font-family: system-ui; padding: 40px; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #dc3545;">✗ Authentication Failed</h1>
                <p><strong>Error:</strong> ${errorParam}</p>
                ${errorDescription ? `<p>${errorDescription}</p>` : ''}
                <p>You can close this window.</p>
              </body>
            </html>
          `);
          cleanup();
          reject(new Error(`OAuth error: ${errorParam} - ${errorDescription ?? ''}`));
          return;
        }

        if (code) {
          console.error('Received authorization code, exchanging for tokens...');
          exchangeCodeForToken(code, config.clientId, config.clientSecret)
            .then((tokens) => {
              const tokenState: TokenState = {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: Date.now() + tokens.expires_in * 1000,
              };

              // Persist tokens for future use
              persistTokens({
                ...tokenState,
                clientId: config.clientId,
              });

              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(`
                <html>
                  <head><title>Success!</title></head>
                  <body style="font-family: system-ui; padding: 40px; max-width: 600px; margin: 0 auto; text-align: center;">
                    <h1 style="color: #28a745;">✓ Authentication Successful!</h1>
                    <p>You are now connected to Bitbucket.</p>
                    <p style="color: #666;">You can close this window and return to Cursor.</p>
                    <script>setTimeout(() => window.close(), 3000);</script>
                  </body>
                </html>
              `);

              cleanup();
              resolve(tokenState);
            })
            .catch((err: unknown) => {
              res.writeHead(500, { 'Content-Type': 'text/html' });
              res.end(`
                <html>
                  <head><title>Error</title></head>
                  <body style="font-family: system-ui; padding: 40px;">
                    <h1 style="color: #dc3545;">Error</h1>
                    <p>${err instanceof Error ? err.message : 'Unknown error'}</p>
                  </body>
                </html>
              `);
              cleanup();
              reject(err instanceof Error ? err : new Error(String(err)));
            });
        }
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.on('error', (err) => {
      cleanup();
      reject(new Error(`Failed to start OAuth callback server: ${err.message}`));
    });

    server.listen(CALLBACK_PORT, () => {
      const authUrl = `${BITBUCKET_AUTH_URL}?client_id=${config.clientId}&response_type=code`;

      console.error('\n' + '='.repeat(60));
      console.error('BITBUCKET AUTHENTICATION REQUIRED');
      console.error('='.repeat(60));
      console.error('\nOpening browser for authentication...');
      console.error('If the browser does not open, visit this URL:');
      console.error(authUrl);
      console.error('='.repeat(60) + '\n');

      openBrowser(authUrl);
    });

    // Timeout after 5 minutes
    timeoutId = setTimeout(
      () => {
        cleanup();
        reject(new Error('OAuth flow timed out after 5 minutes'));
      },
      5 * 60 * 1000
    );
  });
}

/**
 * Check if tokens need refresh and attempt to refresh them
 */
export async function refreshTokensIfNeeded(
  tokenState: TokenState,
  config: OAuthConfig
): Promise<TokenState> {
  const expiresIn = tokenState.expiresAt - Date.now();

  // Refresh if token expires in less than 5 minutes
  if (expiresIn > 5 * 60 * 1000) {
    return tokenState;
  }

  if (!tokenState.refreshToken) {
    throw new Error('Token expired and no refresh token available');
  }

  console.error('Access token expiring soon, refreshing...');

  const response = await fetch(BITBUCKET_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenState.refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  const newTokenState: TokenState = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  // Persist refreshed tokens
  persistTokens({
    ...newTokenState,
    clientId: config.clientId,
  });

  console.error('Tokens refreshed successfully');
  return newTokenState;
}
