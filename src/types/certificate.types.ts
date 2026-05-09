export interface Certificate {
  certificate_id:  number;
  user_id:         number;
  course_id:       number;
  issued_at:       string;
  certificate_url: string | null;
}

export interface CertificateWithDetails extends Certificate {
  course_title:   string;
  creator_name:   string;
}