import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Calendar, HardDrive } from 'lucide-react';
import { Cv } from '@/types';
import { api } from '@/lib/axios';

interface CvDetailsModalProps {
  cvId: string | null;
  onClose: () => void;
}

export function CvDetailsModal({ cvId, onClose }: CvDetailsModalProps) {
  const { data: cv, isLoading } = useQuery<Cv>({
    queryKey: ['cv', cvId],
    queryFn: async () => {
      const { data } = await api.get(`/cv/${cvId}`);
      return data;
    },
    enabled: !!cvId,
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={!!cvId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-950">
            <FileText className="w-5 h-5 text-violet-600" />
            CV Details
          </DialogTitle>
          <DialogDescription>
            Full details and parsed contents of your uploaded resume.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-48 w-full mt-4" />
          </div>
        ) : cv ? (
          <div className="py-4 space-y-6 flex-1 overflow-hidden flex flex-col">
            <div className="grid grid-cols-2 gap-4 shrink-0 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Filename</p>
                <p className="text-sm font-medium text-blue-950 truncate" title={cv.originalFilename}>
                  {cv.originalFilename}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">File Type</p>
                <p className="text-sm font-medium text-blue-950">{cv.fileType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Uploaded
                </p>
                <p className="text-sm font-medium text-blue-950">
                  {new Date(cv.uploadedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1 flex items-center gap-1">
                  <HardDrive className="w-3 h-3" /> Size
                </p>
                <p className="text-sm font-medium text-blue-950">
                  {cv.fileSizeBytes ? formatBytes(cv.fileSizeBytes) : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <p className="text-xs text-gray-500 font-medium uppercase mb-2">Parsed Text Extracted for AI Matching</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-y-auto flex-1 text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {cv.extractedText || <span className="italic text-gray-400">No text could be extracted from this document.</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Failed to load CV details.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
