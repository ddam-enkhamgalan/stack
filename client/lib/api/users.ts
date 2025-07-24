/**
 * Users API functions
 */

import { API_ENDPOINTS, PAGINATION } from '../constants';
import type { ApiResponse, UpdateUserRequest, User, UserListResponse } from '../types';
import { ApiResponseHandler, httpClient } from './http-client';

export class UsersApi {
  /**
   * Get list of users with pagination
   */
  static async getUsers(
    params: {
      limit?: number;
      offset?: number;
    } = {},
    accessToken: string,
  ): Promise<UserListResponse> {
    const queryParams = {
      limit: params.limit || PAGINATION.DEFAULT_LIMIT,
      offset: params.offset || PAGINATION.DEFAULT_OFFSET,
    };

    const response = await httpClient.get<ApiResponse<UserListResponse>>(API_ENDPOINTS.USERS.LIST, {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return ApiResponseHandler.handleResponse(response.data);
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string, accessToken: string): Promise<User> {
    const response = await httpClient.get<ApiResponse<User>>(API_ENDPOINTS.USERS.GET(id), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return ApiResponseHandler.handleResponse(response.data);
  }

  /**
   * Update user profile
   */
  static async updateUser(id: string, userData: UpdateUserRequest, accessToken: string): Promise<User> {
    const response = await httpClient.put<ApiResponse<User>>(API_ENDPOINTS.USERS.UPDATE(id), userData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return ApiResponseHandler.handleResponse(response.data);
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string, accessToken: string): Promise<{ deleted: boolean }> {
    const response = await httpClient.delete<ApiResponse<{ deleted: boolean }>>(API_ENDPOINTS.USERS.DELETE(id), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return ApiResponseHandler.handleResponse(response.data);
  }
}
