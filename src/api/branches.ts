import type { BitbucketClient } from './client.js';
import type {
  BitbucketBranch,
  PaginatedResponse,
  ListBranchesParams,
  CreateBranchParams,
} from '../types/index.js';

export class BranchesAPI {
  constructor(private client: BitbucketClient) {}

  /**
   * List branches for a repository
   */
  async list(params: ListBranchesParams): Promise<PaginatedResponse<BitbucketBranch>> {
    const { workspace, repo_slug, ...queryParams } = params;
    return this.client.get<PaginatedResponse<BitbucketBranch>>(
      `/repositories/${workspace}/${repo_slug}/refs/branches`,
      queryParams as Record<string, string | number | undefined>
    );
  }

  /**
   * Get a specific branch
   */
  async get(workspace: string, repo_slug: string, branch_name: string): Promise<BitbucketBranch> {
    return this.client.get<BitbucketBranch>(
      `/repositories/${workspace}/${repo_slug}/refs/branches/${encodeURIComponent(branch_name)}`
    );
  }

  /**
   * Create a new branch
   */
  async create(params: CreateBranchParams): Promise<BitbucketBranch> {
    const { workspace, repo_slug, name, target } = params;
    return this.client.post<BitbucketBranch>(
      `/repositories/${workspace}/${repo_slug}/refs/branches`,
      {
        name,
        target: { hash: target },
      }
    );
  }

  /**
   * Delete a branch
   */
  async delete(workspace: string, repo_slug: string, branch_name: string): Promise<void> {
    await this.client.delete(
      `/repositories/${workspace}/${repo_slug}/refs/branches/${encodeURIComponent(branch_name)}`
    );
  }
}
