import type { BitbucketClient } from './client.js';
import type { BitbucketSearchResult, PaginatedResponse, SearchCodeParams } from '../types/index.js';

export class SearchAPI {
  constructor(private client: BitbucketClient) {}

  /**
   * Search code in a workspace
   */
  async searchCode(params: SearchCodeParams): Promise<PaginatedResponse<BitbucketSearchResult>> {
    const { workspace, search_query, ...queryParams } = params;
    return this.client.get<PaginatedResponse<BitbucketSearchResult>>(
      `/workspaces/${workspace}/search/code`,
      {
        search_query,
        ...queryParams,
      } as Record<string, string | number | undefined>
    );
  }
}
