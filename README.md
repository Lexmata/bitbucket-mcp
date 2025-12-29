# @lexmata/bitbucket-mcp

A Model Context Protocol (MCP) server for Bitbucket Cloud, providing comprehensive access to repositories, pull requests, branches, commits, issues, pipelines, and code search.

## Features

- **Full Bitbucket Cloud API Coverage**: Access repositories, pull requests, branches, commits, issues, pipelines, and code search
- **OAuth 2.0 Authentication**: Secure authentication with automatic token refresh
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

### Option 1: Access Token (Recommended for personal use)

1. Go to Bitbucket Settings > Personal Settings > App passwords
2. Create a new app password with the required permissions:
   - Account: Read
   - Repositories: Read, Write, Admin
   - Pull requests: Read, Write
   - Issues: Read, Write
   - Pipelines: Read, Write

3. Set the environment variable:

```bash
export BITBUCKET_ACCESS_TOKEN="your-app-password"
```

### Option 2: OAuth 2.0 (Recommended for applications)

1. Go to Bitbucket Settings > Workspace Settings > OAuth consumers
2. Create a new OAuth consumer with:
   - Callback URL: `http://localhost:8080/callback` (or your callback URL)
   - Permissions: Select required scopes

3. Set the environment variables:

```bash
export BITBUCKET_CLIENT_ID="your-client-id"
export BITBUCKET_CLIENT_SECRET="your-client-secret"
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
        "BITBUCKET_ACCESS_TOKEN": "your-access-token"
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
        "BITBUCKET_ACCESS_TOKEN": "your-access-token"
      }
    }
  }
}
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
