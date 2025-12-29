import type { BitbucketClient } from './client.js';
import type {
  BitbucketPipeline,
  PaginatedResponse,
  ListPipelinesParams,
  TriggerPipelineParams,
} from '../types/index.js';

export class PipelinesAPI {
  constructor(private client: BitbucketClient) {}

  /**
   * List pipelines for a repository
   */
  async list(params: ListPipelinesParams): Promise<PaginatedResponse<BitbucketPipeline>> {
    const { workspace, repo_slug, ...queryParams } = params;
    return this.client.get<PaginatedResponse<BitbucketPipeline>>(
      `/repositories/${workspace}/${repo_slug}/pipelines`,
      queryParams as Record<string, string | number | undefined>
    );
  }

  /**
   * Get a specific pipeline
   */
  async get(
    workspace: string,
    repo_slug: string,
    pipeline_uuid: string
  ): Promise<BitbucketPipeline> {
    return this.client.get<BitbucketPipeline>(
      `/repositories/${workspace}/${repo_slug}/pipelines/${pipeline_uuid}`
    );
  }

  /**
   * Trigger a new pipeline
   */
  async trigger(params: TriggerPipelineParams): Promise<BitbucketPipeline> {
    const { workspace, repo_slug, target, variables } = params;

    const body: Record<string, unknown> = {
      target,
    };

    if (variables && variables.length > 0) {
      body.variables = variables;
    }

    return this.client.post<BitbucketPipeline>(
      `/repositories/${workspace}/${repo_slug}/pipelines`,
      body
    );
  }

  /**
   * Stop a running pipeline
   */
  async stop(workspace: string, repo_slug: string, pipeline_uuid: string): Promise<void> {
    await this.client.post(
      `/repositories/${workspace}/${repo_slug}/pipelines/${pipeline_uuid}/stopPipeline`
    );
  }

  /**
   * Get pipeline steps
   */
  async getSteps(
    workspace: string,
    repo_slug: string,
    pipeline_uuid: string
  ): Promise<
    PaginatedResponse<{
      uuid: string;
      name: string;
      state: {
        name: string;
        type: string;
        result?: { name: string };
      };
      started_on?: string;
      completed_on?: string;
      duration_in_seconds?: number;
    }>
  > {
    return this.client.get(
      `/repositories/${workspace}/${repo_slug}/pipelines/${pipeline_uuid}/steps`
    );
  }

  /**
   * Get pipeline step log
   */
  async getStepLog(
    workspace: string,
    repo_slug: string,
    pipeline_uuid: string,
    step_uuid: string
  ): Promise<string> {
    return this.client.getRaw(
      `/repositories/${workspace}/${repo_slug}/pipelines/${pipeline_uuid}/steps/${step_uuid}/log`
    );
  }
}
