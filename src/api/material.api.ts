
import apiClient      from './axios';
import type { Material }   from '../types/material.types';
import type { ApiResponse } from '../types/auth.types';

export const materialApi = {

  // GET /api/courses/:course_id/materials
  // Lists all materials for a course
  list: async (course_id: number): Promise<Material[]> => {
    const res = await apiClient.get
      ApiResponse<{ materials: Material[] }>
    >(`/courses/${course_id}/materials`);
    return res.data.data.materials;
  },

  // POST /api/courses/:course_id/materials
  // Uploads file to Cloudinary via backend
  // Must use FormData — NOT JSON — because file is included
  upload: async (
    course_id: number,
    formData:  FormData
  ): Promise<Material> => {
    const res = await apiClient.post
      ApiResponse<{ material: Material }>
    >(
      `/courses/${course_id}/materials`,
      formData,
      {
        headers: {
          // Let browser set Content-Type with boundary automatically
          // Do NOT manually set multipart/form-data here
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data.data.material;
  },

  // DELETE /api/courses/:course_id/materials/:material_id
  // Deletes from both MySQL and Cloudinary
  delete: async (
    course_id:   number,
    material_id: number
  ): Promise<void> => {
    await apiClient.delete(
      `/courses/${course_id}/materials/${material_id}`
    );
  },
};