import { useState, useEffect } from 'react';
import { studentsApi } from '../services/apiStudents';
import type { Student, StudentsParams } from '../services/apiStudents';

export const useStudents = (params: StudentsParams = {}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchStudents = async (searchParams: StudentsParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await studentsApi.getStudents({
        ...params,
        ...searchParams,
      });
      setStudents(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch students');
      }
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [params.page, params.limit]);

  const searchStudents = (searchTerm: string) => {
    fetchStudents({ ...params, search: searchTerm, page: 1 });
  };

  const searchStudentsAdvanced = (filters: any) => {
    fetchStudents({ ...params, ...filters, page: 1 });
  };

  const changePage = (page: number) => {
    fetchStudents({ ...params, page });
  };

  const changeLimit = (limit: number) => {
    fetchStudents({ ...params, limit, page: 1 });
  };

  return {
    students,
    loading,
    error,
    meta,
    searchStudents,
    searchStudentsAdvanced,
    changePage,
    changeLimit,
    refetch: () => fetchStudents(params),
  };
};
