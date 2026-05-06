import { Application, ApplicationStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface ApplicationKanbanProps {
  applications: Application[];
  onSelectApp: (app: Application) => void;
}

const COLUMNS = [
  { id: ApplicationStatus.SAVED, label: 'Saved' },
  { id: ApplicationStatus.APPLIED, label: 'Applied' },
  { id: ApplicationStatus.PHONE_SCREEN, label: 'Phone Screen' },
  { id: ApplicationStatus.INTERVIEW, label: 'Interview' },
  { id: ApplicationStatus.FINAL_ROUND, label: 'Final Round' },
  { id: ApplicationStatus.OFFER, label: 'Offer' },
  { id: ApplicationStatus.ACCEPTED, label: 'Accepted' },
  { id: ApplicationStatus.DECLINED, label: 'Declined' },
  { id: ApplicationStatus.REJECTED, label: 'Rejected' },
  { id: ApplicationStatus.WITHDRAWN, label: 'Withdrawn' },
];

export function ApplicationKanban({ applications, onSelectApp }: ApplicationKanbanProps) {
  const getDaysAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 3600 * 24));
    return days === 0 ? 'Today' : `${days}d ago`;
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
      {COLUMNS.map((column) => {
        const columnApps = applications.filter(app => app.status === column.id);

        return (
          <div key={column.id} className="min-w-[280px] w-[280px] shrink-0 snap-center flex flex-col bg-gray-50/50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-medium text-blue-950 text-sm">{column.label}</h3>
              <Badge variant="secondary" className="px-1.5 py-0 min-w-[20px] justify-center">
                {columnApps.length}
              </Badge>
            </div>

            <div className="flex flex-col gap-3 flex-1">
              {columnApps.map((app) => (
                <Card
                  key={app.id}
                  className="cursor-pointer hover:border-violet-300 transition-colors shadow-sm"
                  onClick={() => onSelectApp(app)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium text-blue-950 truncate">{app.roleTitle}</h4>
                    <p className="text-sm text-gray-500 truncate mb-3">{app.companyName}</p>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {getDaysAgo(app.appliedAt || app.createdAt)}
                      </div>
                      <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${app.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                          app.matchScore >= 65 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {app.matchScore}% Match
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {columnApps.length === 0 && (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg py-8 text-sm text-gray-400">
                  No applications
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
