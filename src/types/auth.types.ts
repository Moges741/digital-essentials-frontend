
export type Role = 'learner' | 'mentor' | 'administrator';

export interface User {
  user_id:    number;
  name:       string;
  email:      string;
  role:       Role;
  is_active:  boolean;
  created_at: string;
}

export interface AuthResponse {
  user:  User;
  token: string;
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