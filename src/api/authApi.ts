import { AuthResponse, LoginRequest, RegisterRequest } from '../types/user';
import apiClient from './apiClient';

// Đăng ký
export const register = (data: RegisterRequest) =>
    apiClient.post<AuthResponse>('/api/auth/register', data);

// Đăng nhập
export const login = (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/api/auth/login', data);

// Lấy thông tin user hiện tại
export const getCurrentUser = () =>
    apiClient.get<AuthResponse>('/api/auth/me');

