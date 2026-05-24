import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { instructorApplicationApi,  } from '../../api/instructor-application.api';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatDate } from '../../utils/format';

const AdminInstructorApplications = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: applications, isLoading } = useQuery({
    queryKey: ['admin', 'instructor-applications'],
    queryFn: instructorApplicationApi.getAll,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'approved' | 'rejected' }) =>
      instructorApplicationApi.updateStatus(id, status),
    onSuccess: (data) => {
      toast.success(`Application ${data.status} successfully`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'instructor-applications'] });
      // Also invalidate instructors list if approved
      if (data.status === 'approved') {
        queryClient.invalidateQueries({ queryKey: ['admin', 'instructors'] });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update application status');
    },
  });

  if (isLoading) return <PageSpinner />;

  const allApplications = applications ?? [];
  const filteredApplications = allApplications.filter((app) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      app.name.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText size={18} className="text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Instructor Applications</h1>
        </div>
        <p className="text-sm text-gray-500">
          Review and approve or reject applications to become a instructor
        </p>
      </div>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>

        <div className="mb-6">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={15} />}
          />
        </div>

        {filteredApplications.length === 0 ? (
          <EmptyState
            icon={<FileText size={24} />}
            title={search ? 'No applications match your search' : 'No applications yet'}
            description="When users apply to be instructors, their applications will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="border border-gray-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">{app.name}</h3>
                      <p className="text-xs text-gray-500">{app.email}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{app.phone_number}</p>
                    </div>
                    <Badge
                      variant={
                        app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'
                      }
                      size="sm"
                    >
                      {app.status === 'pending' && <Clock size={12} className="mr-1 inline" />}
                      {app.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-2">
                        Documents
                      </p>
                      <div className="flex flex-col gap-2">
                        <a
                          href={app.academic_file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                        >
                          <FileText size={14} /> Academic File
                        </a>
                        <a
                          href={app.national_id_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                        >
                          <FileText size={14} /> National ID
                        </a>
                      </div>
                    </div>

                    {(app.linkedin_link || app.github_link) && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-2">
                          Online Presence
                        </p>
                        <div className="flex flex-col gap-2">
                          {app.linkedin_link && (
                            <a
                              href={app.linkedin_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-600 hover:underline truncate"
                            >
                              LinkedIn Profile
                            </a>
                          )}
                          {app.github_link && (
                            <a
                              href={app.github_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-gray-800 hover:underline truncate"
                            >
                              GitHub Profile
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      <p>Applied on {formatDate(app.created_at)}</p>
                    </div>
                  </div>
                </div>

                {app.status === 'pending' && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth
                      onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'rejected' })}
                      isLoading={updateStatusMutation.isPending}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <XCircle size={14} className="mr-1" /> Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'approved' })}
                      isLoading={updateStatusMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle size={14} className="mr-1" /> Approve
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminInstructorApplications;
