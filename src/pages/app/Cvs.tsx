import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CvCard } from '@/components/cvs/CvCard';
import { CvUploadModal } from '@/components/cvs/CvUploadModal';
import { CvDetailsModal } from '@/components/cvs/CvDetailsModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Cv } from '@/types';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Cvs() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<Cv | null>(null);
  const [cvToViewId, setCvToViewId] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cvs, isLoading } = useQuery<Cv[]>({
    queryKey: ['cvs'],
    queryFn: async () => {
      const { data } = await api.get('/cv');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cv/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cvs'] });
      toast.success('CV deleted successfully');
      setCvToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete CV');
      setCvToDelete(null);
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-blue-950">My CVs</h1>
          <p className="text-sm text-gray-500">Manage your resume versions</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Upload CV
        </Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[180px] w-full rounded-xl" />)}
        </div>
      ) : cvs && cvs.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cvs.map(cv => (
            <CvCard 
              key={cv.id} 
              cv={cv} 
              onDelete={setCvToDelete}
              onUseInMatch={(cv) => navigate('/app/match', { state: { cvId: cv.id } })}
              onView={(cv) => setCvToViewId(cv.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-blue-950 mb-2">No CVs found</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Upload your first resume to start matching against job descriptions.
          </p>
          <Button onClick={() => setIsUploadOpen(true)}>Upload your first CV</Button>
        </div>
      )}

      <CvUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      
      <CvDetailsModal cvId={cvToViewId} onClose={() => setCvToViewId(null)} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!cvToDelete} onOpenChange={(open) => !open && setCvToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete CV
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-medium text-blue-950">{cvToDelete?.originalFilename}</span>? 
              This action cannot be undone. If this CV is used in tracked applications, it will still show there but cannot be used for new matches.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between mt-4">
            <Button variant="ghost" onClick={() => setCvToDelete(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => cvToDelete && deleteMutation.mutate(cvToDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete CV'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
