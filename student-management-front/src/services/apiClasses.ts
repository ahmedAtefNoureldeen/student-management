import apiClient from './apiAuth';

export interface Student {
  id: string;
  name: string;
  idNumber: string;
  enrolledAt: string;
  grade?: number;
}

export interface Grade {
  id: string;
  grade: number;
  notes: string;
  student: {
    id: string;
    name: string;
    idNumber: string;
  };
  createdAt: string;
}

export interface ClassWithStats {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  averageGrade: number | null;
  totalStudents: number;
  totalGrades: number;
  students: Student[];
  grades: Grade[];
}

export interface ClassesResponse {
  data: ClassWithStats[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ClassesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const classesApi = {
  getClasses: async (params: ClassesParams = {}): Promise<ClassesResponse> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    console.log('Making API request with token:', token.substring(0, 20) + '...');
    
    const response = await apiClient.get('/classes', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
      },
    });
    return response.data;
  },

  getClass: async (id: string): Promise<ClassWithStats> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    const response = await apiClient.get(`/classes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  createClass: async (data: { name: string; description: string }): Promise<ClassWithStats> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    console.log('Creating class with data:', data);
    
    const response = await apiClient.post('/classes', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateClass: async (id: string, data: { name: string; description: string }): Promise<ClassWithStats> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    const response = await apiClient.put(`/classes/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deleteClass: async (id: string): Promise<void> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    await apiClient.delete(`/classes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
