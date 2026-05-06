import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface JdInputStepProps {
  onSubmit: (data: { url?: string; text?: string }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function JdInputStep({ onSubmit, onBack, isLoading }: JdInputStepProps) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState('url');

  const handleSubmit = () => {
    if (activeTab === 'url' && url.trim()) {
      onSubmit({ url: url.trim() });
    } else if (activeTab === 'paste' && text.trim()) {
      onSubmit({ text: text.trim() });
    }
  };

  const isUrlValid = activeTab === 'url' && url.trim().length > 5;
  const isPasteValid = activeTab === 'paste' && text.trim().length > 50;

  return (
    <Card className="max-w-2xl mx-auto mt-8 animate-in fade-in slide-in-from-right-4">
      <CardHeader>
        <CardTitle>Step 2: Add the Job Description</CardTitle>
        <CardDescription>Enter a URL to a job posting or paste the description text.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="url">Enter URL</TabsTrigger>
            <TabsTrigger value="paste">Paste Text</TabsTrigger>
          </TabsList>
          <TabsContent value="url" className="space-y-4">
            <Input
              type="url"
              placeholder="https://company.com/careers/job-123"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </TabsContent>
          <TabsContent value="paste" className="space-y-4">
            <Textarea
              placeholder="Paste the job requirements and description here..."
              className="h-48 resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </TabsContent>
        </Tabs>
        <div className="mt-6 flex justify-between">
          <Button variant="ghost" onClick={onBack} disabled={isLoading}>Back</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!(isUrlValid || isPasteValid) || isLoading}
          >
            {isLoading ? 'Starting Match...' : 'Analyse Match'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
