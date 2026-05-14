import { useMemo, useState } from 'react';
import {
  Search,
  ScrollText,
  Download,
  ExternalLink,
  Edit,
  Trash2,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi, type AdminCertificate } from '../../api/admin.api';
import { certificateApi } from '../../api/certificate.api';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { ConfirmModal } from '../../components/ui/Modal';
import Modal from '../../components/ui/Modal';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatDate } from '../../utils/format';

const useAllCertificates = () => {
  return useQuery({
    queryKey: ['admin', 'certificates'],
    queryFn: adminApi.getAllCertificates,
  });
};

const useAllUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.getAllUsers,
  });
};

const useAllCourses = () => {
  return useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: adminApi.getAllCourses,
  });
};

const AdminCertificates = () => {
  const queryClient = useQueryClient();

  const { data: certificates, isLoading: certsLoading } = useAllCertificates();
  const { data: users, isLoading: usersLoading } = useAllUsers();
  const { data: courses, isLoading: coursesLoading } = useAllCourses();

  const [search, setSearch] = useState('');
  const [activeCertificateId, setActiveCertificateId] = useState<number | null>(null);
  const [activeAction, setActiveAction] = useState<'view' | 'download' | null>(null);

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    certificate?: AdminCertificate;
  }>({ isOpen: false });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    certificateId?: number;
  }>({ isOpen: false });

  const [form, setForm] = useState({
    user_id: '',
    course_id: '',
    issued_at: '',
    certificate_url: '',
  });
  const [learnerFilter, setLearnerFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  const closeEditModal = () => {
    setEditModal({ isOpen: false });
    setLearnerFilter('');
    setCourseFilter('');
  };

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editModal.certificate) {
        throw new Error('No certificate selected');
      }

      return adminApi.updateCertificate(editModal.certificate.certificate_id, {
        user_id: parseInt(form.user_id, 10),
        course_id: parseInt(form.course_id, 10),
        issued_at: form.issued_at,
        certificate_url: form.certificate_url.trim() === '' ? null : form.certificate_url.trim(),
      });
    },
    onSuccess: () => {
      toast.success('Certificate updated successfully');
      closeEditModal();
      queryClient.invalidateQueries({ queryKey: ['admin', 'certificates'] });
    },
    onError: () => {
      toast.error('Unable to update certificate');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (certificateId: number) => adminApi.deleteCertificate(certificateId),
    onSuccess: () => {
      toast.success('Certificate deleted successfully');
      setDeleteModal({ isOpen: false });
      queryClient.invalidateQueries({ queryKey: ['admin', 'certificates'] });
    },
    onError: () => {
      toast.error('Unable to delete certificate');
    },
  });

  const openEditModal = (certificate: AdminCertificate) => {
    setEditModal({ isOpen: true, certificate });
    setLearnerFilter('');
    setCourseFilter('');
    setForm({
      user_id: String(certificate.user_id),
      course_id: String(certificate.course_id),
      issued_at: certificate.issued_at.slice(0, 10),
      certificate_url: certificate.certificate_url ?? '',
    });
  };

  const handleViewPdf = async (certificateId: number) => {
    try {
      setActiveCertificateId(certificateId);
      setActiveAction('view');

      const blob = await certificateApi.getPdfBlob(certificateId, 'inline');
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
    } catch {
      toast.error('Unable to open certificate right now');
    } finally {
      setActiveCertificateId(null);
      setActiveAction(null);
    }
  };

  const handleDownloadPdf = async (certificateId: number, courseTitle: string) => {
    try {
      setActiveCertificateId(certificateId);
      setActiveAction('download');

      const blob = await certificateApi.getPdfBlob(certificateId, 'attachment');
      const downloadUrl = URL.createObjectURL(blob);
      const fileName = `${courseTitle.replace(/[^a-zA-Z0-9]+/g, '_') || 'Certificate'}_${certificateId}.pdf`;

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch {
      toast.error('Unable to download certificate right now');
    } finally {
      setActiveCertificateId(null);
      setActiveAction(null);
    }
  };

  const isLoading = certsLoading || usersLoading || coursesLoading;
  if (isLoading) return <PageSpinner />;

  const allCertificates = certificates ?? [];
  const allUsers = users ?? [];
  const allCourses = courses ?? [];

  const selectedUser = allUsers.find((u) => u.user_id === parseInt(form.user_id, 10));
  const selectedCourse = allCourses.find((c) => c.course_id === parseInt(form.course_id, 10));

  const filteredLearners = useMemo(
    () => allUsers.filter((u) => {
      const q = learnerFilter.trim().toLowerCase();
      if (!q) return true;
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }),
    [allUsers, learnerFilter]
  );

  const filteredCourses = useMemo(
    () => allCourses.filter((c) => {
      const q = courseFilter.trim().toLowerCase();
      if (!q) return true;
      return c.title.toLowerCase().includes(q);
    }),
    [allCourses, courseFilter]
  );

  const filteredCertificates = useMemo(
    () => allCertificates.filter((cert) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;

      return (
        cert.learner_name.toLowerCase().includes(q) ||
        cert.learner_email.toLowerCase().includes(q) ||
        cert.course_title.toLowerCase().includes(q) ||
        String(cert.certificate_id).includes(q)
      );
    }),
    [allCertificates, search]
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ScrollText size={18} className="text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Certificates
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          View, edit, download, and manage all user certificates
        </p>
      </div>

      <Card padding="md">
        <CardHeader>
          <CardTitle>All Certificates</CardTitle>
        </CardHeader>

        <div className="mb-4">
          <Input
            placeholder="Search by learner, email, course, or certificate ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={15} />}
          />
        </div>

        {filteredCertificates.length === 0 ? (
          <EmptyState
            icon={<ScrollText size={24} />}
            title={search ? 'No certificates match your search' : 'No certificates yet'}
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-4 px-3 py-2 bg-gray-50 rounded-lg mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[980px]">
              <span>Certificate</span>
              <span>Learner</span>
              <span>Course</span>
              <span>Issued</span>
              <span>View</span>
              <span>Download</span>
              <span>Manage</span>
            </div>

            {filteredCertificates.map((cert) => (
              <div
                key={cert.certificate_id}
                className="grid grid-cols-7 gap-4 px-3 py-3 border-b border-gray-100 last:border-0 items-center min-w-[980px] hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">#{String(cert.certificate_id).padStart(6, '0')}</p>
                  <p className="text-xs text-gray-500 truncate">{cert.certificate_url || 'Generated on demand'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-900 truncate">{cert.learner_name}</p>
                  <p className="text-xs text-gray-500 truncate">{cert.learner_email}</p>
                </div>

                <div className="text-sm text-gray-800 truncate">{cert.course_title}</div>
                <div className="text-xs text-gray-500">{formatDate(cert.issued_at)}</div>

                <Button
                  variant="ghost"
                  size="sm"
                  isLoading={activeCertificateId === cert.certificate_id && activeAction === 'view'}
                  onClick={() => handleViewPdf(cert.certificate_id)}
                >
                  <ExternalLink size={14} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  isLoading={activeCertificateId === cert.certificate_id && activeAction === 'download'}
                  onClick={() => handleDownloadPdf(cert.certificate_id, cert.course_title)}
                >
                  <Download size={14} />
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(cert)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteModal({ isOpen: true, certificateId: cert.certificate_id })}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        title="Edit Certificate"
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
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Learner
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Selected: {selectedUser ? `${selectedUser.name} (${selectedUser.email})` : 'None'}
            </p>
            <Input
              placeholder="Filter learners by name or email..."
              value={learnerFilter}
              onChange={(e) => setLearnerFilter(e.target.value)}
              leftIcon={<Search size={14} />}
            />
            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
              {filteredLearners.map((u) => {
                const isSelected = String(u.user_id) === form.user_id;
                return (
                  <button
                    key={u.user_id}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, user_id: String(u.user_id) }))}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <p className="truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Course
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Selected: {selectedCourse ? selectedCourse.title : 'None'}
            </p>
            <Input
              placeholder="Filter courses by title..."
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              leftIcon={<Search size={14} />}
            />
            <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
              {filteredCourses.map((c) => {
                const isSelected = String(c.course_id) === form.course_id;
                return (
                  <button
                    key={c.course_id}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, course_id: String(c.course_id) }))}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <p className="truncate">{c.title}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            type="date"
            label="Issued Date"
            value={form.issued_at}
            onChange={(e) => setForm((prev) => ({ ...prev, issued_at: e.target.value }))}
          />

          <Input
            label="Certificate URL (optional)"
            value={form.certificate_url}
            onChange={(e) => setForm((prev) => ({ ...prev, certificate_url: e.target.value }))}
            placeholder="Leave blank to keep generated-on-demand behavior"
          />
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={() => {
          if (deleteModal.certificateId) {
            deleteMutation.mutate(deleteModal.certificateId);
          }
        }}
        title="Delete Certificate"
        message="This will permanently delete the certificate record. This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminCertificates;
