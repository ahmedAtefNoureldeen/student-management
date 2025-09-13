import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadApi } from '../services/apiUpload';
import type { FileUploadMappings } from '../services/apiUpload';

export const useFileUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, mappings }: { file: File; mappings: FileUploadMappings }) => 
      uploadApi.uploadFile(file, mappings),
    onSuccess: () => {
      // Invalidate and refetch all data
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['grades'] });
    },
    onError: (error: any) => {
      console.error('Failed to upload file:', error);
    },
  });
};
