import { useState, useEffect } from 'react';
import { PublicNav } from '@/components/layout/PublicNav';
import { CvInputStep } from '@/components/match/CvInputStep';
import { JdInputStep } from '@/components/match/JdInputStep';
import { MatchProgress } from '@/components/match/MatchProgress';
import { MatchResultPanel } from '@/components/match/MatchResultPanel';
import { matchService } from '@/services/match.service';
import { useMatchPolling } from '@/hooks/useMatchPolling';
import { toast } from 'sonner';

export default function Match() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [cvData, setCvData] = useState<{ file?: File; text?: string }>({});
  const [jobId, setJobId] = useState<string | null>(null);

  const { data: jobInfo, isError } = useMatchPolling(jobId);

  useEffect(() => {
    if (jobInfo) {
      if (jobInfo.status === 'COMPLETED' && jobInfo.result) {
        // Small delay so user sees "100%" before transition
        setTimeout(() => setStep(4), 1000);
      } else if (jobInfo.status === 'FAILED') {
        toast.error(jobInfo.errorMessage || 'Match analysis failed');
        setStep(2); // Go back to JD step
        setJobId(null);
      }
    }
  }, [jobInfo]);

  useEffect(() => {
    if (isError) {
      toast.error('Connection error while polling match status');
      setStep(2);
      setJobId(null);
    }
  }, [isError]);

  const handleCvSubmit = (data: { file?: File; text?: string }) => {
    setCvData(data);
    setStep(2);
  };

  const handleJdSubmit = async (data: { url?: string; text?: string }) => {
    setStep(3);
    try {
      const response = await matchService.submitMatch({
        cvFile: cvData.file,
        jdText: data.text,
        jdUrl: data.url
      });
      setJobId(response.jobId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start match');
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <main className="container max-w-6xl mx-auto px-4 py-8">
        {step === 1 && <CvInputStep onSubmit={handleCvSubmit} />}
        {step === 2 && (
          <JdInputStep
            onSubmit={handleJdSubmit}
            onBack={() => setStep(1)}
            isLoading={jobId !== null}
          />
        )}
        {step === 3 && <MatchProgress status={jobInfo?.status} />}
        {step === 4 && jobInfo?.result && <MatchResultPanel result={jobInfo.result} />}
      </main>
    </div>
  );
}
