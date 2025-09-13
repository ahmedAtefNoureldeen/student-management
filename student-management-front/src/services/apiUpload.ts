import apiClient from './apiAuth';

export interface FileUploadMappings {
  studentIdNumber: string;
  studentName: string;
  class: string;
  grade: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  statistics: {
    totalRows: number;
    processedRows: number;
    studentsCreated: number;
    studentsUpdated: number;
    classesCreated: number;
    classesReused: number;
    gradesCreated: number;
    gradesUpdated: number;
    errors: number;
  };
  errors: string[];
}

export const uploadApi = {
  uploadFile: async (file: File, mappings: FileUploadMappings): Promise<UploadResponse> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mappings', JSON.stringify(mappings));
    
    console.log('Uploading file with mappings:', mappings);
    
    const response = await apiClient.post('/upload/import', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};
