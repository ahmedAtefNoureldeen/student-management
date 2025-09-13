import { useState, useEffect } from 'react';
import { gradesApi } from '../services/apiGrades';
import type { GradeWithRelations, GradesParams } from '../services/apiGrades';

export const useGrades = (params: GradesParams = {}) => {
  const [grades, setGrades] = useState<GradeWithRelations[]>([]);
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

  const fetchGrades = async (searchParams: GradesParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await gradesApi.getGrades({
        ...params,
        ...searchParams,
      });
      setGrades(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      console.error('Error fetching grades:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch grades');
      }
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [params.page, params.limit]);

  const searchGrades = (searchTerm: string) => {
    fetchGrades({ ...params, search: searchTerm, page: 1 });
  };

  const searchGradesAdvanced = (filters: any) => {
    fetchGrades({ ...params, ...filters, page: 1 });
  };

  const changePage = (page: number) => {
    fetchGrades({ ...params, page });
  };

  const changeLimit = (limit: number) => {
    fetchGrades({ ...params, limit, page: 1 });
  };

  return {
    grades,
    loading,
    error,
    meta,
    searchGrades,
    searchGradesAdvanced,
    changePage,
    changeLimit,
    refetch: () => fetchGrades(params),
  };
};
