import React, { useCallback } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { UploadCloud, CheckCircle, File, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: DropzoneOptions['accept'];
  maxSize?: number;
  loading?: boolean;
  success?: boolean;
  selectedFile?: File | null;
}

export function FileDropzone({
  onFileSelect,
  accept = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  loading,
  success,
  selectedFile
}: FileDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
        isDragActive ? "border-violet-500 bg-violet-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100",
        isDragReject && "border-red-500 bg-red-50",
        (loading || success) && "pointer-events-none"
      )}
    >
      <input {...getInputProps()} />
      
      {loading ? (
        <div className="flex flex-col items-center text-violet-600">
          <Loader2 className="w-10 h-10 animate-spin mb-2" />
          <p className="text-sm font-medium">Uploading document...</p>
        </div>
      ) : success ? (
        <div className="flex flex-col items-center text-emerald-600">
          <CheckCircle className="w-10 h-10 mb-2" />
          <p className="text-sm font-medium">Upload successful!</p>
          <p className="text-xs text-emerald-500 mt-1">{selectedFile?.name}</p>
        </div>
      ) : selectedFile ? (
        <div className="flex flex-col items-center text-violet-600">
          <File className="w-10 h-10 mb-2" />
          <p className="text-sm font-medium">{selectedFile.name}</p>
          <p className="text-xs text-gray-500 mt-1">Click or drag to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-gray-500">
          <UploadCloud className="w-10 h-10 mb-2 text-gray-400" />
          <p className="text-sm font-medium mb-1">
            <span className="text-violet-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs">PDF or DOCX up to 5MB</p>
        </div>
      )}
    </div>
  );
}
