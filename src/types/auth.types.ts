// src/types/auth.types.ts

export type Role = 'learner' | 'instructor' | 'administrator';

export interface User {
  user_id:    number;
  name:       string;
  username:   string;
  email:      string;
  role:       Role;
  must_change_password: boolean;
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
  username: string;
  password: string;
}

export interface RegisterBody {
  first_name:      string;
  middle_name:     string;
  last_name:       string;
  email:           string;
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