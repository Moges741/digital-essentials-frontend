
import apiClient from './axios';
import type {
  CertificateWithDetails,
} from '../types/certificate.types';
import type { ApiResponse } from '../types/auth.types';

export const certificateApi = {

  // GET /api/certificates/my
  // Returns all certificates earned by logged-in user
  getMy: async (): Promise<CertificateWithDetails[]> => {
    const res = await apiClient.get<ApiResponse<{ certificates: CertificateWithDetails[] }>>('/certificates/my');
    return res.data.data.certificates;
  },

  // GET /api/certificates/:certificate_id
  // Get one certificate by ID
  getOne: async (
    certificate_id: number
  ): Promise<CertificateWithDetails> => {
    const res = await apiClient.get<ApiResponse<{ certificate: CertificateWithDetails }>>(`/certificates/${certificate_id}`);
    return res.data.data.certificate;
  },
};