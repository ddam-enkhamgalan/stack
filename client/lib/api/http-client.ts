/**
 * HTTP client utility for making API requests
 */

import { API_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from '../constants';
import type { ApiError, ApiResponse, HttpResponse, RequestConfig } from '../types';

export class HttpClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || API_CONFIG.BASE_URL;
    this.defaultTimeout = API_CONFIG.TIMEOUT;
    this.defaultRetries = API_CONFIG.RETRIES;
  }

  /**
   * Make an HTTP request
   */
  async request<T = unknown>(endpoint: string, config: RequestConfig = {}): Promise<HttpResponse<T>> {
    const { method = 'GET', headers = {}, body, params, timeout = this.defaultTimeout, retries = this.defaultRetries } = config;

    // Build URL with query parameters
    const url = this.buildUrl(endpoint, params);

    // Prepare request headers
    const requestHeaders = this.buildHeaders(headers, body);

    // Prepare request body
    const requestBody = this.prepareBody(body);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await this.executeRequest(
        url,
        {
          method,
          headers: requestHeaders,
          body: requestBody,
          signal: controller.signal,
        },
        retries,
      );

      clearTimeout(timeoutId);

      const data = await this.parseResponse<T>(response);

      return {
        data,
        status: response.status,
        headers: this.extractHeaders(response),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleError(error);
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string,
    body?: RequestConfig['body'],
    config: Omit<RequestConfig, 'method' | 'body'> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    body?: RequestConfig['body'],
    config: Omit<RequestConfig, 'method' | 'body'> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    body?: RequestConfig['body'],
    config: Omit<RequestConfig, 'method' | 'body'> = {},
  ): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number>): string {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Build request headers
   */
  private buildHeaders(customHeaders: Record<string, string>, body?: RequestConfig['body']): Record<string, string> {
    const headers: Record<string, string> = {
      ...customHeaders,
    };

    // Add Content-Type for JSON bodies
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  /**
   * Prepare request body
   */
  private prepareBody(body?: RequestConfig['body']): string | FormData | null {
    if (!body) return null;
    if (body instanceof FormData) return body;
    if (typeof body === 'string') return body;
    return JSON.stringify(body);
  }

  /**
   * Execute request with retry logic
   */
  private async executeRequest(url: string, init: RequestInit, retries: number): Promise<Response> {
    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, init);

        // Don't retry on client errors (4xx) except 401, 408, 429
        if (response.status >= 400 && response.status < 500) {
          const shouldRetry = [
            HTTP_STATUS.UNAUTHORIZED,
            408, // Request Timeout
            HTTP_STATUS.TOO_MANY_REQUESTS,
          ].includes(response.status);

          if (!shouldRetry || attempt === retries) {
            return response;
          }
        }

        // Retry on server errors (5xx) and specific client errors
        if (response.status >= 500 || [HTTP_STATUS.UNAUTHORIZED, 408, HTTP_STATUS.TOO_MANY_REQUESTS].includes(response.status)) {
          if (attempt === retries) {
            return response;
          }

          // Exponential backoff
          await this.delay(Math.pow(2, attempt) * 1000);
          continue;
        }

        return response;
      } catch (error) {
        lastError = error as Error;

        if (attempt === retries) {
          throw lastError;
        }

        // Exponential backoff
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    throw lastError!;
  }

  /**
   * Parse response based on content type
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('Content-Type') || '';

    if (response.status === HTTP_STATUS.NO_CONTENT) {
      return null as T;
    }

    if (contentType.includes('application/json')) {
      return response.json();
    }

    if (contentType.includes('text/')) {
      return response.text() as T;
    }

    return response.blob() as T;
  }

  /**
   * Extract headers from response
   */
  private extractHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }

  /**
   * Handle and format errors
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return new Error(ERROR_MESSAGES.TIMEOUT);
      }

      if (error.message.includes('fetch')) {
        return new Error(ERROR_MESSAGES.NETWORK);
      }

      return error;
    }

    return new Error(ERROR_MESSAGES.UNKNOWN);
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Default HTTP client instance
export const httpClient = new HttpClient();

/**
 * API response utilities
 */
export class ApiResponseHandler {
  /**
   * Check if response is successful
   */
  static isSuccess<T>(response: ApiResponse<T> | ApiError): response is ApiResponse<T> {
    return 'success' in response && response.success;
  }

  /**
   * Check if response is an error
   */
  static isError<T>(response: ApiResponse<T> | ApiError): response is ApiError {
    return 'error' in response;
  }

  /**
   * Extract data from API response
   */
  static getData<T>(response: ApiResponse<T>): T | undefined {
    return this.isSuccess(response) ? response.data : undefined;
  }

  /**
   * Extract error message from API response
   */
  static getErrorMessage(response: ApiError): string {
    return response.error?.message || ERROR_MESSAGES.UNKNOWN;
  }

  /**
   * Handle API response and throw error if needed
   */
  static handleResponse<T>(response: ApiResponse<T> | ApiError): T {
    if (this.isError(response)) {
      throw new Error(this.getErrorMessage(response));
    }

    if (!this.isSuccess(response)) {
      throw new Error(ERROR_MESSAGES.UNKNOWN);
    }

    return response.data as T;
  }
}
