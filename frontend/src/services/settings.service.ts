import apiClient from '@/lib/api-client';
import { Setting } from '@/types';

export const settingsService = {
  async getAll(category?: string): Promise<Setting[]> {
    const response = await apiClient.get<Setting[]>('/settings', {
      params: { category },
    });
    return response.data;
  },

  async getPublic(): Promise<Setting[]> {
    const response = await apiClient.get<Setting[]>('/settings/public');
    return response.data;
  },

  async getByKey(key: string): Promise<Setting> {
    const response = await apiClient.get<Setting>(`/settings/${key}`);
    return response.data;
  },

  async getByCategory(category: string): Promise<Setting[]> {
    const response = await apiClient.get<Setting[]>(`/settings/category/${category}`);
    return response.data;
  },

  async update(key: string, value: any): Promise<Setting> {
    const response = await apiClient.patch<Setting>(`/settings/${key}`, { value });
    return response.data;
  },

  async create(data: Partial<Setting>): Promise<Setting> {
    const response = await apiClient.post<Setting>('/settings', data);
    return response.data;
  },

  async delete(key: string): Promise<void> {
    await apiClient.delete(`/settings/${key}`);
  },
};
