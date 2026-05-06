import { useQuery } from '@tanstack/react-query';
import { matchService } from '@/services/match.service';

export function useMatchPolling(jobId: string | null) {
  return useQuery({
    queryKey: ['matchJob', jobId],
    queryFn: () => matchService.getJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state?.data?.status;
      if (status === 'COMPLETED' || status === 'FAILED') {
        return false; // Stop polling
      }
      return 2000; // Poll every 2s
    },
  });
}
