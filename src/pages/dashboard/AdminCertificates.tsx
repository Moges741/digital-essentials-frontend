import { useMemo, useState } from 'react';
import { Search, ScrollText, Download, ExternalLink, Award, ShieldCheck, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin.api';
import { certificateApi } from '../../api/certificate.api';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatDate } from '../../utils/format';

const useAllCertificates = () => {
  return useQuery({
    queryKey: ['admin', 'certificates'],
    queryFn: adminApi.getAllCertificates,
  });
};

const AdminCertificates = () => {
  const { data: certificates, isLoading } = useAllCertificates();
  const [search, setSearch] = useState('');
  const [activeCertificateId, setActiveCertificateId] = useState<number | null>(null);
  const [activeAction, setActiveAction] = useState<'view' | 'download' | null>(null);

  const allCertificates = certificates ?? [];

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

  const stats = useMemo(() => {
    const withUrls = allCertificates.filter((cert) => Boolean(cert.certificate_url)).length;
    return {
      total: allCertificates.length,
      withUrls,
      generatedOnDemand: allCertificates.length - withUrls,
    };
  }, [allCertificates]);

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

  if (isLoading) return <PageSpinner />;

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-sky-50 p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="rounded-2xl bg-white p-3 shadow-sm border border-primary-100">
            <ScrollText size={22} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Certificates Vault</h1>
            <p className="text-sm text-gray-600 mt-1">
              View issued certificates, open them, and download verified copies.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/80 border border-white/60 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-2">
              <Award size={14} /> Total certificates
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-2">
              <ShieldCheck size={14} /> Active URLs
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.withUrls}</p>
          </div>
          <div className="rounded-2xl bg-white/80 border border-white/60 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500 flex items-center gap-2">
              <FileText size={14} /> Generated on demand
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.generatedOnDemand}</p>
          </div>
        </div>
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
          <div className="space-y-3 overflow-x-auto">
            <div className="grid grid-cols-7 gap-4 px-3 py-2 bg-gray-50 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[980px]">
              <span>Certificate</span>
              <span>Learner</span>
              <span>Course</span>
              <span>Issued</span>
              <span>View</span>
              <span>Download</span>
              <span>Status</span>
            </div>

            {filteredCertificates.map((cert) => (
              <div
                key={cert.certificate_id}
                className="grid grid-cols-7 gap-4 px-3 py-4 border border-gray-100 rounded-2xl items-center min-w-[980px] bg-white shadow-sm hover:shadow-md transition-shadow"
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
                  className="justify-start"
                >
                  <ExternalLink size={14} />
                  View
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  isLoading={activeCertificateId === cert.certificate_id && activeAction === 'download'}
                  onClick={() => handleDownloadPdf(cert.certificate_id, cert.course_title)}
                  className="justify-start"
                >
                  <Download size={14} />
                  Download
                </Button>

                <div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cert.certificate_url ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {cert.certificate_url ? 'Available' : 'Generated'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminCertificates;
