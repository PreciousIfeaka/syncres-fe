import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/shared/FileDropzone';
import { Textarea } from '@/components/ui/textarea';

interface CvInputStepProps {
  onSubmit: (data: { file?: File; text?: string }) => void;
}

export function CvInputStep({ onSubmit }: CvInputStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  const handleSubmit = () => {
    if (activeTab === 'upload' && file) {
      onSubmit({ file });
    } else if (activeTab === 'paste' && text.trim()) {
      onSubmit({ text: text.trim() });
    }
  };

  const isUploadValid = activeTab === 'upload' && file !== null;
  const isPasteValid = activeTab === 'paste' && text.trim().length > 50;

  return (
    <Card className="max-w-2xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4">
      <CardHeader>
        <CardTitle>Step 1: Provide your CV</CardTitle>
        <CardDescription>Upload your resume document or paste the text content directly.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="paste">Paste Text</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="space-y-4">
            <FileDropzone onFileSelect={setFile} selectedFile={file} />
          </TabsContent>
          <TabsContent value="paste" className="space-y-4">
            <Textarea
              placeholder="Paste your resume text here..."
              className="h-48 resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </TabsContent>
        </Tabs>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!(isUploadValid || isPasteValid)}
          >
            Continue to Job Description
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
