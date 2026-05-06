import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MatchResult } from '@/types';
import { ScoreRing } from '@/components/shared/ScoreRing';
import { Download, CheckCircle2, XCircle, AlertCircle, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import { useState } from 'react';

interface MatchResultPanelProps {
  result: MatchResult;
}

export function MatchResultPanel({ result }: MatchResultPanelProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const thresholdMet = result.matchScore >= 70;
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!result.retailoredCv?.downloadUrl) return;
    setIsDownloading(true);
    try {
      let urlPath = result.retailoredCv.downloadUrl;
      // Extract relative path if the backend returned an absolute URL including /api
      if (urlPath.includes('/api/')) {
        urlPath = urlPath.substring(urlPath.indexOf('/api/') + 4);
      }
      
      const response = await api.get(urlPath, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'tailored-cv.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error('Failed to download CV');
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6 animate-in slide-in-from-bottom-8 duration-500">
      <Card className="overflow-hidden">
        <div className="md:flex">
          <div className="bg-gray-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 md:w-1/3">
            <ScoreRing score={result.matchScore} size="lg" />
            <div className="mt-6 text-center">
              <h3 className="font-medium text-lg text-blue-950">Match Score</h3>
              <p className="text-sm text-gray-500 mt-1">Based on JD requirements</p>
            </div>
          </div>
          <div className="p-8 md:w-2/3">
            <h2 className="text-2xl font-medium text-blue-950 mb-4">Summary</h2>
            <p className="text-gray-700 leading-relaxed mb-6">{result.summary}</p>

            <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 flex gap-3 items-start">
              <div className="mt-0.5"><AlertCircle className="w-5 h-5 text-violet-600" /></div>
              <div>
                <h4 className="font-medium text-violet-900">Recommendation</h4>
                <p className="text-sm text-violet-800 mt-1">{result.recommendation}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Matched Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.matchedSkills.length > 0 ? (
              <div className="flex flex-wrap">{result.matchedSkills.map(s => <Badge key={s} variant="success" className="mr-2 mb-2">{s}</Badge>)}</div>
            ) : (
              <p className="text-sm text-gray-500">No strong skill matches found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Weak Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.weakMatches.length > 0 ? (
              <div className="flex flex-col gap-2">
                {result.weakMatches.map((w, idx) => (
                  <div key={idx} className="flex flex-col border border-amber-100 rounded p-2 bg-amber-50/50">
                    <span className="font-medium text-amber-800 text-sm">{w.skill}</span>
                    <span className="text-xs text-amber-600 mt-0.5">{w.note}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No weak skill matches found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Missing Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.missingSkills.length > 0 ? (
              <div className="flex flex-wrap">{result.missingSkills.map(s => <Badge key={s} variant="destructive" className="mr-2 mb-2">{s}</Badge>)}</div>
            ) : (
              <p className="text-sm text-gray-500">No missing skills detected.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-8">
        {thresholdMet && result.retailoredCv?.downloadUrl ? (
          <Button 
            size="lg" 
            className="gap-2 bg-emerald-600 hover:bg-emerald-700" 
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <Download className="w-5 h-5" />
            {isDownloading ? 'Downloading...' : 'Download Tailored CV'}
          </Button>
        ) : thresholdMet && !result.retailoredCv?.downloadUrl ? (
          <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700" disabled>
            <Download className="w-5 h-5" />
            Generating Tailored CV...
          </Button>
        ) : (
          !isAuthenticated && (
            <Button asChild size="lg" className="gap-2">
              <Link to="/auth/register">
                <UserPlus className="w-5 h-5" />
                Create account to track this application
              </Link>
            </Button>
          )
        )}
      </div>
    </div>
  );
}
