import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, Target, Calendar, Award, Search } from 'lucide-react';
import { api } from '@/lib/axios';
import { Application, Stats } from '@/types';

const fetchStats = async (): Promise<Stats> => {
  const { data } = await api.get('/applications/stats');
  return data;
};

const fetchRecentApplications = async (): Promise<Application[]> => {
  const { data } = await api.get('/applications');
  const arr = Array.isArray(data) ? data : (data.content || []);
  
  // Sort by appliedAt (descending) and return top 5
  return arr
    .sort((a: any, b: any) => new Date(b.appliedAt || b.createdAt).getTime() - new Date(a.appliedAt || a.createdAt).getTime())
    .slice(0, 5);
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['applications', 'recent'],
    queryFn: fetchRecentApplications,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OFFER':
      case 'ACCEPTED':
        return <Badge variant="success">{status}</Badge>;
      case 'PHONE_SCREEN':
      case 'INTERVIEW':
      case 'FINAL_ROUND':
        return <Badge variant="warning">{status.replace('_', ' ')}</Badge>;
      case 'APPLIED': return <Badge variant="secondary">Applied</Badge>;
      case 'REJECTED':
      case 'DECLINED':
      case 'WITHDRAWN':
        return <Badge variant="destructive">{status}</Badge>;
      case 'SAVED': return <Badge variant="outline">Saved</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-blue-950">Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of your job search progress</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/app/match">
            <Search className="w-4 h-4" />
            Run New Match
          </Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-gray-500">Total Applications</p>
              <Briefcase className="h-4 w-4 text-gray-400" />
            </div>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-gray-500">Avg Match Score</p>
              <Target className="h-4 w-4 text-gray-400" />
            </div>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold">{stats?.averageMatchScore?.toFixed(0) || 0}%</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-gray-500">Applied This Month</p>
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold">{stats?.applicationsLast30Days || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-gray-500">Offers Received</p>
              <Award className="h-4 w-4 text-gray-400" />
            </div>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold">{stats?.statusBreakdown?.['OFFER'] || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-7 gap-8">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Your latest tracked job opportunities.</CardDescription>
          </CardHeader>
          <CardContent>
            {appsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : applications?.length ? (
              <div className="rounded-md border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium text-blue-950">{app.companyName}</TableCell>
                        <TableCell className="text-gray-600">{app.roleTitle}</TableCell>
                        <TableCell>
                          <div className={`font-medium ${app.matchScore >= 80 ? 'text-emerald-600' : app.matchScore >= 65 ? 'text-amber-600' : 'text-red-600'}`}>
                            {app.matchScore}%
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500 mb-4">No applications tracked yet.</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/app/applications">View All Applications</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Match Score Trend</CardTitle>
            <CardDescription>Your performance over the last 10 matches.</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : stats?.statusBreakdown ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="99%" height="100%" minHeight={250}>
                  <LineChart data={stats ? Object.entries(stats.statusBreakdown).map(([name, count]) => ({ name, count })) : []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                      itemStyle={{ color: '#7C3AED', fontWeight: 500 }}
                    />
                    <Line
                      type="step"
                      dataKey="count"
                      stroke="#7C3AED"
                      strokeWidth={3}
                      dot={{ fill: '#7C3AED', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center border border-dashed rounded-lg bg-gray-50">
                <p className="text-sm text-gray-500">Not enough data to display chart.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
