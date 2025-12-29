import type { BitbucketClient } from './client.js';
import type {
  BitbucketIssue,
  PaginatedResponse,
  ListIssuesParams,
  CreateIssueParams,
} from '../types/index.js';

export class IssuesAPI {
  constructor(private client: BitbucketClient) {}

  /**
   * List issues for a repository
   */
  async list(params: ListIssuesParams): Promise<PaginatedResponse<BitbucketIssue>> {
    const { workspace, repo_slug, ...queryParams } = params;
    return this.client.get<PaginatedResponse<BitbucketIssue>>(
      `/repositories/${workspace}/${repo_slug}/issues`,
      queryParams as Record<string, string | number | undefined>
    );
  }

  /**
   * Get a specific issue
   */
  async get(workspace: string, repo_slug: string, issue_id: number): Promise<BitbucketIssue> {
    return this.client.get<BitbucketIssue>(
      `/repositories/${workspace}/${repo_slug}/issues/${issue_id}`
    );
  }

  /**
   * Create a new issue
   */
  async create(params: CreateIssueParams): Promise<BitbucketIssue> {
    const { workspace, repo_slug, title, content, kind, priority, assignee } = params;

    const body: Record<string, unknown> = {
      title,
    };

    if (content) {
      body.content = { raw: content };
    }

    if (kind) body.kind = kind;
    if (priority) body.priority = priority;
    if (assignee) {
      body.assignee = { uuid: assignee };
    }

    return this.client.post<BitbucketIssue>(`/repositories/${workspace}/${repo_slug}/issues`, body);
  }

  /**
   * Update an issue
   */
  async update(
    workspace: string,
    repo_slug: string,
    issue_id: number,
    updates: {
      title?: string;
      content?: string;
      state?: BitbucketIssue['state'];
      kind?: BitbucketIssue['kind'];
      priority?: BitbucketIssue['priority'];
      assignee?: string;
    }
  ): Promise<BitbucketIssue> {
    const body: Record<string, unknown> = {};

    if (updates.title) body.title = updates.title;
    if (updates.content) body.content = { raw: updates.content };
    if (updates.state) body.state = updates.state;
    if (updates.kind) body.kind = updates.kind;
    if (updates.priority) body.priority = updates.priority;
    if (updates.assignee) body.assignee = { uuid: updates.assignee };

    return this.client.put<BitbucketIssue>(
      `/repositories/${workspace}/${repo_slug}/issues/${issue_id}`,
      body
    );
  }

  /**
   * Delete an issue
   */
  async delete(workspace: string, repo_slug: string, issue_id: number): Promise<void> {
    await this.client.delete(`/repositories/${workspace}/${repo_slug}/issues/${issue_id}`);
  }
}
