import apiClient from './apiAuth';

export interface Student {
  id: string;
  name: string;
  idNumber: string;
}

export interface Class {
  id: string;
  name: string;
  description: string;
}

export interface GradeWithRelations {
  id: string;
  grade: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  student: Student;
  class: Class;
}

export interface GradesResponse {
  data: GradeWithRelations[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GradesParams {
  page?: number;
  limit?: number;
  search?: string;
  gradeMin?: number;
  gradeMax?: number;
  subject?: string;
  classId?: string;
  studentId?: string;
  sortBy?: 'name' | 'grade' | 'date' | 'class';
  sortOrder?: 'asc' | 'desc';
}

export const gradesApi = {
  getGrades: async (params: GradesParams = {}): Promise<GradesResponse> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    console.log('Making API request with token:', token.substring(0, 20) + '...');
    
    const response = await apiClient.get('/grades', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        gradeMin: params.gradeMin,
        gradeMax: params.gradeMax,
        subject: params.subject,
        classId: params.classId,
        studentId: params.studentId,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      },
    });
    return response.data;
  },

  getGrade: async (id: string): Promise<GradeWithRelations> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    const response = await apiClient.get(`/grades/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  createGrade: async (data: { 
    grade: number; 
    notes: string; 
    studentId: string; 
    classId: string; 
  }): Promise<GradeWithRelations> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    console.log('Creating grade with data:', data);
    
    const response = await apiClient.post('/grades', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateGrade: async (id: string, data: { 
    grade?: number; 
    notes?: string; 
  }): Promise<GradeWithRelations> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    const response = await apiClient.put(`/grades/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deleteGrade: async (id: string): Promise<void> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    await apiClient.delete(`/grades/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
