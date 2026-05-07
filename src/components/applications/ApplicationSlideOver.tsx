import { useState } from 'react';
import { X, ExternalLink, MessageSquarePlus, Trash2, FileText, Download } from 'lucide-react';
import { Application, ApplicationStatus, Note } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScoreRing } from '@/components/shared/ScoreRing';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

interface ApplicationSlideOverProps {
  application: Application | null;
  onClose: () => void;
}

export function ApplicationSlideOver({ application, onClose }: ApplicationSlideOverProps) {
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('GENERAL');
  const [status, setStatus] = useState<ApplicationStatus | ''>('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (url: string) => {
    setIsDownloading(true);
    try {
      let urlPath = url;
      if (urlPath.includes('/api/')) {
        urlPath = urlPath.substring(urlPath.indexOf('/api/') + 4);
      }
      
      const response = await api.get(urlPath, { responseType: 'blob' });
      const objectUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = objectUrl;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'application-cv.pdf';
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
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      toast.error('Failed to download CV');
    } finally {
      setIsDownloading(false);
    }
  };

  const queryClient = useQueryClient();

  const { data: notes } = useQuery<Note[]>({
    queryKey: ['notes', application?.id],
    queryFn: async () => {
      const { data } = await api.get(`/applications/${application?.id}/notes`);
      return data;
    },
    enabled: !!application?.id,
  });

  const { data: history } = useQuery<{ fromStatus: string, toStatus: string, note: string, changedAt: string }[]>({
    queryKey: ['history', application?.id],
    queryFn: async () => {
      const { data } = await api.get(`/applications/${application?.id}/history`);
      return data;
    },
    enabled: !!application?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: ApplicationStatus) => {
      await api.patch(`/applications/${application?.id}/status`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['history', application?.id] });
      toast.success('Status updated successfully');
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/applications/${application?.id}/notes`, { content: newNote, noteType });
    },
    onSuccess: () => {
      setNewNote('');
      queryClient.invalidateQueries({ queryKey: ['notes', application?.id] });
      toast.success('Note added');
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await api.delete(`/applications/${application?.id}/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', application?.id] });
      toast.success('Note deleted');
    }
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/applications/${application?.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application deleted');
      onClose();
    }
  });

  if (!application) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <header className="px-6 py-4 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
          <div className="flex gap-4 items-center">
            <ScoreRing score={application.matchScore} size="sm" className="w-12 h-12" />
            <div>
              <h2 className="text-lg font-semibold text-blue-950">{application.roleTitle}</h2>
              <p className="text-gray-500">{application.companyName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => {
              if (window.confirm('Are you sure you want to delete this application?')) {
                deleteApplicationMutation.mutate();
              }
            }} className="p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="overview" className="w-full">
            <div className="px-6 border-b border-gray-100 pt-4">
              <TabsList className="w-full justify-start bg-transparent h-auto p-0">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-2">Overview</TabsTrigger>
                <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-2">Notes</TabsTrigger>
                <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-violet-600 data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-2">History</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-6 space-y-6 m-0">
              <section>
                <h3 className="text-sm font-semibold text-blue-950 uppercase tracking-wider mb-3">Status Pipeline</h3>
                <div className="flex items-center gap-3">
                  <Select value={status || application.status} onValueChange={(val) => {
                    setStatus(val as ApplicationStatus);
                    updateStatusMutation.mutate(val as ApplicationStatus);
                  }}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ApplicationStatus.SAVED}>Saved</SelectItem>
                      <SelectItem value={ApplicationStatus.APPLIED}>Applied</SelectItem>
                      <SelectItem value={ApplicationStatus.PHONE_SCREEN}>Phone Screen</SelectItem>
                      <SelectItem value={ApplicationStatus.INTERVIEW}>Interview</SelectItem>
                      <SelectItem value={ApplicationStatus.FINAL_ROUND}>Final Round</SelectItem>
                      <SelectItem value={ApplicationStatus.OFFER}>Offer</SelectItem>
                      <SelectItem value={ApplicationStatus.ACCEPTED}>Accepted</SelectItem>
                      <SelectItem value={ApplicationStatus.DECLINED}>Declined</SelectItem>
                      <SelectItem value={ApplicationStatus.REJECTED}>Rejected</SelectItem>
                      <SelectItem value={ApplicationStatus.WITHDRAWN}>Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge variant="outline" className="text-xs">
                    Updated {new Date(application.appliedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </Badge>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-blue-950 uppercase tracking-wider mb-3">Application Document</h3>
                <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Tailored CV / Original</p>
                      <p className="text-xs text-gray-500">Document used for this application</p>
                    </div>
                  </div>
                  {application.cvDownloadUrl ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownload(application.cvDownloadUrl!)}
                      disabled={isDownloading}
                    >
                      <Download className="w-4 h-4 mr-2" /> 
                      {isDownloading ? 'Downloading...' : 'Download'}
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400">Not available</span>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-blue-950 uppercase tracking-wider mb-3 flex items-center justify-between">
                  Job Description
                  {application.jdUrl && (
                    <Button variant="ghost" size="sm" asChild className="h-8 gap-1 text-violet-600">
                      <a href={application.jdUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-3 h-3" /> View Original
                      </a>
                    </Button>
                  )}
                </h3>
                {application.jdText ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 max-h-64 overflow-y-auto whitespace-pre-wrap font-mono">
                    {application.jdText}
                  </div>
                ) : application.jdUrl ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                    Original JD URL is available via the link above.
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 max-h-64 overflow-y-auto whitespace-pre-wrap font-mono text-center">
                    No JD provided.
                  </div>
                )}
              </section>
            </TabsContent>

            <TabsContent value="notes" className="p-6 space-y-6 m-0 flex flex-col h-full">
              <div className="space-y-4">
                <Textarea
                  placeholder="Add a new note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-between items-center">
                  <Select value={noteType} onValueChange={setNoteType}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GENERAL">General</SelectItem>
                      <SelectItem value="INTERVIEW_PREP">Interview Prep</SelectItem>
                      <SelectItem value="RECRUITER_CONTACT">Recruiter Contact</SelectItem>
                      <SelectItem value="SALARY">Salary</SelectItem>
                      <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => addNoteMutation.mutate()}
                    disabled={!newNote.trim() || addNoteMutation.isPending}
                  >
                    <MessageSquarePlus className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </div>

              <div className="mt-8 space-y-4 relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-200" />
                {notes?.map((note) => (
                  <div key={note.id} className="relative pl-10 group">
                    <div className="absolute left-2 top-2 w-3 h-3 rounded-full border-2 border-white bg-violet-500 shadow-sm" />
                    <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm relative">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="text-[10px]">{note.noteType}</Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(note.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>

                      <button
                        onClick={() => deleteNoteMutation.mutate(note.id)}
                        className="absolute right-2 bottom-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {notes?.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No notes yet. Add one above.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="p-6 space-y-6 m-0 flex flex-col h-full">
              <div className="mt-4 space-y-4 relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gray-200" />
                {history?.map((h, i) => (
                  <div key={i} className="relative pl-10">
                    <div className="absolute left-2 top-2 w-3 h-3 rounded-full border-2 border-white bg-blue-500 shadow-sm" />
                    <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-950 border-blue-200">
                          {h.fromStatus && h.fromStatus !== h.toStatus ? `${h.fromStatus} → ${h.toStatus}` : h.toStatus}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(h.changedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      {h.note && <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2">{h.note}</p>}
                    </div>
                  </div>
                ))}
                {history?.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No history available.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
