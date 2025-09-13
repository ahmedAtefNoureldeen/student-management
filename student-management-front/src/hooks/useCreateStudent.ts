import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi } from '../services/apiStudents';

interface CreateStudentData {
  name: string;
  idNumber: string;
}

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStudentData) => studentsApi.createStudent(data),
    onSuccess: () => {
      // Invalidate and refetch students data
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: any) => {
      console.error('Failed to create student:', error);
    },
  });
};
