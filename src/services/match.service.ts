import { api } from '@/lib/axios';
import { MatchJob } from '@/types';

export const matchService = {
  submitMatch: async (data: { cvId?: string; cvFile?: File; jdText?: string; jdUrl?: string; companyName?: string; roleTitle?: string; saveAsApplication?: boolean }): Promise<{ jobId: string }> => {
    let finalCvId = data.cvId;

    if (data.cvFile) {
      const formData = new FormData();
      formData.append('file', data.cvFile);
      const uploadRes = await api.post('/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      finalCvId = uploadRes.data.id;
    }

    const payload = {
      cvDocumentId: finalCvId,
      jdText: data.jdText,
      jdUrl: data.jdUrl,
      companyName: data.companyName || '',
      roleTitle: data.roleTitle || '',
      saveAsApplication: data.saveAsApplication || false
    };

    const response = await api.post('/match', payload);
    return response.data;
  },

  getJobStatus: async (jobId: string): Promise<MatchJob> => {
    const response = await api.get(`/match/jobs/${jobId}`);
    return response.data;
  }
};
