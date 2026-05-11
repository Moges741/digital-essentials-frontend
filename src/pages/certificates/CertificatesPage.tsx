
import { Award, Download, ExternalLink, Calendar } from 'lucide-react';
import { useMyCertificates } from '../../hooks/useCertificates';
import Card                  from '../../components/ui/Card';
import Button                from '../../components/ui/Button';
import EmptyState            from '../../components/ui/EmptyState';
import { PageSpinner }       from '../../components/ui/Spinner';
import { formatDate }        from '../../utils/format';

const CertificatesPage = () => {
  const { data: certificates, isLoading } = useMyCertificates();

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
            {certificates?.length ?? 0} certificate
            {(certificates?.length ?? 0) !== 1 ? 's' : ''} earned
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
              className="overflow-hidden"
            >
              {/* Gold gradient header */}
              <div className="h-24 bg-gradient-to-br from-amber-400
                               to-amber-600 flex items-center
                               justify-center">
                <Award size={40} className="text-white opacity-90" />
              </div>

              <div className="p-5 flex flex-col gap-3">

                {/* Course title */}
                <div>
                  <p className="text-xs text-gray-400 font-medium
                                 uppercase tracking-wide mb-1">
                    Certificate of Completion
                  </p>
                  <h3 className="text-base font-bold text-gray-900
                                  leading-snug">
                    {cert.course_title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    by {cert.creator_name}
                  </p>
                </div>

                {/* Issue date */}
                <div className="flex items-center gap-2
                                  text-sm text-gray-500">
                  <Calendar size={14} />
                  <span>Issued {formatDate(cert.issued_at)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  {cert.certificate_url && cert.certificate_url !== '' ? (
                    <>
                      {/* View in new tab */}
                      <a
                        href={cert.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          fullWidth
                          leftIcon={<ExternalLink size={13} />}
                        >
                          View
                        </Button>
                      </a>

                      {/* Force download via backend endpoint */}
                      <a
                        href={`${import.meta.env.VITE_API_BASE_URL}/certificates/${cert.certificate_id}/download`}
                        download={`Certificate_${cert.course_title.replace(/\s+/g, '_')}.pdf`}
                        className="flex-1"
                      >
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          leftIcon={<Download size={13} />}
                        >
                          Download
                        </Button>
                      </a>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 w-full">
                      <span className="animate-pulse">⏳</span>
                      Generating your certificate...
                    </div>
                  )}
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