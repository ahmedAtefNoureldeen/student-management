import { useState, useEffect } from 'react';
import { classesApi } from '../services/apiClasses';
import type { ClassWithStats, ClassesParams } from '../services/apiClasses';

export const useClasses = (params: ClassesParams = {}) => {
  const [classes, setClasses] = useState<ClassWithStats[]>([]);
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

  const fetchClasses = async (searchParams: ClassesParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await classesApi.getClasses({
        ...params,
        ...searchParams,
      });
      setClasses(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      console.error('Error fetching classes:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch classes');
      }
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [params.page, params.limit]);

  const searchClasses = (searchTerm: string) => {
    fetchClasses({ ...params, search: searchTerm, page: 1 });
  };

  const changePage = (page: number) => {
    fetchClasses({ ...params, page });
  };

  const changeLimit = (limit: number) => {
    fetchClasses({ ...params, limit, page: 1 });
  };

  return {
    classes,
    loading,
    error,
    meta,
    searchClasses,
    changePage,
    changeLimit,
    refetch: () => fetchClasses(params),
  };
};
