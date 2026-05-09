
import { useQuery } from '@tanstack/react-query';
import { certificateApi } from '../api/certificate.api';
import { QUERY_KEYS }     from '../utils/constants';

// ── My certificates ───────────────────────────────────────────
export const useMyCertificates = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.CERTIFICATES, 'my'],
    queryFn:  () => certificateApi.getMy(),
  });
};

// ── One certificate ───────────────────────────────────────────
export const useCertificate = (certificate_id: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CERTIFICATES, certificate_id],
    queryFn:  () => certificateApi.getOne(certificate_id),
    enabled:  !!certificate_id,
  });
};