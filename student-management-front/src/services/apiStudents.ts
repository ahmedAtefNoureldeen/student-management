import apiClient from './apiAuth';

export interface Student {
  id: string;
  name: string;
  idNumber: string;
  createdAt: string;
  updatedAt: string;
  grades: {
    id: string;
    grade: number;
    notes: string;
    createdAt: string;
    updatedAt: string;
  }[];
  studentClasses: {
    id: string;
    enrolledAt: string;
    class: {
      id: string;
      name: string;
    };
  }[];
}

export interface StudentsResponse {
  data: Student[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface StudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  gradeMin?: number;
  gradeMax?: number;
  subject?: string;
  hasGrades?: boolean;
  hasClasses?: boolean;
  sortBy?: 'name' | 'grade' | 'date' | 'class';
  sortOrder?: 'asc' | 'desc';
}

export const studentsApi = {
  getStudents: async (params: StudentsParams = {}): Promise<StudentsResponse> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    console.log('Making API request with token:', token.substring(0, 20) + '...');
    
    const response = await apiClient.get('/students', {
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
        hasGrades: params.hasGrades,
        hasClasses: params.hasClasses,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      },
    });
    return response.data;
  },

  getStudent: async (id: string): Promise<Student> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    const response = await apiClient.get(`/students/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  createStudent: async (data: { name: string; idNumber: string }): Promise<Student> => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    console.log('Creating student with data:', data);
    
    const response = await apiClient.post('/students', data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateStudent: async (id: string, data: Partial<Student>): Promise<Student> => {
    const token = localStorage.getItem('token');
    const response = await apiClient.put(`/students/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  deleteStudent: async (id: string): Promise<void> => {
    const token = localStorage.getItem('token');
    await apiClient.delete(`/students/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
