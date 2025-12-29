import type { BitbucketClient } from './client.js';
import type {
  BitbucketRepository,
  PaginatedResponse,
  ListRepositoriesParams,
  GetRepositoryParams,
  CreateRepositoryParams,
} from '../types/index.js';

export class RepositoriesAPI {
  constructor(private client: BitbucketClient) {}

  /**
   * List repositories for a workspace
   */
  async list(params: ListRepositoriesParams): Promise<PaginatedResponse<BitbucketRepository>> {
    const { workspace, ...queryParams } = params;
    return this.client.get<PaginatedResponse<BitbucketRepository>>(
      `/repositories/${workspace}`,
      queryParams as Record<string, string | number | undefined>
    );
  }

  /**
   * Get a specific repository
   */
  async get(params: GetRepositoryParams): Promise<BitbucketRepository> {
    const { workspace, repo_slug } = params;
    return this.client.get<BitbucketRepository>(`/repositories/${workspace}/${repo_slug}`);
  }

  /**
   * Create a new repository
   */
  async create(params: CreateRepositoryParams): Promise<BitbucketRepository> {
    const { workspace, repo_slug, ...body } = params;
    return this.client.post<BitbucketRepository>(`/repositories/${workspace}/${repo_slug}`, body);
  }

  /**
   * Delete a repository
   */
  async delete(params: GetRepositoryParams): Promise<void> {
    const { workspace, repo_slug } = params;
    await this.client.delete(`/repositories/${workspace}/${repo_slug}`);
  }

  /**
   * List repository forks
   */
  async listForks(
    params: GetRepositoryParams & { page?: number; pagelen?: number }
  ): Promise<PaginatedResponse<BitbucketRepository>> {
    const { workspace, repo_slug, ...queryParams } = params;
    return this.client.get<PaginatedResponse<BitbucketRepository>>(
      `/repositories/${workspace}/${repo_slug}/forks`,
      queryParams as Record<string, string | number | undefined>
    );
  }

  /**
   * Get repository file content
   */
  async getFileContent(
    workspace: string,
    repo_slug: string,
    path: string,
    ref?: string
  ): Promise<string> {
    const endpoint = ref
      ? `/repositories/${workspace}/${repo_slug}/src/${ref}/${path}`
      : `/repositories/${workspace}/${repo_slug}/src/HEAD/${path}`;
    return this.client.getRaw(endpoint);
  }

  /**
   * List files in a directory
   */
  async listFiles(
    workspace: string,
    repo_slug: string,
    path: string = '',
    ref?: string
  ): Promise<PaginatedResponse<{ path: string; type: string }>> {
    const endpoint = ref
      ? `/repositories/${workspace}/${repo_slug}/src/${ref}/${path}`
      : `/repositories/${workspace}/${repo_slug}/src/HEAD/${path}`;
    return this.client.get(endpoint);
  }
}
