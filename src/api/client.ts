import { BitbucketOAuth } from '../auth/oauth.js';
import type { BitbucketError } from '../types/index.js';

const BITBUCKET_API_URL = 'https://api.bitbucket.org/2.0';

export class BitbucketClient {
  private oauth: BitbucketOAuth;
  private baseUrl: string;

  constructor(oauth: BitbucketOAuth, baseUrl: string = BITBUCKET_API_URL) {
    this.oauth = oauth;
    this.baseUrl = baseUrl;
  }

  /**
   * Make an authenticated request to the Bitbucket API
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.oauth.getAccessToken();

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage: string;

      try {
        const errorJson = JSON.parse(errorBody) as BitbucketError;
        errorMessage = errorJson.error?.message ?? errorBody;
      } catch {
        errorMessage = errorBody;
      }

      throw new Error(`Bitbucket API error (${response.status}): ${errorMessage}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<T> {
    let url = endpoint;

    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }

    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Get raw file content
   */
  async getRaw(endpoint: string): Promise<string> {
    const token = await this.oauth.getAccessToken();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Bitbucket API error (${response.status}): ${await response.text()}`);
    }

    return response.text();
  }
}
