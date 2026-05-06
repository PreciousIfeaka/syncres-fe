import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { JobStatus } from '@/types';
import { Loader2 } from 'lucide-react';

interface MatchProgressProps {
  status?: JobStatus;
}

export function MatchProgress({ status }: MatchProgressProps) {
  const [progress, setProgress] = useState(10);
  const [message, setMessage] = useState('Analysing your CV...');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (status === 'PENDING') {
      setProgress(20);
      setMessage('Analysing your CV...');
    } else if (status === 'PROCESSING') {
      setProgress((prev) => {
        if (prev < 40) return 40;
        if (prev < 80) return prev + 5;
        return 80;
      });
      setMessage('Scoring match and extracting skills...');

      interval = setInterval(() => {
        setProgress((prev) => (prev < 85 ? prev + 2 : prev));
      }, 1000);
    } else if (status === 'COMPLETED') {
      setProgress(100);
      setMessage('Generating report...');
    } else if (status === 'FAILED') {
      setProgress(100);
      setMessage('Match analysis failed.');
    }

    return () => clearInterval(interval);
  }, [status]);

  return (
    <Card className="max-w-md mx-auto mt-16 animate-in fade-in zoom-in-95">
      <CardContent className="pt-6 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="bg-violet-100 text-violet-600 p-4 rounded-full">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="space-y-2 w-full">
          <h3 className="text-lg font-medium text-blue-950">{message}</h3>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="flex justify-between w-full text-xs text-gray-500 px-1 font-medium tracking-wide">
          <span className={progress >= 20 ? "text-violet-600" : ""}>Parse</span>
          <span className={progress >= 40 ? "text-violet-600" : ""}>Analyse</span>
          <span className={progress >= 100 ? "text-violet-600" : ""}>Report</span>
        </div>
      </CardContent>
    </Card>
  );
}
