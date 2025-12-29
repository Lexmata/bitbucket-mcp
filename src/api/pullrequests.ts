import type { BitbucketClient } from './client.js';
import type {
  BitbucketPullRequest,
  BitbucketPRComment,
  PaginatedResponse,
  ListPullRequestsParams,
  CreatePullRequestParams,
} from '../types/index.js';

export class PullRequestsAPI {
  constructor(private client: BitbucketClient) {}

  /**
   * List pull requests for a repository
   */
  async list(params: ListPullRequestsParams): Promise<PaginatedResponse<BitbucketPullRequest>> {
    const { workspace, repo_slug, ...queryParams } = params;
    return this.client.get<PaginatedResponse<BitbucketPullRequest>>(
      `/repositories/${workspace}/${repo_slug}/pullrequests`,
      queryParams as Record<string, string | number | undefined>
    );
  }

  /**
   * Get a specific pull request
   */
  async get(workspace: string, repo_slug: string, pr_id: number): Promise<BitbucketPullRequest> {
    return this.client.get<BitbucketPullRequest>(
      `/repositories/${workspace}/${repo_slug}/pullrequests/${pr_id}`
    );
  }

  /**
   * Create a new pull request
   */
  async create(params: CreatePullRequestParams): Promise<BitbucketPullRequest> {
    const {
      workspace,
      repo_slug,
      title,
      source_branch,
      destination_branch,
      description,
      close_source_branch,
      reviewers,
    } = params;

    const body: Record<string, unknown> = {
      title,
      source: {
        branch: { name: source_branch },
      },
      close_source_branch: close_source_branch ?? false,
    };

    if (destination_branch) {
      body.destination = { branch: { name: destination_branch } };
    }

    if (description) {
      body.description = description;
    }

    if (reviewers && reviewers.length > 0) {
      body.reviewers = reviewers.map((uuid) => ({ uuid }));
    }

    return this.client.post<BitbucketPullRequest>(
      `/repositories/${workspace}/${repo_slug}/pullrequests`,
      body
    );
  }

  /**
   * Update a pull request
   */
  async update(
    workspace: string,
    repo_slug: string,
    pr_id: number,
    updates: { title?: string; description?: string; destination_branch?: string }
  ): Promise<BitbucketPullRequest> {
    const body: Record<string, unknown> = {};

    if (updates.title) body.title = updates.title;
    if (updates.description) body.description = updates.description;
    if (updates.destination_branch) {
      body.destination = { branch: { name: updates.destination_branch } };
    }

    return this.client.put<BitbucketPullRequest>(
      `/repositories/${workspace}/${repo_slug}/pullrequests/${pr_id}`,
      body
    );
  }

  /**
   * Merge a pull request
   */
  async merge(
    workspace: string,
    repo_slug: string,
    pr_id: number,
    options?: {
      message?: string;
      close_source_branch?: boolean;
      merge_strategy?: 'merge_commit' | 'squash' | 'fast_forward';
    }
  ): Promise<BitbucketPullRequest> {
    return this.client.post<BitbucketPullRequest>(
      `/repositories/${workspace}/${repo_slug}/pullrequests/${pr_id}/merge`,
      options
    );
  }

  /**
   * Decline a pull request
   */
  async decline(
    workspace: string,
    repo_slug: string,
    pr_id: number
  ): Promise<BitbucketPullRequest> {
    return this.client.post<BitbucketPullRequest>(
      `/repositories/${workspace}/${repo_slug}/pullrequests/${pr_id}/decline`
    );
  }

  /**
   * Approve a pull request
   */
  async approve(workspace: string, repo_slug: string, pr_id: number): Promise<void> {
    await this.client.post(`/repositories/${workspace}/${repo_slug}/pullrequests/${pr_id}/approve`);
  }

  /**
   * Unapprove a pull request
   */
  async unapprove(workspace: string, repo_slug: string, pr_id: number): Promise<void> {
    await this.client.delete(
      `/repositories/${workspace}/${repo_slug}/pullrequests/${pr_id}/approve`
    );
  }

  /**
   * Request changes on a pull request
   */
  async requestChanges(workspace: string, repo_slug: string, pr_id: number): Promise<void> {
    await this.client.post(
      `/repositories/${workspace}/${repo_slug}/pullrequests/${pr_id}/request-changes`
    );
  }

  /**
   * List comments on a pull request
   */
  async listComments(
    workspace: string,
    repo_slug: string,
    pr_id: number,
    params?: { page?: number; pagelen?: number }
  ): Promise<PaginatedResponse<BitbucketPRComment>> {
    return this.client.get<PaginatedResponse<BitbucketPRComment>>(
      `/repositories/${workspace}/${repo_slug}/pullrequests/${pr_id}/comments`,
      params as Record<string, string | number | undefined>
    );
  }

  /**
   * Add a comment to a pull request
   */
  async addComment(
    workspace: string,
    repo_slug: string,
    pr_id: number,
    content: string,
    inline?: { path: string; line?: number }
  ): Promise<BitbucketPRComment> {
    const body: Record<string, unknown> = {
      content: { raw: content },
    };

    if (inline) {
      body.inline = {
        path: inline.path,
        to: inline.line,
      };
    }

    return this.client.post<BitbucketPRComment>(
      `/repositories/${workspace}/${repo_slug}/pullrequests/${pr_id}/comments`,
      body
    );
  }

  /**
   * Get diff for a pull request
   */
  async getDiff(workspace: string, repo_slug: string, pr_id: number): Promise<string> {
    return this.client.getRaw(`/repositories/${workspace}/${repo_slug}/pullrequests/${pr_id}/diff`);
  }
}
