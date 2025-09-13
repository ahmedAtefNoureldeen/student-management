import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classesApi } from '../services/apiClasses';

interface CreateClassData {
  name: string;
  description: string;
}

export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassData) => classesApi.createClass(data),
    onSuccess: () => {
      // Invalidate and refetch classes data
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error: any) => {
      console.error('Failed to create class:', error);
    },
  });
};
