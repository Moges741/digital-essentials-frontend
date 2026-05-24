import { useMemo, useState } from 'react';
import { Search, Users, Award, Mail, BadgeCheck, Sparkles, CalendarDays } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { formatDate } from '../../utils/format';

const useAllInstructors = () => {
  return useQuery({
    queryKey: ['admin', 'instructors'],
    queryFn: adminApi.getAllInstructors,
  });
};

const AdminInstructors = () => {
  const { data: instructors, isLoading } = useAllInstructors();
  const [search, setSearch] = useState('');

  const allInstructors = instructors ?? [];
  const filteredInstructors = allInstructors.filter((instructor) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      instructor.name.toLowerCase().includes(q) ||
      instructor.email.toLowerCase().includes(q) ||
      instructor.specialization.toLowerCase().includes(q)
    );
  });

  const stats = useMemo(() => {
    const active = allInstructors.filter((instructor) => instructor.is_active).length;
    return {
      total: allInstructors.length,
      active,
      inactive: allInstructors.length - active,
    };
  }, [allInstructors]);


  if (isLoading) return <PageSpinner />;
  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-3xl border border-primary-100 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="rounded-2xl bg-white p-3 shadow-sm border border-amber-100">
            <Award size={22} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mentor Directory</h1>
            <p className="text-sm text-gray-600 mt-1">
              View every mentor profile in a clean read-only directory.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/80 border border-white/60 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-2">
              <Users size={14} /> Total mentors
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-2">
              <BadgeCheck size={14} /> Active mentors
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.active}</p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-2">
              <Sparkles size={14} /> Inactive mentors
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.inactive}</p>
          </div>
        </div>
      </div>

      <Card padding="md">
        <CardHeader>
          <CardTitle>All Mentors ({filteredInstructors.length})</CardTitle>
        </CardHeader>

        <div className="mb-6">
          <Input
            placeholder="Search by name, email, or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={15} />}
          />
        </div>

        {filteredInstructors.length === 0 ? (
          <EmptyState
            icon={<Users size={24} />}
            title={search ? 'No mentors match your search' : 'No mentors yet'}
            description="Mentors will appear here when users register with the instructor role."
          />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {filteredInstructors.map((instructor) => (
              <div
                key={instructor.user_id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{instructor.name}</h3>
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                        Mentor
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-2 truncate">
                      <Mail size={12} />
                      {instructor.email}
                    </p>
                  </div>

                  <Badge variant={instructor.is_active ? 'success' : 'neutral'} size="sm">
                    {instructor.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl bg-amber-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Specialization</p>
                    <p className="text-sm font-semibold text-amber-800 break-words">{instructor.specialization}</p>
                  </div>

                  <div className="rounded-xl bg-sky-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Account status</p>
                    <p className="text-sm font-semibold text-sky-800">
                      {instructor.is_active ? 'Visible in the system' : 'Temporarily inactive'}
                    </p>
                  </div>
                </div>

                {instructor.qualifications && (
                  <div className="rounded-xl bg-gray-50 p-3 mb-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Qualifications</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {instructor.qualifications}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                  <div className="rounded-xl border border-gray-100 p-3">
                    <p className="font-medium text-gray-500 flex items-center gap-1 mb-1"><CalendarDays size={12} /> Joined</p>
                    <p className="text-gray-800">{formatDate(instructor.created_at)}</p>
                  </div>
                  <div className="rounded-xl border border-gray-100 p-3">
                    <p className="font-medium text-gray-500 flex items-center gap-1 mb-1"><CalendarDays size={12} /> Updated</p>
                    <p className="text-gray-800">{formatDate(instructor.updated_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminInstructors;
