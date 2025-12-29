import type { BitbucketClient } from './client.js';
import type { BitbucketCommit, PaginatedResponse, ListCommitsParams } from '../types/index.js';

export class CommitsAPI {
  constructor(private client: BitbucketClient) {}

  /**
   * List commits for a repository
   */
  async list(params: ListCommitsParams): Promise<PaginatedResponse<BitbucketCommit>> {
    const { workspace, repo_slug, branch, include, exclude, ...queryParams } = params;

    // Build query params
    const allParams: Record<string, string | number | undefined> = {
      ...queryParams,
    };

    // For branch filtering, use the include parameter
    if (branch) {
      allParams.include = branch;
    } else if (include) {
      allParams.include = include;
    }

    if (exclude) {
      allParams.exclude = exclude;
    }

    return this.client.get<PaginatedResponse<BitbucketCommit>>(
      `/repositories/${workspace}/${repo_slug}/commits`,
      allParams
    );
  }

  /**
   * Get a specific commit
   */
  async get(workspace: string, repo_slug: string, commit_hash: string): Promise<BitbucketCommit> {
    return this.client.get<BitbucketCommit>(
      `/repositories/${workspace}/${repo_slug}/commit/${commit_hash}`
    );
  }

  /**
   * Get diff for a specific commit
   */
  async getDiff(workspace: string, repo_slug: string, commit_hash: string): Promise<string> {
    return this.client.getRaw(`/repositories/${workspace}/${repo_slug}/diff/${commit_hash}`);
  }

  /**
   * Get commits for a pull request
   */
  async listForPullRequest(
    workspace: string,
    repo_slug: string,
    pr_id: number,
    params?: { page?: number; pagelen?: number }
  ): Promise<PaginatedResponse<BitbucketCommit>> {
    return this.client.get<PaginatedResponse<BitbucketCommit>>(
      `/repositories/${workspace}/${repo_slug}/pullrequests/${pr_id}/commits`,
      params as Record<string, string | number | undefined>
    );
  }
}
