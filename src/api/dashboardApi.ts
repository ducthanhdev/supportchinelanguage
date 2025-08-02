import { DashboardStats } from '../types/dashboardModal';
import apiClient from './apiClient';

/**
 * Lấy dữ liệu thống kê dashboard cho một khoảng thời gian cụ thể.
 * @param range Khoảng thời gian thống kê ('7days', '30days', '90days').
 * @returns Promise<DashboardStats>
 */
export const getDashboardStats = async (
    range: '7days' | '30days' | '90days'
): Promise<DashboardStats> => {
    // Sử dụng apiClient đã được cấu hình để tự động thêm base URL và header Authorization
    const res = await apiClient.get<DashboardStats>(`/api/stats/dashboard?range=${range}`);
    return res.data;
};
