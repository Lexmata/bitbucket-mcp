#!/usr/bin/env node

/**
 * Bitbucket OAuth Flow Helper
 *
 * Usage:
 *   node scripts/oauth-flow.js <client_id> <client_secret>
 *
 * This script will:
 * 1. Start a local server to handle the OAuth callback
 * 2. Open the authorization URL in your browser
 * 3. Exchange the authorization code for tokens
 * 4. Print the access token and refresh token
 */

import http from 'http';
import { URL } from 'url';

const BITBUCKET_AUTH_URL = 'https://bitbucket.org/site/oauth2/authorize';
const BITBUCKET_TOKEN_URL = 'https://bitbucket.org/site/oauth2/access_token';
const CALLBACK_PORT = 9876;

const clientId = process.argv[2];
const clientSecret = process.argv[3];

if (!clientId || !clientSecret) {
  console.error('Usage: node scripts/oauth-flow.js <client_id> <client_secret>');
  console.error('');
  console.error('Get your OAuth credentials from:');
  console.error('https://bitbucket.org/<workspace>/workspace/settings/oauth-consumers');
  process.exit(1);
}

async function exchangeCodeForToken(code) {
  const response = await fetch(BITBUCKET_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
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

  return response.json();
}

// Create server to handle callback
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${CALLBACK_PORT}`);

  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h1>Error</h1><p>${error}</p>`);
      console.error('OAuth error:', error);
      server.close();
      process.exit(1);
    }

    if (code) {
      try {
        console.log('\nReceived authorization code, exchanging for tokens...');
        const tokens = await exchangeCodeForToken(code);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>Success!</title></head>
            <body style="font-family: system-ui; padding: 40px; max-width: 800px; margin: 0 auto;">
              <h1 style="color: green;">✓ Authentication Successful!</h1>
              <p>You can close this window and return to the terminal.</p>
            </body>
          </html>
        `);

        console.log('\n' + '='.repeat(60));
        console.log('SUCCESS! OAuth tokens received.');
        console.log('='.repeat(60));
        console.log('\nAdd these to your ~/.cursor/mcp.json:\n');
        console.log(JSON.stringify({
          "bitbucket": {
            "command": "node",
            "args": ["/home/joseph/Lexmata/bitbucket-mcp/dist/index.js"],
            "env": {
              "BITBUCKET_CLIENT_ID": clientId,
              "BITBUCKET_CLIENT_SECRET": clientSecret,
              "BITBUCKET_ACCESS_TOKEN": tokens.access_token,
              "BITBUCKET_REFRESH_TOKEN": tokens.refresh_token
            }
          }
        }, null, 2));
        console.log('\n' + '='.repeat(60));
        console.log('\nAccess Token (expires in ' + tokens.expires_in + ' seconds):');
        console.log(tokens.access_token);
        console.log('\nRefresh Token (use to get new access tokens):');
        console.log(tokens.refresh_token);
        console.log('='.repeat(60));

        setTimeout(() => {
          server.close();
          process.exit(0);
        }, 1000);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>Error</h1><p>${err.message}</p>`);
        console.error('Error exchanging code:', err.message);
        server.close();
        process.exit(1);
      }
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(CALLBACK_PORT, () => {
  const authUrl = `${BITBUCKET_AUTH_URL}?client_id=${clientId}&response_type=code`;

  console.log('='.repeat(60));
  console.log('Bitbucket OAuth Flow');
  console.log('='.repeat(60));
  console.log('\nCallback server listening on port', CALLBACK_PORT);
  console.log('\nOpen this URL in your browser to authorize:\n');
  console.log(authUrl);
  console.log('\n' + '='.repeat(60));
  console.log('Waiting for authorization...');

  // Try to open browser automatically
  import('child_process').then(({ exec }) => {
    const cmd = process.platform === 'darwin' ? 'open' :
                process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${cmd} "${authUrl}"`, (err) => {
      if (err) {
        console.log('(Could not open browser automatically, please open the URL manually)');
      }
    });
  });
});

// Timeout after 5 minutes
setTimeout(() => {
  console.error('\nTimeout waiting for authorization. Please try again.');
  server.close();
  process.exit(1);
}, 5 * 60 * 1000);
