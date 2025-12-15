import apiClient from '@/lib/api-client';
import { Activity, PaginatedResponse } from '@/types';

interface QueryLogsParams {
  page?: number;
  limit?: number;
  level?: string;
  action?: string;
  module?: string;
  userId?: string;
  search?: string;
}

export const logsService = {
  async getAll(params?: QueryLogsParams): Promise<PaginatedResponse<Activity>> {
    const response = await apiClient.get<PaginatedResponse<Activity>>('/logs', { params });
    return response.data;
  },

  async getById(id: string): Promise<Activity> {
    const response = await apiClient.get<Activity>(`/logs/${id}`);
    return response.data;
  },

  async getStats(): Promise<any> {
    const response = await apiClient.get('/logs/stats');
    return response.data;
  },

  async deleteOld(): Promise<{ deleted: number }> {
    const response = await apiClient.delete<{ deleted: number}>('/logs/old');
    return response.data;
  },
};
