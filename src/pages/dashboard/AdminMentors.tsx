import { useState } from 'react';
import { Search, Users, Award, Mail, Edit2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi, type AdminMentor } from '../../api/admin.api';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { PageSpinner } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { formatDate } from '../../utils/format';

const useAllMentors = () => {
  return useQuery({
    queryKey: ['admin', 'mentors'],
    queryFn: adminApi.getAllMentors,
  });
};

const AdminMentors = () => {
  const queryClient = useQueryClient();
  const { data: mentors, isLoading } = useAllMentors();
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    mentor?: AdminMentor;
  }>({ isOpen: false });

  const [form, setForm] = useState({
    specialization: '',
    qualifications: '',
  });

  const closeEditModal = () => {
    setEditModal({ isOpen: false });
    setForm({ specialization: '', qualifications: '' });
  };

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editModal.mentor) {
        throw new Error('No mentor selected');
      }

      return adminApi.updateMentorProfile(editModal.mentor.user_id, {
        specialization: form.specialization.trim(),
        qualifications: form.qualifications.trim() === '' ? undefined : form.qualifications.trim(),
      });
    },
    onSuccess: () => {
      toast.success('Mentor profile updated successfully');
      closeEditModal();
      queryClient.invalidateQueries({ queryKey: ['admin', 'mentors'] });
    },
    onError: () => {
      toast.error('Unable to update mentor profile');
    },
  });

  const openEditModal = (mentor: AdminMentor) => {
    setEditModal({ isOpen: true, mentor });
    setForm({
      specialization: mentor.specialization,
      qualifications: mentor.qualifications || '',
    });
  };

  if (isLoading) return <PageSpinner />;

  const allMentors = mentors ?? [];
  const filteredMentors = allMentors.filter((mentor) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      mentor.name.toLowerCase().includes(q) ||
      mentor.email.toLowerCase().includes(q) ||
      mentor.specialization.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Award size={18} className="text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Manage Mentors</h1>
        </div>
        <p className="text-sm text-gray-500">
          View and manage mentor specializations and qualifications
        </p>
      </div>

      <Card padding="md">
        <CardHeader>
          <CardTitle>All Mentors ({filteredMentors.length})</CardTitle>
        </CardHeader>

        <div className="mb-6">
          <Input
            placeholder="Search by name, email, or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={15} />}
          />
        </div>

        {filteredMentors.length === 0 ? (
          <EmptyState
            icon={<Users size={24} />}
            title={search ? 'No mentors match your search' : 'No mentors yet'}
            description="Mentors will appear here when users register with mentor role"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor.user_id}
                className="border border-gray-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{mentor.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Mail size={12} />
                      {mentor.email}
                    </p>
                  </div>
                  <Badge
                    variant={mentor.is_active ? 'success' : 'neutral'}
                    size="sm"
                  >
                    {mentor.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Info Grid */}
                <div className="space-y-3 mb-4">
                  {/* Specialization */}
                  <div className="bg-primary-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
                      Specialization
                    </p>
                    <p className="text-sm font-semibold text-primary-700">
                      {mentor.specialization}
                    </p>
                  </div>

                  {/* Qualifications */}
                  {mentor.qualifications && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">
                        Qualifications
                      </p>
                      <p className="text-sm text-blue-700 line-clamp-2">
                        {mentor.qualifications}
                      </p>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-gray-600">
                      <p className="font-medium text-gray-500">Joined</p>
                      <p className="text-gray-700 mt-0.5">{formatDate(mentor.created_at)}</p>
                    </div>
                    <div className="text-gray-600">
                      <p className="font-medium text-gray-500">Updated</p>
                      <p className="text-gray-700 mt-0.5">{formatDate(mentor.updated_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => openEditModal(mentor)}
                  className="flex items-center justify-center gap-2"
                >
                  <Edit2 size={14} />
                  Edit Profile
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        title={`Edit Mentor: ${editModal.mentor?.name}`}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={closeEditModal}
            >
              Cancel
            </Button>
            <Button
              onClick={() => updateMutation.mutate()}
              isLoading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Email Info */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Email
            </label>
            <input
              type="email"
              disabled
              value={editModal.mentor?.email || ''}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-600"
            />
          </div>

          {/* Specialization */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Specialization <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Data Science, Web Development, Design"
              value={form.specialization}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  specialization: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              Main area of expertise (required)
            </p>
          </div>

          {/* Qualifications */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Qualifications
            </label>
            <textarea
              placeholder="e.g., B.S. in Computer Science, AWS Certified Solutions Architect, 10+ years of experience..."
              value={form.qualifications}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  qualifications: e.target.value,
                }))
              }
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Degrees, certifications, and professional experience (optional)
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Changes will be visible immediately to learners and mentors in the system.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminMentors;
