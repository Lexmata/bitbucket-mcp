// OAuth types
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scopes: string;
}

export interface TokenState {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Bitbucket API types
export interface BitbucketUser {
  uuid: string;
  username: string;
  display_name: string;
  account_id: string;
  links: {
    self: { href: string };
    html: { href: string };
    avatar: { href: string };
  };
}

export interface BitbucketWorkspace {
  uuid: string;
  slug: string;
  name: string;
  links: {
    self: { href: string };
    html: { href: string };
    avatar: { href: string };
  };
}

export interface BitbucketRepository {
  uuid: string;
  slug: string;
  name: string;
  full_name: string;
  description: string;
  is_private: boolean;
  language: string;
  created_on: string;
  updated_on: string;
  size: number;
  mainbranch?: {
    name: string;
    type: string;
  };
  owner: BitbucketUser;
  workspace: BitbucketWorkspace;
  links: {
    self: { href: string };
    html: { href: string };
    clone: Array<{ href: string; name: string }>;
    commits: { href: string };
    branches: { href: string };
    pullrequests: { href: string };
  };
}

export interface BitbucketBranch {
  name: string;
  target: {
    hash: string;
    date: string;
    message: string;
    author: {
      raw: string;
      user?: BitbucketUser;
    };
  };
  links: {
    self: { href: string };
    html: { href: string };
    commits: { href: string };
  };
}

export interface BitbucketCommit {
  hash: string;
  date: string;
  message: string;
  author: {
    raw: string;
    user?: BitbucketUser;
  };
  parents: Array<{ hash: string }>;
  links: {
    self: { href: string };
    html: { href: string };
    diff: { href: string };
  };
}

export interface BitbucketPullRequest {
  id: number;
  title: string;
  description: string;
  state: 'OPEN' | 'MERGED' | 'DECLINED' | 'SUPERSEDED';
  author: BitbucketUser;
  source: {
    branch: { name: string };
    commit: { hash: string };
    repository: BitbucketRepository;
  };
  destination: {
    branch: { name: string };
    commit: { hash: string };
    repository: BitbucketRepository;
  };
  merge_commit?: { hash: string };
  close_source_branch: boolean;
  created_on: string;
  updated_on: string;
  comment_count: number;
  task_count: number;
  links: {
    self: { href: string };
    html: { href: string };
    commits: { href: string };
    comments: { href: string };
    merge: { href: string };
    diff: { href: string };
  };
}

export interface BitbucketPRComment {
  id: number;
  content: {
    raw: string;
    markup: string;
    html: string;
  };
  user: BitbucketUser;
  created_on: string;
  updated_on: string;
  inline?: {
    path: string;
    from?: number;
    to?: number;
  };
  links: {
    self: { href: string };
    html: { href: string };
  };
}

export interface BitbucketIssue {
  id: number;
  title: string;
  content: {
    raw: string;
    markup: string;
    html: string;
  };
  reporter: BitbucketUser;
  assignee?: BitbucketUser;
  state: 'new' | 'open' | 'resolved' | 'on hold' | 'invalid' | 'duplicate' | 'wontfix' | 'closed';
  kind: 'bug' | 'enhancement' | 'proposal' | 'task';
  priority: 'trivial' | 'minor' | 'major' | 'critical' | 'blocker';
  created_on: string;
  updated_on: string;
  links: {
    self: { href: string };
    html: { href: string };
  };
}

export interface BitbucketPipeline {
  uuid: string;
  build_number: number;
  state: {
    name: string;
    type: string;
    result?: {
      name: string;
      type: string;
    };
  };
  target: {
    type: string;
    ref_type: string;
    ref_name: string;
    commit: {
      hash: string;
    };
  };
  trigger: {
    type: string;
  };
  created_on: string;
  completed_on?: string;
  duration_in_seconds?: number;
  links: {
    self: { href: string };
    steps: { href: string };
  };
}

export interface BitbucketSearchResult {
  content_matches: Array<{
    lines: Array<{
      line: number;
      segments: Array<{
        text: string;
        match?: boolean;
      }>;
    }>;
  }>;
  path_matches: Array<{
    text: string;
    match?: boolean;
  }>;
  file: {
    path: string;
    type: string;
    links: {
      self: { href: string };
    };
  };
}

// Paginated response
export interface PaginatedResponse<T> {
  size: number;
  page: number;
  pagelen: number;
  next?: string;
  previous?: string;
  values: T[];
}

// API Error
export interface BitbucketError {
  type: string;
  error: {
    message: string;
    detail?: string;
    data?: Record<string, unknown>;
  };
}

// Tool parameter types
export interface ListRepositoriesParams {
  workspace: string;
  role?: 'owner' | 'admin' | 'contributor' | 'member';
  q?: string;
  sort?: string;
  page?: number;
  pagelen?: number;
}

export interface GetRepositoryParams {
  workspace: string;
  repo_slug: string;
}

export interface CreateRepositoryParams {
  workspace: string;
  repo_slug: string;
  name?: string;
  description?: string;
  is_private?: boolean;
  language?: string;
  has_issues?: boolean;
  has_wiki?: boolean;
  project_key?: string;
}

export interface ListPullRequestsParams {
  workspace: string;
  repo_slug: string;
  state?: 'OPEN' | 'MERGED' | 'DECLINED' | 'SUPERSEDED';
  page?: number;
  pagelen?: number;
}

export interface CreatePullRequestParams {
  workspace: string;
  repo_slug: string;
  title: string;
  source_branch: string;
  destination_branch?: string;
  description?: string;
  close_source_branch?: boolean;
  reviewers?: string[];
}

export interface ListBranchesParams {
  workspace: string;
  repo_slug: string;
  q?: string;
  sort?: string;
  page?: number;
  pagelen?: number;
}

export interface CreateBranchParams {
  workspace: string;
  repo_slug: string;
  name: string;
  target: string;
}

export interface ListCommitsParams {
  workspace: string;
  repo_slug: string;
  branch?: string;
  include?: string;
  exclude?: string;
  page?: number;
  pagelen?: number;
}

export interface ListIssuesParams {
  workspace: string;
  repo_slug: string;
  q?: string;
  sort?: string;
  page?: number;
  pagelen?: number;
}

export interface CreateIssueParams {
  workspace: string;
  repo_slug: string;
  title: string;
  content?: string;
  kind?: 'bug' | 'enhancement' | 'proposal' | 'task';
  priority?: 'trivial' | 'minor' | 'major' | 'critical' | 'blocker';
  assignee?: string;
}

export interface ListPipelinesParams {
  workspace: string;
  repo_slug: string;
  page?: number;
  pagelen?: number;
}

export interface TriggerPipelineParams {
  workspace: string;
  repo_slug: string;
  target: {
    type: 'pipeline_ref_target';
    ref_type: 'branch' | 'tag' | 'bookmark';
    ref_name: string;
  };
  variables?: Array<{
    key: string;
    value: string;
    secured?: boolean;
  }>;
}

export interface SearchCodeParams {
  workspace: string;
  search_query: string;
  page?: number;
  pagelen?: number;
}
