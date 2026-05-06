import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Trash2, Calendar, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cv } from '@/types';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

interface CvCardProps {
  cv: Cv;
  onDelete: (cv: Cv) => void;
  onUseInMatch?: (cv: Cv) => void;
  onView?: (cv: Cv) => void;
}

export function CvCard({ cv, onDelete, onUseInMatch, onView }: CvCardProps) {
  const isPdf = cv.originalFilename?.toLowerCase().endsWith('.pdf');
  
  return (
    <Card 
      className={`hover:border-violet-300 transition-colors shadow-sm group flex flex-col h-full ${onView ? 'cursor-pointer' : ''}`}
      onClick={(e) => {
        // Prevent click from firing if we click a button inside the card
        if ((e.target as HTMLElement).closest('button')) return;
        if (onView) onView(cv);
      }}
    >
      <CardContent className="p-5 flex flex-col h-full flex-1">
        <div className="flex items-start justify-between mb-4 w-full">
          <div className="flex items-center gap-3 w-full">
            <div className={`p-2 rounded-lg shrink-0 ${isPdf ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-blue-950 truncate w-full" title={cv.originalFilename}>{cv.originalFilename}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {new Date(cv.uploadedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 flex gap-2">
          {onUseInMatch && (
            <Button 
              variant="secondary" 
              className="flex-1 text-xs h-8"
              onClick={() => onUseInMatch(cv)}
            >
              <Search className="w-3 h-3 mr-1.5" /> Use in Match
            </Button>
          )}
          <Button 
            variant="ghost" 
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 px-2 h-8"
            onClick={() => onDelete(cv)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
