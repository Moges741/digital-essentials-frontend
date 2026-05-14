
import { useMemo, useState } from 'react';
import { Award, Download, ExternalLink, Calendar, UserRound } from 'lucide-react';
import { useMyCertificates } from '../../hooks/useCertificates';
import { certificateApi } from '../../api/certificate.api';
import Card                  from '../../components/ui/Card';
import Button                from '../../components/ui/Button';
import EmptyState            from '../../components/ui/EmptyState';
import { PageSpinner }       from '../../components/ui/Spinner';
import { formatDate }        from '../../utils/format';
import toast                 from 'react-hot-toast';

const CertificatesPage = () => {
  const { data: certificates, isLoading } = useMyCertificates();
  const [activeCertificateId, setActiveCertificateId] = useState<number | null>(null);
  const [activeAction, setActiveAction] = useState<'view' | 'download' | null>(null);

  const totalCertificates = useMemo(
    () => certificates?.length ?? 0,
    [certificates]
  );

  const handleViewPdf = async (certificate_id: number) => {
    try {
      setActiveCertificateId(certificate_id);
      setActiveAction('view');

      const blob = await certificateApi.getPdfBlob(certificate_id, 'inline');
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');

      // Release memory after opening
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
    } catch {
      toast.error('Unable to open certificate right now. Please try again.');
    } finally {
      setActiveCertificateId(null);
      setActiveAction(null);
    }
  };

  const handleDownloadPdf = async (
    certificate_id: number,
    course_title: string
  ) => {
    try {
      setActiveCertificateId(certificate_id);
      setActiveAction('download');

      const blob = await certificateApi.getPdfBlob(certificate_id, 'attachment');
      const downloadUrl = URL.createObjectURL(blob);
      const fileName = `${course_title.replace(/[^a-zA-Z0-9]+/g, '_') || 'Certificate'}_${certificate_id}.pdf`;

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch {
      toast.error('Unable to download certificate right now. Please try again.');
    } finally {
      setActiveCertificateId(null);
      setActiveAction(null);
    }
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-50 rounded-xl
                          flex items-center justify-center">
          <Award size={20} className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            My Certificates
          </h1>
          <p className="text-sm text-gray-500">
            {totalCertificates} certificate
            {totalCertificates !== 1 ? 's' : ''} earned
          </p>
        </div>
      </div>

      {/* Certificates grid */}
      {!certificates?.length ? (
        <EmptyState
          icon={<Award size={28} />}
          title="No certificates yet"
          description="Complete all lessons in a course to earn your certificate."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {certificates.map((cert) => (
            <Card
              key={cert.certificate_id}
              padding="none"
              className="overflow-hidden border border-slate-200 shadow-md"
            >
              <div className="p-3 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
                <div className="aspect-[16/10] rounded-md bg-white px-5 py-4 border-2 border-amber-300 flex flex-col">
                  <p className="text-[9px] tracking-[0.22em] text-center text-slate-500 font-semibold uppercase">
                    Digital Essentials Platform
                  </p>
                  <h3 className="mt-1 text-center text-slate-900 font-bold text-sm md:text-base uppercase tracking-wide">
                    Certificate of Completion
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-px flex-1 bg-amber-300" />
                    <Award size={12} className="text-amber-500" />
                    <div className="h-px flex-1 bg-amber-300" />
                  </div>

                  <p className="mt-2 text-center text-[10px] text-slate-600">
                    Presented to
                  </p>
                  <p className="mt-0.5 text-center text-sm md:text-base font-semibold text-blue-950 italic line-clamp-1">
                    {cert.learner_name ?? cert.user_name ?? cert.creator_name ?? 'Learner'}
                  </p>

                  <p className="mt-2 text-center text-[10px] text-slate-600">
                    For successfully completing
                  </p>
                  <p className="mt-0.5 text-center text-[12px] md:text-sm font-bold text-slate-900 line-clamp-1">
                    {cert.course_title}
                  </p>

                  <div className="mt-auto pt-2">
                    <p className="text-center text-[9px] uppercase tracking-widest text-amber-700 font-semibold">
                      Sponsored by Jimma Institute of Technology • TCBTP Team
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-5 flex flex-col gap-3 bg-white">
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <UserRound size={12} />
                  <span className="truncate">{cert.learner_name ?? cert.user_name ?? cert.creator_name ?? 'Learner'}</span>
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Calendar size={12} />
                  <span>{formatDate(cert.issued_at)}</span>
                </p>
                <p className="text-xs text-gray-500">
                  ID: <span className="font-semibold text-gray-700">#{String(cert.certificate_id).padStart(6, '0')}</span>
                </p>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    isLoading={activeCertificateId === cert.certificate_id && activeAction === 'view'}
                    onClick={() => handleViewPdf(cert.certificate_id)}
                    leftIcon={<ExternalLink size={13} />}
                  >
                    View PDF
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    isLoading={activeCertificateId === cert.certificate_id && activeAction === 'download'}
                    onClick={() => handleDownloadPdf(cert.certificate_id, cert.course_title)}
                    leftIcon={<Download size={13} />}
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};

export default CertificatesPage;