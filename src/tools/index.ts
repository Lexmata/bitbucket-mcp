import { z } from 'zod';
import type { BitbucketClient } from '../api/client.js';
import { RepositoriesAPI } from '../api/repositories.js';
import { PullRequestsAPI } from '../api/pullrequests.js';
import { BranchesAPI } from '../api/branches.js';
import { CommitsAPI } from '../api/commits.js';
import { IssuesAPI } from '../api/issues.js';
import { PipelinesAPI } from '../api/pipelines.js';
import { SearchAPI } from '../api/search.js';

// Tool schemas
export const toolSchemas = {
  // Repository tools
  list_repositories: z.object({
    workspace: z.string().describe('The workspace slug'),
    role: z.enum(['owner', 'admin', 'contributor', 'member']).optional().describe('Filter by role'),
    q: z.string().optional().describe('Query string for filtering'),
    sort: z.string().optional().describe('Sort field (e.g., "-updated_on")'),
    page: z.number().optional().describe('Page number'),
    pagelen: z.number().optional().describe('Results per page (max 100)'),
  }),

  get_repository: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
  }),

  create_repository: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    name: z.string().optional().describe('Repository name'),
    description: z.string().optional().describe('Repository description'),
    is_private: z.boolean().optional().describe('Whether the repository is private'),
    language: z.string().optional().describe('Primary language'),
    has_issues: z.boolean().optional().describe('Enable issue tracker'),
    has_wiki: z.boolean().optional().describe('Enable wiki'),
    project_key: z.string().optional().describe('Project key to add repo to'),
  }),

  delete_repository: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
  }),

  list_repository_forks: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    page: z.number().optional().describe('Page number'),
    pagelen: z.number().optional().describe('Results per page'),
  }),

  // Pull request tools
  list_pull_requests: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    state: z
      .enum(['OPEN', 'MERGED', 'DECLINED', 'SUPERSEDED'])
      .optional()
      .describe('Filter by state'),
    page: z.number().optional().describe('Page number'),
    pagelen: z.number().optional().describe('Results per page'),
  }),

  get_pull_request: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    pr_id: z.number().describe('The pull request ID'),
  }),

  create_pull_request: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    title: z.string().describe('Pull request title'),
    source_branch: z.string().describe('Source branch name'),
    destination_branch: z
      .string()
      .optional()
      .describe('Destination branch (defaults to main branch)'),
    description: z.string().optional().describe('Pull request description'),
    close_source_branch: z.boolean().optional().describe('Close source branch after merge'),
    reviewers: z.array(z.string()).optional().describe('List of reviewer UUIDs'),
  }),

  update_pull_request: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    pr_id: z.number().describe('The pull request ID'),
    title: z.string().optional().describe('New title'),
    description: z.string().optional().describe('New description'),
    destination_branch: z.string().optional().describe('New destination branch'),
  }),

  merge_pull_request: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    pr_id: z.number().describe('The pull request ID'),
    message: z.string().optional().describe('Merge commit message'),
    close_source_branch: z.boolean().optional().describe('Close source branch after merge'),
    merge_strategy: z
      .enum(['merge_commit', 'squash', 'fast_forward'])
      .optional()
      .describe('Merge strategy'),
  }),

  decline_pull_request: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    pr_id: z.number().describe('The pull request ID'),
  }),

  approve_pull_request: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    pr_id: z.number().describe('The pull request ID'),
  }),

  request_changes: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    pr_id: z.number().describe('The pull request ID'),
  }),

  list_pr_comments: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    pr_id: z.number().describe('The pull request ID'),
    page: z.number().optional().describe('Page number'),
    pagelen: z.number().optional().describe('Results per page'),
  }),

  add_pr_comment: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    pr_id: z.number().describe('The pull request ID'),
    content: z.string().describe('Comment content (markdown)'),
    path: z.string().optional().describe('File path for inline comment'),
    line: z.number().optional().describe('Line number for inline comment'),
  }),

  get_pr_diff: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    pr_id: z.number().describe('The pull request ID'),
  }),

  // Branch tools
  list_branches: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    q: z.string().optional().describe('Query string for filtering'),
    sort: z.string().optional().describe('Sort field'),
    page: z.number().optional().describe('Page number'),
    pagelen: z.number().optional().describe('Results per page'),
  }),

  get_branch: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    branch_name: z.string().describe('The branch name'),
  }),

  create_branch: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    name: z.string().describe('New branch name'),
    target: z.string().describe('Target commit hash or branch name'),
  }),

  delete_branch: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    branch_name: z.string().describe('The branch name to delete'),
  }),

  // Commit tools
  list_commits: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    branch: z.string().optional().describe('Branch name to filter commits'),
    include: z.string().optional().describe('Commit to include'),
    exclude: z.string().optional().describe('Commit to exclude'),
    page: z.number().optional().describe('Page number'),
    pagelen: z.number().optional().describe('Results per page'),
  }),

  get_commit: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    commit_hash: z.string().describe('The commit hash'),
  }),

  get_commit_diff: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    commit_hash: z.string().describe('The commit hash'),
  }),

  // Issue tools
  list_issues: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    q: z.string().optional().describe('Query string for filtering'),
    sort: z.string().optional().describe('Sort field'),
    page: z.number().optional().describe('Page number'),
    pagelen: z.number().optional().describe('Results per page'),
  }),

  get_issue: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    issue_id: z.number().describe('The issue ID'),
  }),

  create_issue: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    title: z.string().describe('Issue title'),
    content: z.string().optional().describe('Issue content/description'),
    kind: z.enum(['bug', 'enhancement', 'proposal', 'task']).optional().describe('Issue type'),
    priority: z
      .enum(['trivial', 'minor', 'major', 'critical', 'blocker'])
      .optional()
      .describe('Priority level'),
    assignee: z.string().optional().describe('Assignee UUID'),
  }),

  update_issue: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    issue_id: z.number().describe('The issue ID'),
    title: z.string().optional().describe('New title'),
    content: z.string().optional().describe('New content'),
    state: z
      .enum(['new', 'open', 'resolved', 'on hold', 'invalid', 'duplicate', 'wontfix', 'closed'])
      .optional()
      .describe('New state'),
    kind: z.enum(['bug', 'enhancement', 'proposal', 'task']).optional().describe('Issue type'),
    priority: z
      .enum(['trivial', 'minor', 'major', 'critical', 'blocker'])
      .optional()
      .describe('Priority level'),
    assignee: z.string().optional().describe('Assignee UUID'),
  }),

  delete_issue: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    issue_id: z.number().describe('The issue ID'),
  }),

  // Pipeline tools
  list_pipelines: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    page: z.number().optional().describe('Page number'),
    pagelen: z.number().optional().describe('Results per page'),
  }),

  get_pipeline: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    pipeline_uuid: z.string().describe('The pipeline UUID'),
  }),

  trigger_pipeline: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    ref_type: z.enum(['branch', 'tag', 'bookmark']).describe('Reference type'),
    ref_name: z.string().describe('Reference name (branch/tag name)'),
    variables: z
      .array(
        z.object({
          key: z.string(),
          value: z.string(),
          secured: z.boolean().optional(),
        })
      )
      .optional()
      .describe('Pipeline variables'),
  }),

  stop_pipeline: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    pipeline_uuid: z.string().describe('The pipeline UUID'),
  }),

  // Search tools
  search_code: z.object({
    workspace: z.string().describe('The workspace slug'),
    search_query: z.string().describe('Search query string'),
    page: z.number().optional().describe('Page number'),
    pagelen: z.number().optional().describe('Results per page'),
  }),

  // File tools
  get_file_content: z.object({
    workspace: z.string().describe('The workspace slug'),
    repo_slug: z.string().describe('The repository slug'),
    path: z.string().describe('File path'),
    ref: z.string().optional().describe('Git ref (branch, tag, or commit)'),
  }),
};

// Tool definitions for MCP
export const toolDefinitions = [
  // Repository tools
  {
    name: 'list_repositories',
    description:
      'List repositories in a workspace. Returns paginated results with repository details.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        role: {
          type: 'string',
          enum: ['owner', 'admin', 'contributor', 'member'],
          description: 'Filter by role',
        },
        q: { type: 'string', description: 'Query string for filtering' },
        sort: { type: 'string', description: 'Sort field (e.g., "-updated_on")' },
        page: { type: 'number', description: 'Page number' },
        pagelen: { type: 'number', description: 'Results per page (max 100)' },
      },
      required: ['workspace'],
    },
  },
  {
    name: 'get_repository',
    description:
      'Get details of a specific repository including its branches, pull requests, and other metadata.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
      },
      required: ['workspace', 'repo_slug'],
    },
  },
  {
    name: 'create_repository',
    description: 'Create a new repository in the specified workspace.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        name: { type: 'string', description: 'Repository name' },
        description: { type: 'string', description: 'Repository description' },
        is_private: { type: 'boolean', description: 'Whether the repository is private' },
        language: { type: 'string', description: 'Primary language' },
        has_issues: { type: 'boolean', description: 'Enable issue tracker' },
        has_wiki: { type: 'boolean', description: 'Enable wiki' },
        project_key: { type: 'string', description: 'Project key to add repo to' },
      },
      required: ['workspace', 'repo_slug'],
    },
  },
  {
    name: 'delete_repository',
    description: 'Delete a repository. This action is irreversible.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
      },
      required: ['workspace', 'repo_slug'],
    },
  },
  {
    name: 'list_repository_forks',
    description: 'List all forks of a repository.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        page: { type: 'number', description: 'Page number' },
        pagelen: { type: 'number', description: 'Results per page' },
      },
      required: ['workspace', 'repo_slug'],
    },
  },

  // Pull request tools
  {
    name: 'list_pull_requests',
    description: 'List pull requests for a repository with optional filtering by state.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        state: {
          type: 'string',
          enum: ['OPEN', 'MERGED', 'DECLINED', 'SUPERSEDED'],
          description: 'Filter by state',
        },
        page: { type: 'number', description: 'Page number' },
        pagelen: { type: 'number', description: 'Results per page' },
      },
      required: ['workspace', 'repo_slug'],
    },
  },
  {
    name: 'get_pull_request',
    description:
      'Get details of a specific pull request including its source, destination, and status.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        pr_id: { type: 'number', description: 'The pull request ID' },
      },
      required: ['workspace', 'repo_slug', 'pr_id'],
    },
  },
  {
    name: 'create_pull_request',
    description: 'Create a new pull request from a source branch to a destination branch.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        title: { type: 'string', description: 'Pull request title' },
        source_branch: { type: 'string', description: 'Source branch name' },
        destination_branch: {
          type: 'string',
          description: 'Destination branch (defaults to main branch)',
        },
        description: { type: 'string', description: 'Pull request description' },
        close_source_branch: { type: 'boolean', description: 'Close source branch after merge' },
        reviewers: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of reviewer UUIDs',
        },
      },
      required: ['workspace', 'repo_slug', 'title', 'source_branch'],
    },
  },
  {
    name: 'update_pull_request',
    description: 'Update a pull request title, description, or destination branch.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        pr_id: { type: 'number', description: 'The pull request ID' },
        title: { type: 'string', description: 'New title' },
        description: { type: 'string', description: 'New description' },
        destination_branch: { type: 'string', description: 'New destination branch' },
      },
      required: ['workspace', 'repo_slug', 'pr_id'],
    },
  },
  {
    name: 'merge_pull_request',
    description:
      'Merge an open pull request. Supports merge commit, squash, and fast-forward strategies.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        pr_id: { type: 'number', description: 'The pull request ID' },
        message: { type: 'string', description: 'Merge commit message' },
        close_source_branch: { type: 'boolean', description: 'Close source branch after merge' },
        merge_strategy: {
          type: 'string',
          enum: ['merge_commit', 'squash', 'fast_forward'],
          description: 'Merge strategy',
        },
      },
      required: ['workspace', 'repo_slug', 'pr_id'],
    },
  },
  {
    name: 'decline_pull_request',
    description: 'Decline/close a pull request without merging.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        pr_id: { type: 'number', description: 'The pull request ID' },
      },
      required: ['workspace', 'repo_slug', 'pr_id'],
    },
  },
  {
    name: 'approve_pull_request',
    description: 'Approve a pull request.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        pr_id: { type: 'number', description: 'The pull request ID' },
      },
      required: ['workspace', 'repo_slug', 'pr_id'],
    },
  },
  {
    name: 'request_changes',
    description: 'Request changes on a pull request.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        pr_id: { type: 'number', description: 'The pull request ID' },
      },
      required: ['workspace', 'repo_slug', 'pr_id'],
    },
  },
  {
    name: 'list_pr_comments',
    description: 'List all comments on a pull request.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        pr_id: { type: 'number', description: 'The pull request ID' },
        page: { type: 'number', description: 'Page number' },
        pagelen: { type: 'number', description: 'Results per page' },
      },
      required: ['workspace', 'repo_slug', 'pr_id'],
    },
  },
  {
    name: 'add_pr_comment',
    description:
      'Add a comment to a pull request. Can be a general comment or an inline comment on a specific file/line.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        pr_id: { type: 'number', description: 'The pull request ID' },
        content: { type: 'string', description: 'Comment content (markdown)' },
        path: { type: 'string', description: 'File path for inline comment' },
        line: { type: 'number', description: 'Line number for inline comment' },
      },
      required: ['workspace', 'repo_slug', 'pr_id', 'content'],
    },
  },
  {
    name: 'get_pr_diff',
    description: 'Get the diff for a pull request showing all changes.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        pr_id: { type: 'number', description: 'The pull request ID' },
      },
      required: ['workspace', 'repo_slug', 'pr_id'],
    },
  },

  // Branch tools
  {
    name: 'list_branches',
    description: 'List all branches in a repository.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        q: { type: 'string', description: 'Query string for filtering' },
        sort: { type: 'string', description: 'Sort field' },
        page: { type: 'number', description: 'Page number' },
        pagelen: { type: 'number', description: 'Results per page' },
      },
      required: ['workspace', 'repo_slug'],
    },
  },
  {
    name: 'get_branch',
    description: 'Get details of a specific branch including its latest commit.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        branch_name: { type: 'string', description: 'The branch name' },
      },
      required: ['workspace', 'repo_slug', 'branch_name'],
    },
  },
  {
    name: 'create_branch',
    description: 'Create a new branch from a specific commit or existing branch.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        name: { type: 'string', description: 'New branch name' },
        target: { type: 'string', description: 'Target commit hash or branch name' },
      },
      required: ['workspace', 'repo_slug', 'name', 'target'],
    },
  },
  {
    name: 'delete_branch',
    description: 'Delete a branch from a repository.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        branch_name: { type: 'string', description: 'The branch name to delete' },
      },
      required: ['workspace', 'repo_slug', 'branch_name'],
    },
  },

  // Commit tools
  {
    name: 'list_commits',
    description: 'List commits in a repository with optional filtering by branch.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        branch: { type: 'string', description: 'Branch name to filter commits' },
        include: { type: 'string', description: 'Commit to include' },
        exclude: { type: 'string', description: 'Commit to exclude' },
        page: { type: 'number', description: 'Page number' },
        pagelen: { type: 'number', description: 'Results per page' },
      },
      required: ['workspace', 'repo_slug'],
    },
  },
  {
    name: 'get_commit',
    description:
      'Get details of a specific commit including its message, author, and parent commits.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        commit_hash: { type: 'string', description: 'The commit hash' },
      },
      required: ['workspace', 'repo_slug', 'commit_hash'],
    },
  },
  {
    name: 'get_commit_diff',
    description: 'Get the diff for a specific commit showing all changes.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        commit_hash: { type: 'string', description: 'The commit hash' },
      },
      required: ['workspace', 'repo_slug', 'commit_hash'],
    },
  },

  // Issue tools
  {
    name: 'list_issues',
    description: 'List issues in a repository with optional filtering.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        q: { type: 'string', description: 'Query string for filtering' },
        sort: { type: 'string', description: 'Sort field' },
        page: { type: 'number', description: 'Page number' },
        pagelen: { type: 'number', description: 'Results per page' },
      },
      required: ['workspace', 'repo_slug'],
    },
  },
  {
    name: 'get_issue',
    description: 'Get details of a specific issue.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        issue_id: { type: 'number', description: 'The issue ID' },
      },
      required: ['workspace', 'repo_slug', 'issue_id'],
    },
  },
  {
    name: 'create_issue',
    description: 'Create a new issue in a repository.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        title: { type: 'string', description: 'Issue title' },
        content: { type: 'string', description: 'Issue content/description' },
        kind: {
          type: 'string',
          enum: ['bug', 'enhancement', 'proposal', 'task'],
          description: 'Issue type',
        },
        priority: {
          type: 'string',
          enum: ['trivial', 'minor', 'major', 'critical', 'blocker'],
          description: 'Priority level',
        },
        assignee: { type: 'string', description: 'Assignee UUID' },
      },
      required: ['workspace', 'repo_slug', 'title'],
    },
  },
  {
    name: 'update_issue',
    description: 'Update an existing issue.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        issue_id: { type: 'number', description: 'The issue ID' },
        title: { type: 'string', description: 'New title' },
        content: { type: 'string', description: 'New content' },
        state: {
          type: 'string',
          enum: ['new', 'open', 'resolved', 'on hold', 'invalid', 'duplicate', 'wontfix', 'closed'],
          description: 'New state',
        },
        kind: {
          type: 'string',
          enum: ['bug', 'enhancement', 'proposal', 'task'],
          description: 'Issue type',
        },
        priority: {
          type: 'string',
          enum: ['trivial', 'minor', 'major', 'critical', 'blocker'],
          description: 'Priority level',
        },
        assignee: { type: 'string', description: 'Assignee UUID' },
      },
      required: ['workspace', 'repo_slug', 'issue_id'],
    },
  },
  {
    name: 'delete_issue',
    description: 'Delete an issue from a repository.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        issue_id: { type: 'number', description: 'The issue ID' },
      },
      required: ['workspace', 'repo_slug', 'issue_id'],
    },
  },

  // Pipeline tools
  {
    name: 'list_pipelines',
    description: 'List pipeline runs for a repository.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        page: { type: 'number', description: 'Page number' },
        pagelen: { type: 'number', description: 'Results per page' },
      },
      required: ['workspace', 'repo_slug'],
    },
  },
  {
    name: 'get_pipeline',
    description: 'Get details of a specific pipeline run.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        pipeline_uuid: { type: 'string', description: 'The pipeline UUID' },
      },
      required: ['workspace', 'repo_slug', 'pipeline_uuid'],
    },
  },
  {
    name: 'trigger_pipeline',
    description: 'Trigger a new pipeline run on a branch, tag, or bookmark.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        ref_type: {
          type: 'string',
          enum: ['branch', 'tag', 'bookmark'],
          description: 'Reference type',
        },
        ref_name: { type: 'string', description: 'Reference name (branch/tag name)' },
        variables: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: { type: 'string' },
              secured: { type: 'boolean' },
            },
            required: ['key', 'value'],
          },
          description: 'Pipeline variables',
        },
      },
      required: ['workspace', 'repo_slug', 'ref_type', 'ref_name'],
    },
  },
  {
    name: 'stop_pipeline',
    description: 'Stop a running pipeline.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        pipeline_uuid: { type: 'string', description: 'The pipeline UUID' },
      },
      required: ['workspace', 'repo_slug', 'pipeline_uuid'],
    },
  },

  // Search tools
  {
    name: 'search_code',
    description: 'Search for code across all repositories in a workspace.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        search_query: { type: 'string', description: 'Search query string' },
        page: { type: 'number', description: 'Page number' },
        pagelen: { type: 'number', description: 'Results per page' },
      },
      required: ['workspace', 'search_query'],
    },
  },

  // File tools
  {
    name: 'get_file_content',
    description: 'Get the content of a file from a repository.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        workspace: { type: 'string', description: 'The workspace slug' },
        repo_slug: { type: 'string', description: 'The repository slug' },
        path: { type: 'string', description: 'File path' },
        ref: { type: 'string', description: 'Git ref (branch, tag, or commit)' },
      },
      required: ['workspace', 'repo_slug', 'path'],
    },
  },
];

// Tool handler class
export class ToolHandler {
  private repos: RepositoriesAPI;
  private prs: PullRequestsAPI;
  private branches: BranchesAPI;
  private commits: CommitsAPI;
  private issues: IssuesAPI;
  private pipelines: PipelinesAPI;
  private search: SearchAPI;

  constructor(client: BitbucketClient) {
    this.repos = new RepositoriesAPI(client);
    this.prs = new PullRequestsAPI(client);
    this.branches = new BranchesAPI(client);
    this.commits = new CommitsAPI(client);
    this.issues = new IssuesAPI(client);
    this.pipelines = new PipelinesAPI(client);
    this.search = new SearchAPI(client);
  }

  async handleTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      // Repository tools
      case 'list_repositories': {
        const params = toolSchemas.list_repositories.parse(args);
        return this.repos.list(params);
      }
      case 'get_repository': {
        const params = toolSchemas.get_repository.parse(args);
        return this.repos.get(params);
      }
      case 'create_repository': {
        const params = toolSchemas.create_repository.parse(args);
        return this.repos.create(params);
      }
      case 'delete_repository': {
        const params = toolSchemas.delete_repository.parse(args);
        await this.repos.delete(params);
        return { success: true, message: 'Repository deleted' };
      }
      case 'list_repository_forks': {
        const params = toolSchemas.list_repository_forks.parse(args);
        return this.repos.listForks(params);
      }

      // Pull request tools
      case 'list_pull_requests': {
        const params = toolSchemas.list_pull_requests.parse(args);
        return this.prs.list(params);
      }
      case 'get_pull_request': {
        const params = toolSchemas.get_pull_request.parse(args);
        return this.prs.get(params.workspace, params.repo_slug, params.pr_id);
      }
      case 'create_pull_request': {
        const params = toolSchemas.create_pull_request.parse(args);
        return this.prs.create(params);
      }
      case 'update_pull_request': {
        const params = toolSchemas.update_pull_request.parse(args);
        const { workspace, repo_slug, pr_id, ...updates } = params;
        return this.prs.update(workspace, repo_slug, pr_id, updates);
      }
      case 'merge_pull_request': {
        const params = toolSchemas.merge_pull_request.parse(args);
        const { workspace, repo_slug, pr_id, ...options } = params;
        return this.prs.merge(workspace, repo_slug, pr_id, options);
      }
      case 'decline_pull_request': {
        const params = toolSchemas.decline_pull_request.parse(args);
        return this.prs.decline(params.workspace, params.repo_slug, params.pr_id);
      }
      case 'approve_pull_request': {
        const params = toolSchemas.approve_pull_request.parse(args);
        await this.prs.approve(params.workspace, params.repo_slug, params.pr_id);
        return { success: true, message: 'Pull request approved' };
      }
      case 'request_changes': {
        const params = toolSchemas.request_changes.parse(args);
        await this.prs.requestChanges(params.workspace, params.repo_slug, params.pr_id);
        return { success: true, message: 'Changes requested' };
      }
      case 'list_pr_comments': {
        const params = toolSchemas.list_pr_comments.parse(args);
        return this.prs.listComments(params.workspace, params.repo_slug, params.pr_id, {
          page: params.page,
          pagelen: params.pagelen,
        });
      }
      case 'add_pr_comment': {
        const params = toolSchemas.add_pr_comment.parse(args);
        const inline = params.path ? { path: params.path, line: params.line } : undefined;
        return this.prs.addComment(
          params.workspace,
          params.repo_slug,
          params.pr_id,
          params.content,
          inline
        );
      }
      case 'get_pr_diff': {
        const params = toolSchemas.get_pr_diff.parse(args);
        const diff = await this.prs.getDiff(params.workspace, params.repo_slug, params.pr_id);
        return { diff };
      }

      // Branch tools
      case 'list_branches': {
        const params = toolSchemas.list_branches.parse(args);
        return this.branches.list(params);
      }
      case 'get_branch': {
        const params = toolSchemas.get_branch.parse(args);
        return this.branches.get(params.workspace, params.repo_slug, params.branch_name);
      }
      case 'create_branch': {
        const params = toolSchemas.create_branch.parse(args);
        return this.branches.create(params);
      }
      case 'delete_branch': {
        const params = toolSchemas.delete_branch.parse(args);
        await this.branches.delete(params.workspace, params.repo_slug, params.branch_name);
        return { success: true, message: 'Branch deleted' };
      }

      // Commit tools
      case 'list_commits': {
        const params = toolSchemas.list_commits.parse(args);
        return this.commits.list(params);
      }
      case 'get_commit': {
        const params = toolSchemas.get_commit.parse(args);
        return this.commits.get(params.workspace, params.repo_slug, params.commit_hash);
      }
      case 'get_commit_diff': {
        const params = toolSchemas.get_commit_diff.parse(args);
        const diff = await this.commits.getDiff(
          params.workspace,
          params.repo_slug,
          params.commit_hash
        );
        return { diff };
      }

      // Issue tools
      case 'list_issues': {
        const params = toolSchemas.list_issues.parse(args);
        return this.issues.list(params);
      }
      case 'get_issue': {
        const params = toolSchemas.get_issue.parse(args);
        return this.issues.get(params.workspace, params.repo_slug, params.issue_id);
      }
      case 'create_issue': {
        const params = toolSchemas.create_issue.parse(args);
        return this.issues.create(params);
      }
      case 'update_issue': {
        const params = toolSchemas.update_issue.parse(args);
        const { workspace, repo_slug, issue_id, ...updates } = params;
        return this.issues.update(workspace, repo_slug, issue_id, updates);
      }
      case 'delete_issue': {
        const params = toolSchemas.delete_issue.parse(args);
        await this.issues.delete(params.workspace, params.repo_slug, params.issue_id);
        return { success: true, message: 'Issue deleted' };
      }

      // Pipeline tools
      case 'list_pipelines': {
        const params = toolSchemas.list_pipelines.parse(args);
        return this.pipelines.list(params);
      }
      case 'get_pipeline': {
        const params = toolSchemas.get_pipeline.parse(args);
        return this.pipelines.get(params.workspace, params.repo_slug, params.pipeline_uuid);
      }
      case 'trigger_pipeline': {
        const params = toolSchemas.trigger_pipeline.parse(args);
        return this.pipelines.trigger({
          workspace: params.workspace,
          repo_slug: params.repo_slug,
          target: {
            type: 'pipeline_ref_target',
            ref_type: params.ref_type,
            ref_name: params.ref_name,
          },
          variables: params.variables,
        });
      }
      case 'stop_pipeline': {
        const params = toolSchemas.stop_pipeline.parse(args);
        await this.pipelines.stop(params.workspace, params.repo_slug, params.pipeline_uuid);
        return { success: true, message: 'Pipeline stopped' };
      }

      // Search tools
      case 'search_code': {
        const params = toolSchemas.search_code.parse(args);
        return this.search.searchCode(params);
      }

      // File tools
      case 'get_file_content': {
        const params = toolSchemas.get_file_content.parse(args);
        const content = await this.repos.getFileContent(
          params.workspace,
          params.repo_slug,
          params.path,
          params.ref
        );
        return { content };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}
