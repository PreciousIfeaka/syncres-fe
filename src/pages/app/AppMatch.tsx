import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileDropzone } from '@/components/shared/FileDropzone';
import { Textarea } from '@/components/ui/textarea';
import { MatchProgress } from '@/components/match/MatchProgress';
import { MatchResultPanel } from '@/components/match/MatchResultPanel';
import { matchService } from '@/services/match.service';
import { useMatchPolling } from '@/hooks/useMatchPolling';
import { api } from '@/lib/axios';
import { Cv } from '@/types';
import { toast } from 'sonner';
import { FileText, Calendar, AlertCircle } from 'lucide-react';

export default function AppMatch() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialCvId = location.state?.cvId;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [cvData, setCvData] = useState<{ id?: string; file?: File; text?: string }>({});
  const [jobId, setJobId] = useState<string | null>(null);
  const [saveAsApplication, setSaveAsApplication] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFormData, setSaveFormData] = useState({ company: '', role: '' });
  const [matchMetadata, setMatchMetadata] = useState({ companyName: '', roleTitle: '' });

  const { data: cvs, isLoading: cvsLoading } = useQuery<Cv[]>({
    queryKey: ['cvs'],
    queryFn: async () => {
      const { data } = await api.get('/cv');
      return data;
    },
  });

  const { data: jobInfo } = useMatchPolling(jobId);

  useEffect(() => {
    if (initialCvId) {
      setCvData({ id: initialCvId });
      setStep(2);
    }
  }, [initialCvId]);

  useEffect(() => {
    if (jobInfo) {
      if (jobInfo.status === 'COMPLETED' && jobInfo.result) {
        setTimeout(() => setStep(4), 1000);
      } else if (jobInfo.status === 'FAILED') {
        toast.error(jobInfo.errorMessage || 'Match analysis failed');
        setStep(2);
        setJobId(null);
      }
    }
  }, [jobInfo]);

  const handleJdSubmit = async (data: { url?: string; text?: string }) => {
    setStep(3);
    try {
      const response = await matchService.submitMatch({
        cvId: cvData.id,
        cvFile: cvData.file,
        jdText: data.text,
        jdUrl: data.url,
        companyName: matchMetadata.companyName,
        roleTitle: matchMetadata.roleTitle,
        saveAsApplication
      });
      setJobId(response.jobId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start match');
      setStep(2);
    }
  };

  const saveAppMutation = useMutation({
    mutationFn: async (data: { company: string; role: string; jobId: string }) => {
      await api.post('/applications', data);
    },
    onSuccess: () => {
      toast.success('Saved to tracked applications');
      navigate('/app/applications');
    },
    onError: () => toast.error('Failed to save application')
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-blue-950">Match CV</h1>
          <p className="text-sm text-gray-500">Compare your resume against a specific job description.</p>
        </div>
      </div>

      {step === 1 && (
        <Card className="max-w-3xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle>Select or Upload CV</CardTitle>
            <CardDescription>Choose an existing CV from your library or upload a new one.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="library">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="library">My CVs</TabsTrigger>
                <TabsTrigger value="upload">Upload New</TabsTrigger>
              </TabsList>
              <TabsContent value="library" className="space-y-4">
                {cvsLoading ? (
                  <p className="text-sm text-gray-500">Loading CVs...</p>
                ) : cvs && cvs.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {cvs.map(cv => (
                      <div
                        key={cv.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${cvData.id === cv.id ? 'border-violet-600 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`}
                        onClick={() => setCvData({ id: cv.id })}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded-md">
                            <FileText className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-blue-950 truncate">{cv.originalFilename}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(cv.uploadedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 p-8 text-center border-2 border-dashed rounded-lg">No saved CVs. Please upload one.</p>
                )}
                <div className="mt-6 flex justify-end">
                  <Button disabled={!cvData.id} onClick={() => setStep(2)}>Continue to JD</Button>
                </div>
              </TabsContent>
              <TabsContent value="upload" className="space-y-4">
                <FileDropzone
                  onFileSelect={(file) => setCvData({ file })}
                  selectedFile={cvData.file}
                />
                <div className="mt-6 flex justify-end">
                  <Button disabled={!cvData.file} onClick={() => setStep(2)}>Continue to JD</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="max-w-2xl mx-auto mt-8 animate-in fade-in slide-in-from-right-4">
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
            <CardDescription>Enter the job posting details to match against.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Important:</strong> Please provide the Company Name and Role Title below if the job description (URL or Text) does not explicitly state them. If the matching engine cannot detect them from the JD, the process will fail.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="match-company">Company Name (Optional)</Label>
                <Input
                  id="match-company"
                  placeholder="e.g. Acme Corp"
                  value={matchMetadata.companyName}
                  onChange={(e) => setMatchMetadata({ ...matchMetadata, companyName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="match-role">Role Title (Optional)</Label>
                <Input
                  id="match-role"
                  placeholder="e.g. Senior Developer"
                  value={matchMetadata.roleTitle}
                  onChange={(e) => setMatchMetadata({ ...matchMetadata, roleTitle: e.target.value })}
                />
              </div>
            </div>

            <Tabs defaultValue="url">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="url">Enter URL</TabsTrigger>
                <TabsTrigger value="paste">Paste Text</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="space-y-4">
                <Input
                  id="jd-url"
                  type="url"
                  placeholder="https://company.com/careers/job-123"
                />
              </TabsContent>
              <TabsContent value="paste" className="space-y-4">
                <Textarea
                  id="jd-text"
                  placeholder="Paste the job requirements and description here..."
                  className="h-48 resize-none"
                />
              </TabsContent>
            </Tabs>
            <div className="flex items-center space-x-2 mt-4">
              <input 
                type="checkbox" 
                id="saveAsApplication" 
                className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                checked={saveAsApplication}
                onChange={(e) => setSaveAsApplication(e.target.checked)}
              />
              <Label htmlFor="saveAsApplication" className="text-sm font-medium leading-none cursor-pointer">
                Track as Application automatically
              </Label>
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button
                onClick={() => {
                  const urlEl = document.getElementById('jd-url') as HTMLInputElement;
                  const textEl = document.getElementById('jd-text') as HTMLTextAreaElement;
                  if (urlEl?.value) handleJdSubmit({ url: urlEl.value });
                  else if (textEl?.value) handleJdSubmit({ text: textEl.value });
                }}
              >
                Analyse Match
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && <MatchProgress status={jobInfo?.status} />}

      {step === 4 && jobInfo?.result && (
        <div className="animate-in fade-in duration-500">
          {!saveAsApplication && (
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowSaveDialog(true)} variant="outline">
                Save as Application
              </Button>
            </div>
          )}
          <MatchResultPanel result={jobInfo.result} />
        </div>
      )}

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Application</DialogTitle>
            <DialogDescription>
              Track this job in your pipeline to easily access your notes, status, and tailored CV.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={saveFormData.company}
                onChange={(e) => setSaveFormData({ ...saveFormData, company: e.target.value })}
                placeholder="Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role / Job Title</Label>
              <Input
                id="role"
                value={saveFormData.role}
                onChange={(e) => setSaveFormData({ ...saveFormData, role: e.target.value })}
                placeholder="Senior Frontend Engineer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button
              onClick={() => saveAppMutation.mutate({ ...saveFormData, jobId: jobId! })}
              disabled={!saveFormData.company || !saveFormData.role || saveAppMutation.isPending}
            >
              {saveAppMutation.isPending ? 'Saving...' : 'Save Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
