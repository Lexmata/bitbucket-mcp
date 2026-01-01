# @lexmata/bitbucket-mcp

[![npm version](https://img.shields.io/npm/v/@lexmata/bitbucket-mcp.svg)](https://www.npmjs.com/package/@lexmata/bitbucket-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![GitHub stars](https://img.shields.io/github/stars/lexmata/bitbucket-mcp.svg?style=social)](https://github.com/lexmata/bitbucket-mcp)

A Model Context Protocol (MCP) server for Bitbucket Cloud - 25+ tools for repositories, pull requests, branches, commits, issues, pipelines, and code search.

## Features

- **Full Bitbucket Cloud API Coverage**: Access repositories, pull requests, branches, commits, issues, pipelines, and code search
- **OAuth 2.0 Authentication**: Secure authentication with automatic browser-based sign-in and token refresh
- **App Password Support**: Alternative authentication using Bitbucket App Passwords
- **MCP Tools**: 25+ tools for interacting with Bitbucket
- **MCP Resources**: Access repositories, pull requests, and files as resources
- **TypeScript**: Fully typed for reliability and developer experience

## Installation

```bash
# Using npm
npm install -g @lexmata/bitbucket-mcp

# Using pnpm
pnpm add -g @lexmata/bitbucket-mcp

# Using yarn
yarn global add @lexmata/bitbucket-mcp
```

## Configuration

### Option 1: OAuth 2.0 (Recommended)

OAuth provides the best experience with automatic browser-based authentication and token refresh.

#### Step 1: Create an OAuth Consumer

1. Go to your Bitbucket workspace: `https://bitbucket.org/{workspace}/workspace/settings/oauth-consumers`
2. Click **"Add consumer"**
3. Fill in:
   - **Name**: `MCP Server` (or any name)
   - **Callback URL**: `http://localhost:9876/callback` (required)
   - **Permissions**: Select the following:
     - Account: Read
     - Repositories: Read, Write, Admin
     - Pull requests: Read, Write
     - Issues: Read, Write
     - Pipelines: Read, Write
4. Click **Save** and note the **Key** (Client ID) and **Secret** (Client Secret)

#### Step 2: Run the OAuth Flow

Use the included helper script to authenticate:

```bash
# From the project directory
node scripts/oauth-flow.js "YOUR_CLIENT_ID" "YOUR_CLIENT_SECRET"
```

This will:

1. Start a local callback server on port 9876
2. Open your browser to Bitbucket's authorization page
3. After you authorize, display the configuration to add to your MCP config

#### Step 3: Configure Your MCP Client

Add the output configuration to your MCP client config file.

### Option 2: App Password (Simple setup)

For personal use without OAuth setup:

1. Go to Bitbucket: **Personal Settings** → **App passwords**
2. Click **Create app password**
3. Give it a name and select permissions:
   - Account: Read
   - Repositories: Read, Write, Admin
   - Pull requests: Read, Write
   - Issues: Read, Write
   - Pipelines: Read, Write
4. Copy the generated password

Configure with your Bitbucket username and the app password:

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "npx",
      "args": ["@lexmata/bitbucket-mcp"],
      "env": {
        "BITBUCKET_USERNAME": "your-username",
        "BITBUCKET_ACCESS_TOKEN": "your-app-password"
      }
    }
  }
}
```

## Usage with Cursor IDE

Add the following to your Cursor MCP configuration file:

**Linux**: `~/.cursor/mcp.json`
**macOS**: `~/.cursor/mcp.json`
**Windows**: `%USERPROFILE%\.cursor\mcp.json`

### With OAuth (Recommended)

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "npx",
      "args": ["@lexmata/bitbucket-mcp"],
      "env": {
        "BITBUCKET_CLIENT_ID": "your-client-id",
        "BITBUCKET_CLIENT_SECRET": "your-client-secret",
        "BITBUCKET_ACCESS_TOKEN": "your-access-token",
        "BITBUCKET_REFRESH_TOKEN": "your-refresh-token"
      }
    }
  }
}
```

When tokens expire, the server will automatically refresh them using the refresh token. If refresh fails, a browser window will open for re-authentication.

### With App Password

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "npx",
      "args": ["@lexmata/bitbucket-mcp"],
      "env": {
        "BITBUCKET_USERNAME": "your-username",
        "BITBUCKET_ACCESS_TOKEN": "your-app-password"
      }
    }
  }
}
```

## Usage with Claude Desktop

Add the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "npx",
      "args": ["@lexmata/bitbucket-mcp"],
      "env": {
        "BITBUCKET_CLIENT_ID": "your-client-id",
        "BITBUCKET_CLIENT_SECRET": "your-client-secret",
        "BITBUCKET_ACCESS_TOKEN": "your-access-token",
        "BITBUCKET_REFRESH_TOKEN": "your-refresh-token"
      }
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "bitbucket": {
      "command": "bitbucket-mcp",
      "env": {
        "BITBUCKET_USERNAME": "your-username",
        "BITBUCKET_ACCESS_TOKEN": "your-app-password"
      }
    }
  }
}
```

## Environment Variables

| Variable                  | Description                        | Required         |
| ------------------------- | ---------------------------------- | ---------------- |
| `BITBUCKET_CLIENT_ID`     | OAuth consumer key                 | For OAuth        |
| `BITBUCKET_CLIENT_SECRET` | OAuth consumer secret              | For OAuth        |
| `BITBUCKET_ACCESS_TOKEN`  | OAuth access token or App password | Yes              |
| `BITBUCKET_REFRESH_TOKEN` | OAuth refresh token                | For OAuth        |
| `BITBUCKET_USERNAME`      | Bitbucket username                 | For App Password |

## Token Management

### OAuth Tokens

- **Access tokens** expire after 2 hours
- **Refresh tokens** are used to automatically obtain new access tokens
- Tokens are persisted to `~/.config/bitbucket-mcp/tokens.json`
- If tokens expire and refresh fails, the browser will automatically open for re-authentication

### Re-authenticating

If you need to re-authenticate manually:

```bash
node scripts/oauth-flow.js "YOUR_CLIENT_ID" "YOUR_CLIENT_SECRET"
```

Or delete the token file to trigger re-authentication:

```bash
rm ~/.config/bitbucket-mcp/tokens.json
```

## Available Tools

### Repository Management

| Tool                    | Description                          |
| ----------------------- | ------------------------------------ |
| `list_repositories`     | List repositories in a workspace     |
| `get_repository`        | Get details of a specific repository |
| `create_repository`     | Create a new repository              |
| `delete_repository`     | Delete a repository                  |
| `list_repository_forks` | List all forks of a repository       |

### Pull Requests

| Tool                   | Description                                |
| ---------------------- | ------------------------------------------ |
| `list_pull_requests`   | List pull requests with optional filtering |
| `get_pull_request`     | Get details of a specific pull request     |
| `create_pull_request`  | Create a new pull request                  |
| `update_pull_request`  | Update a pull request                      |
| `merge_pull_request`   | Merge a pull request                       |
| `decline_pull_request` | Decline a pull request                     |
| `approve_pull_request` | Approve a pull request                     |
| `request_changes`      | Request changes on a pull request          |
| `list_pr_comments`     | List comments on a pull request            |
| `add_pr_comment`       | Add a comment to a pull request            |
| `get_pr_diff`          | Get the diff for a pull request            |

### Branches

| Tool            | Description                      |
| --------------- | -------------------------------- |
| `list_branches` | List branches in a repository    |
| `get_branch`    | Get details of a specific branch |
| `create_branch` | Create a new branch              |
| `delete_branch` | Delete a branch                  |

### Commits

| Tool              | Description                          |
| ----------------- | ------------------------------------ |
| `list_commits`    | List commits with optional filtering |
| `get_commit`      | Get details of a specific commit     |
| `get_commit_diff` | Get the diff for a commit            |

### Issues

| Tool           | Description                     |
| -------------- | ------------------------------- |
| `list_issues`  | List issues in a repository     |
| `get_issue`    | Get details of a specific issue |
| `create_issue` | Create a new issue              |
| `update_issue` | Update an issue                 |
| `delete_issue` | Delete an issue                 |

### Pipelines

| Tool               | Description                   |
| ------------------ | ----------------------------- |
| `list_pipelines`   | List pipeline runs            |
| `get_pipeline`     | Get details of a pipeline run |
| `trigger_pipeline` | Trigger a new pipeline run    |
| `stop_pipeline`    | Stop a running pipeline       |

### Code Search

| Tool          | Description                     |
| ------------- | ------------------------------- |
| `search_code` | Search code across repositories |

### Files

| Tool               | Description               |
| ------------------ | ------------------------- |
| `get_file_content` | Get the content of a file |

## Resources

The server provides the following resource types:

| Resource URI                                      | Description            |
| ------------------------------------------------- | ---------------------- |
| `bitbucket://repository/{workspace}/{repo}`       | Repository information |
| `bitbucket://pullrequest/{workspace}/{repo}/{id}` | Pull request details   |
| `bitbucket://file/{workspace}/{repo}/{path}`      | File contents          |

## Examples

### List repositories in a workspace

```
Use the list_repositories tool with workspace "my-workspace"
```

### Create a pull request

```
Use the create_pull_request tool with:
- workspace: "my-workspace"
- repo_slug: "my-repo"
- title: "Add new feature"
- source_branch: "feature/new-feature"
- destination_branch: "main"
- description: "This PR adds a new feature"
```

### Search for code

```
Use the search_code tool with:
- workspace: "my-workspace"
- search_query: "function handleError"
```

### Trigger a pipeline

```
Use the trigger_pipeline tool with:
- workspace: "my-workspace"
- repo_slug: "my-repo"
- ref_type: "branch"
- ref_name: "main"
```

## Development

### Prerequisites

- Node.js 18+
- pnpm 9+

### Setup

```bash
# Clone the repository
git clone https://github.com/lexmata/bitbucket-mcp.git
cd bitbucket-mcp

# Install dependencies
pnpm install

# Build
pnpm build

# Run in development mode
pnpm dev
```

### Scripts

| Script              | Description                  |
| ------------------- | ---------------------------- |
| `pnpm build`        | Build the project with SWC   |
| `pnpm dev`          | Run in development mode      |
| `pnpm start`        | Run the built server         |
| `pnpm typecheck`    | Run TypeScript type checking |
| `pnpm lint`         | Run ESLint                   |
| `pnpm lint:fix`     | Fix ESLint issues            |
| `pnpm format`       | Format code with Prettier    |
| `pnpm format:check` | Check code formatting        |

### OAuth Flow Helper

The `scripts/oauth-flow.js` script provides a convenient way to authenticate:

```bash
node scripts/oauth-flow.js "CLIENT_ID" "CLIENT_SECRET"
```

This script:

1. Starts a local HTTP server on port 9876
2. Opens your browser to Bitbucket's authorization page
3. Handles the OAuth callback
4. Displays the complete MCP configuration with tokens

## Troubleshooting

### "Port 9876 is already in use"

Another process is using the OAuth callback port. Either:

- Close the other application using port 9876
- Wait a moment and try again (previous OAuth attempt may still be running)

```bash
# Find and kill the process using port 9876
lsof -ti:9876 | xargs kill -9
```

### "localhost:9876 returned not found"

The OAuth callback URL in your Bitbucket consumer is incorrect. Make sure it's set to:

```
http://localhost:9876/callback
```

### "Token is invalid or expired"

Your access token has expired. The server will automatically:

1. Try to refresh using the refresh token
2. If that fails, open the browser for re-authentication

To manually re-authenticate:

```bash
node scripts/oauth-flow.js "YOUR_CLIENT_ID" "YOUR_CLIENT_SECRET"
```

### "Authentication failed (401)"

Check that:

1. Your OAuth consumer has the correct permissions
2. Your app password (if using) has the required scopes
3. For app passwords, ensure `BITBUCKET_USERNAME` is set

### Server not loading in Cursor

1. Verify your `~/.cursor/mcp.json` syntax is valid JSON
2. Restart Cursor or reload the window
3. Check the MCP server logs for errors

## License

MIT License - Copyright (c) 2025 Lexmata LLC

See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- [Documentation](https://lexmata.github.io/bitbucket-mcp)
- [Issues](https://github.com/lexmata/bitbucket-mcp/issues)
