export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  streak: {
    current: number;
    longest: number;
    lastReviewedDate?: string;
  };
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: User;
    error?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    displayName: string;
} 