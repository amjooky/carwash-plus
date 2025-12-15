import apiClient from '@/lib/api-client';
import { AnalyticsData } from '@/types';

export const analyticsService = {
  async getDashboard(): Promise<AnalyticsData> {
    const response = await apiClient.get<AnalyticsData>('/analytics/dashboard');
    return response.data;
  },

  async getUserStats(): Promise<any> {
    const response = await apiClient.get('/analytics/users');
    return response.data;
  },

  async getActivityStats(): Promise<any> {
    const response = await apiClient.get('/analytics/activity');
    return response.data;
  },
};
