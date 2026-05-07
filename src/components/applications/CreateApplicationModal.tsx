import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cv, ApplicationStatus } from '@/types';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

interface CreateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateApplicationModal({ isOpen, onClose }: CreateApplicationModalProps) {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    companyName: '',
    roleTitle: '',
    jdUrl: '',
    cvDocumentId: '',
    currentStatus: 'SAVED',
    appliedAt: '',
  });

  const { data: cvs, isLoading: cvsLoading } = useQuery<Cv[]>({
    queryKey: ['cvs'],
    queryFn: async () => {
      const { data } = await api.get('/cv');
      return data;
    },
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        appliedAt: data.appliedAt ? new Date(data.appliedAt).toISOString() : undefined,
      };
      await api.post('/applications', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application created successfully');
      setFormData({
        companyName: '',
        roleTitle: '',
        jdUrl: '',
        cvDocumentId: '',
        currentStatus: 'SAVED',
        appliedAt: '',
      });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create application');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.roleTitle || !formData.cvDocumentId) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Application</DialogTitle>
            <DialogDescription>
              Manually track a job application without using the match engine.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
                <Input
                  id="companyName"
                  placeholder="Acme Inc."
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleTitle">Role Title <span className="text-red-500">*</span></Label>
                <Input
                  id="roleTitle"
                  placeholder="Senior Developer"
                  value={formData.roleTitle}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvDocument">Select CV <span className="text-red-500">*</span></Label>
              <Select
                value={formData.cvDocumentId}
                onValueChange={(val) => setFormData({ ...formData, cvDocumentId: val })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={cvsLoading ? "Loading CVs..." : "Choose a CV used for this application"} />
                </SelectTrigger>
                <SelectContent>
                  {cvs?.map((cv) => (
                    <SelectItem key={cv.id} value={cv.id}>
                      {cv.originalFilename}
                    </SelectItem>
                  ))}
                  {cvs?.length === 0 && (
                    <SelectItem value="none" disabled>No CVs found. Please upload one first.</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jdUrl">Job Description URL(Optional)</Label>
              <Input
                id="jdUrl"
                type="url"
                placeholder="https://example.com/job"
                value={formData.jdUrl}
                onChange={(e) => setFormData({ ...formData, jdUrl: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Status</Label>
                <Select
                  value={formData.currentStatus}
                  onValueChange={(val) => setFormData({ ...formData, currentStatus: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ApplicationStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appliedAt">Applied Date</Label>
                <Input
                  id="appliedAt"
                  type="date"
                  max={today}
                  value={formData.appliedAt}
                  onChange={(e) => setFormData({ ...formData, appliedAt: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !formData.cvDocumentId}>
              {createMutation.isPending ? 'Creating...' : 'Create Application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
