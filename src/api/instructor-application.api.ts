import axios from './axios';

export interface InstructorApplication {
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

export const instructorApplicationApi = {
  apply: async (data: FormData): Promise<InstructorApplication> => {
    const response = await axios.post('/instructor-applications', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  getAll: async (): Promise<InstructorApplication[]> => {
    const response = await axios.get('/instructor-applications');
    return response.data.data;
  },

  updateStatus: async (id: number, status: 'approved' | 'rejected'): Promise<InstructorApplication> => {
    const response = await axios.put(`/instructor-applications/${id}/status`, { status });
    return response.data.data;
  },
};
