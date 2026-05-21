import axios from './axios';

export interface MentorApplication {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  academic_file_url: string;
  national_id_url: string;
  linkedin_link?: string;
  github_link?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const mentorApplicationApi = {
  apply: async (data: FormData): Promise<MentorApplication> => {
    const response = await axios.post('/mentor-applications', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  getAll: async (): Promise<MentorApplication[]> => {
    const response = await axios.get('/mentor-applications');
    return response.data.data;
  },

  updateStatus: async (id: number, status: 'approved' | 'rejected'): Promise<MentorApplication> => {
    const response = await axios.put(`/mentor-applications/${id}/status`, { status });
    return response.data.data;
  },
};
