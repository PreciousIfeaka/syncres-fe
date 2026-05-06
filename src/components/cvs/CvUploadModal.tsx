import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/shared/FileDropzone';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

interface CvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CvUploadModal({ isOpen, onClose }: CvUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] });
      toast.success('CV uploaded successfully');
      setFile(null);
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to upload CV');
    }
  });

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload New CV</DialogTitle>
          <DialogDescription>
            Upload a PDF or Word document to use in your future matches.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <FileDropzone
            onFileSelect={setFile}
            selectedFile={file}
            loading={uploadMutation.isPending}
            success={uploadMutation.isSuccess}
          />
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={onClose} disabled={uploadMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploadMutation.isPending}>
            Upload Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
