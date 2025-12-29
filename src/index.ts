#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { BitbucketOAuth } from './auth/oauth.js';
import { BitbucketClient } from './api/client.js';
import { ToolHandler, toolDefinitions } from './tools/index.js';
import { ResourceHandler } from './resources/index.js';

// Environment variable configuration
const config = {
  clientId: process.env.BITBUCKET_CLIENT_ID ?? '',
  clientSecret: process.env.BITBUCKET_CLIENT_SECRET ?? '',
  accessToken: process.env.BITBUCKET_ACCESS_TOKEN,
  refreshToken: process.env.BITBUCKET_REFRESH_TOKEN,
};

// Validate configuration
function validateConfig(): void {
  // If access token is provided, we can work without OAuth credentials
  if (config.accessToken) {
    return;
  }

  // Otherwise, we need OAuth credentials
  if (!config.clientId || !config.clientSecret) {
    console.error('Error: Missing required configuration.');
    console.error('');
    console.error('Please set one of the following:');
    console.error('  1. BITBUCKET_ACCESS_TOKEN (for direct token auth)');
    console.error('  2. BITBUCKET_CLIENT_ID and BITBUCKET_CLIENT_SECRET (for OAuth)');
    console.error('');
    console.error('See README.md for setup instructions.');
    process.exit(1);
  }
}

// Create and start the MCP server
async function main(): Promise<void> {
  validateConfig();

  // Initialize OAuth and client
  const oauth = new BitbucketOAuth(config);
  const client = new BitbucketClient(oauth);
  const toolHandler = new ToolHandler(client);
  const resourceHandler = new ResourceHandler(client);

  // Create MCP server
  const server = new Server(
    {
      name: 'bitbucket-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, () => {
    return Promise.resolve({
      tools: toolDefinitions,
    });
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const result = await toolHandler.handleTool(name, args ?? {});
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${message}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Handle resource template listing
  server.setRequestHandler(ListResourceTemplatesRequestSchema, () => {
    return Promise.resolve({
      resourceTemplates: resourceHandler.listResourceTemplates(),
    });
  });

  // Handle resource listing (empty since resources are dynamic)
  server.setRequestHandler(ListResourcesRequestSchema, () => {
    return Promise.resolve({
      resources: [],
    });
  });

  // Handle resource reading
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    try {
      return await resourceHandler.readResource(uri);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to read resource: ${message}`);
    }
  });

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr so it doesn't interfere with MCP protocol
  console.error('Bitbucket MCP server started');
}

// Run the server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
