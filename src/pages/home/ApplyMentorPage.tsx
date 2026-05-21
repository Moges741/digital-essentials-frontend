import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { mentorApplicationApi } from '../../api/mentor-application.api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Upload, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ApplyMentorPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    linkedin_link: '',
    github_link: '',
    admin_email: '',
  });

  const [files, setFiles] = useState<{
    academic_file: File | null;
    national_id: File | null;
  }>({
    academic_file: null,
    national_id: null,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const applyMutation = useMutation({
    mutationFn: (data: FormData) => mentorApplicationApi.apply(data),
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success('Application submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit application.');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'academic_file' | 'national_id') => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.admin_email) {
      toast.error("Please select an admin's email.");
      return;
    }
    if (!files.academic_file || !files.national_id) {
      toast.error('Please upload both academic file and national ID.');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('phone_number', formData.phone_number);
    data.append('admin_email', formData.admin_email);
    if (formData.linkedin_link) data.append('linkedin_link', formData.linkedin_link);
    if (formData.github_link) data.append('github_link', formData.github_link);
    data.append('academic_file', files.academic_file);
    data.append('national_id', files.national_id);

    applyMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <Card padding="lg" className="text-center">
          <CardContent className="flex flex-col items-center py-8">
            <CheckCircle size={64} className="text-green-500 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
            <p className="text-gray-600 mb-8 max-w-md">
              Thank you for applying to be a mentor. Our team will review your application and get back to you via email shortly.
            </p>
            <Link to="/">
              <Button>Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
          Become a Mentor
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Share your expertise and help guide the next generation of digital professionals. Fill out the application below to get started.
        </p>
      </div>

      <Card padding="lg" className="shadow-lg">
        <CardHeader>
          <CardTitle>Mentor Application Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                <Input
                  label="Phone Number"
                  name="phone_number"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone_number}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Required Documents */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Required Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic File / Degree (PDF, JPG) *
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition text-center cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'academic_file')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                    <span className="text-sm text-gray-600">
                      {files.academic_file ? files.academic_file.name : 'Upload Academic File'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    National ID (PDF, JPG) *
                  </label>
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition text-center cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'national_id')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                    <span className="text-sm text-gray-600">
                      {files.national_id ? files.national_id.name : 'Upload National ID'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Online Presence (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="LinkedIn Profile URL"
                  name="linkedin_link"
                  type="url"
                  placeholder="https://linkedin.com/in/johndoe"
                  value={formData.linkedin_link}
                  onChange={handleChange}
                />
                <Input
                  label="GitHub Profile URL"
                  name="github_link"
                  type="url"
                  placeholder="https://github.com/johndoe"
                  value={formData.github_link}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Admin Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Select Admin for Review</h3>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Select one of the following admin's email <span className="text-red-500">*</span>
                </label>
                <select
                  name="admin_email"
                  required
                  value={formData.admin_email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, admin_email: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 bg-slate-50 py-2.5 px-3 text-sm outline-none transition focus:border-blue-300 focus:bg-white"
                >
                  <option value="">-- Choose Admin Email --</option>
                  <option value="mogesse741@gmail.com">mogesse741@gmail.com</option>
                  <option value="softman741@gmail.com">softman741@gmail.com</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={applyMutation.isPending}
              >
                Submit Application
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplyMentorPage;
