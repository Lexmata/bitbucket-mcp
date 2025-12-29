import type { BitbucketClient } from '../api/client.js';
import { RepositoriesAPI } from '../api/repositories.js';
import { PullRequestsAPI } from '../api/pullrequests.js';

// Resource URI templates
export const resourceTemplates = [
  {
    uriTemplate: 'bitbucket://repository/{workspace}/{repo_slug}',
    name: 'Repository',
    description: 'A Bitbucket repository with its metadata, branches, and settings',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'bitbucket://pullrequest/{workspace}/{repo_slug}/{pr_id}',
    name: 'Pull Request',
    description: 'A Bitbucket pull request with its details, comments, and diff',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'bitbucket://file/{workspace}/{repo_slug}/{path}',
    name: 'File',
    description: 'A file from a Bitbucket repository',
    mimeType: 'text/plain',
  },
];

// Resource handler class
export class ResourceHandler {
  private repos: RepositoriesAPI;
  private prs: PullRequestsAPI;

  constructor(client: BitbucketClient) {
    this.repos = new RepositoriesAPI(client);
    this.prs = new PullRequestsAPI(client);
  }

  /**
   * Parse a resource URI into its components
   */
  parseUri(uri: string): { type: string; params: Record<string, string> } | null {
    // Repository: bitbucket://repository/{workspace}/{repo_slug}
    const repoMatch = uri.match(/^bitbucket:\/\/repository\/([^/]+)\/([^/]+)$/);
    if (repoMatch) {
      return {
        type: 'repository',
        params: {
          workspace: repoMatch[1],
          repo_slug: repoMatch[2],
        },
      };
    }

    // Pull Request: bitbucket://pullrequest/{workspace}/{repo_slug}/{pr_id}
    const prMatch = uri.match(/^bitbucket:\/\/pullrequest\/([^/]+)\/([^/]+)\/(\d+)$/);
    if (prMatch) {
      return {
        type: 'pullrequest',
        params: {
          workspace: prMatch[1],
          repo_slug: prMatch[2],
          pr_id: prMatch[3],
        },
      };
    }

    // File: bitbucket://file/{workspace}/{repo_slug}/{path}
    const fileMatch = uri.match(/^bitbucket:\/\/file\/([^/]+)\/([^/]+)\/(.+)$/);
    if (fileMatch) {
      return {
        type: 'file',
        params: {
          workspace: fileMatch[1],
          repo_slug: fileMatch[2],
          path: fileMatch[3],
        },
      };
    }

    return null;
  }

  /**
   * Read a resource by URI
   */
  async readResource(
    uri: string
  ): Promise<{ contents: Array<{ uri: string; mimeType: string; text: string }> }> {
    const parsed = this.parseUri(uri);
    if (!parsed) {
      throw new Error(`Invalid resource URI: ${uri}`);
    }

    switch (parsed.type) {
      case 'repository': {
        const repo = await this.repos.get({
          workspace: parsed.params.workspace,
          repo_slug: parsed.params.repo_slug,
        });
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(repo, null, 2),
            },
          ],
        };
      }

      case 'pullrequest': {
        const pr = await this.prs.get(
          parsed.params.workspace,
          parsed.params.repo_slug,
          parseInt(parsed.params.pr_id, 10)
        );
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(pr, null, 2),
            },
          ],
        };
      }

      case 'file': {
        const content = await this.repos.getFileContent(
          parsed.params.workspace,
          parsed.params.repo_slug,
          parsed.params.path
        );
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: content,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown resource type: ${parsed.type}`);
    }
  }

  /**
   * List available resources (returns templates since actual resources are dynamic)
   */
  listResourceTemplates() {
    return resourceTemplates;
  }
}
