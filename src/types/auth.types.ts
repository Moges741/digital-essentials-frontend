// src/types/auth.types.ts

export type Role = 'learner' | 'mentor' | 'administrator';

export interface User {
  user_id:    number;
  name:       string;
  email:      string;
  role:       Role;
  is_active:  boolean;
  email_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user:  User;
  token: string;
}

export interface RegisterResponse {
  user: User;
}

export interface LoginBody {
  email:    string;
  password: string;
}

export interface RegisterBody {
  name:            string;
  email:           string;
  password:        string;
  role:            Role;
  specialization?: string;
  qualifications?: string;
}

// API response wrapper — matches your backend exactly
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data:    T;
  errors?: string[];
}