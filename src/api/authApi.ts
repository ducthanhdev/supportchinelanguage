import axios from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types/user';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Đăng ký
export const register = (data: RegisterRequest) =>
    axios.post<AuthResponse>(`${API_URL}/api/auth/register`, data);

// Đăng nhập
export const login = (data: LoginRequest) =>
    axios.post<AuthResponse>(`${API_URL}/api/auth/login`, data);

// Lấy thông tin user hiện tại
export const getCurrentUser = (token: string) =>
    axios.get<AuthResponse>(`${API_URL}/api/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }); 