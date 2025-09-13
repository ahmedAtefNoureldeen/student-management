import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthResponse, RegisterData } from '../services/apiAuth';
import { authApi } from '../services/apiAuth';

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, RegisterData>({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
};
