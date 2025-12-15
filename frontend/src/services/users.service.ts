import apiClient from '@/lib/api-client';
import { User, PaginatedResponse, QueryParams } from '@/types';

export const usersService = {
  async getAll(params?: QueryParams): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  async getById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  async create(data: Partial<User> & { password: string }): Promise<User> {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async updateStatus(id: string, status: string): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}/status`, { status });
    return response.data;
  },
};
