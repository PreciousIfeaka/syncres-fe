import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutList, KanbanSquare, Search, Filter } from 'lucide-react';
import { ApplicationKanban } from '@/components/applications/ApplicationKanban';
import { ApplicationSlideOver } from '@/components/applications/ApplicationSlideOver';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Application } from '@/types';
import { api } from '@/lib/axios';
import { Skeleton } from '@/components/ui/skeleton';

export default function Applications() {
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ['applications', { search, status: statusFilter }],
    queryFn: async () => {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const { data } = await api.get('/applications', { params });
      return data.content || data; // Handle paginated or flat response
    },
  });

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-blue-950">Applications</h1>
          <p className="text-sm text-gray-500">Manage and track your job applications</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <Button 
              variant={view === 'kanban' ? 'default' : 'ghost'} 
              size="sm" 
              className={`h-8 px-2 ${view === 'kanban' ? 'bg-white text-blue-950 shadow-sm hover:bg-white' : 'text-gray-500'}`}
              onClick={() => setView('kanban')}
            >
              <KanbanSquare className="w-4 h-4 mr-2" /> Kanban
            </Button>
            <Button 
              variant={view === 'table' ? 'default' : 'ghost'} 
              size="sm" 
              className={`h-8 px-2 ${view === 'table' ? 'bg-white text-blue-950 shadow-sm hover:bg-white' : 'text-gray-500'}`}
              onClick={() => setView('table')}
            >
              <LayoutList className="w-4 h-4 mr-2" /> Table
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search company or role..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="SAVED">Saved</SelectItem>
            <SelectItem value="APPLIED">Applied</SelectItem>
            <SelectItem value="PHONE_SCREEN">Phone Screen</SelectItem>
            <SelectItem value="INTERVIEW">Interview</SelectItem>
            <SelectItem value="FINAL_ROUND">Final Round</SelectItem>
            <SelectItem value="OFFER">Offer</SelectItem>
            <SelectItem value="ACCEPTED">Accepted</SelectItem>
            <SelectItem value="DECLINED">Declined</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-h-0 relative">
        {isLoading ? (
          <div className="flex gap-6 h-full overflow-hidden">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="min-w-[280px] h-full bg-gray-50/50 rounded-lg p-3 space-y-3">
                <Skeleton className="h-5 w-24 mb-4" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            ))}
          </div>
        ) : applications && applications.length > 0 ? (
          view === 'kanban' ? (
            <ApplicationKanban 
              applications={applications} 
              onSelectApp={setSelectedApp} 
            />
          ) : (
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-medium">Company</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Score</th>
                    <th className="px-6 py-3 font-medium">Last Updated</th>
                    <th className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-blue-950">{app.companyName}</td>
                      <td className="px-6 py-4 text-gray-600">{app.roleTitle}</td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${app.matchScore >= 80 ? 'text-emerald-600' : app.matchScore >= 65 ? 'text-amber-600' : 'text-red-600'}`}>
                          {app.matchScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(app.appliedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)}>
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-500">
            <LayoutList className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium text-blue-950 mb-1">No applications found</p>
            <p className="text-sm mb-4">Try adjusting your filters or start a new match.</p>
          </div>
        )}
      </div>

      <ApplicationSlideOver 
        application={selectedApp} 
        onClose={() => setSelectedApp(null)} 
      />
    </div>
  );
}
