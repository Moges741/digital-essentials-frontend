
import { useState, useRef } from 'react';
import type {ChangeEvent} from 'react';
import { Upload, X, FileText, Volume2, Video, BookOpen } from 'lucide-react';
import { useUploadMaterial } from '../../hooks/useMaterials';
import Button                from '../ui/Button';
import Input                 from '../ui/Input';
import { fileTypeLabels } from '../../types/material.types';
import type { FileType } from '../../types/material.types';
interface LessonMaterialUploadProps {
  course_id:  number;
  lesson_id:  number;
  onDone?:    () => void;  // optional callback after upload
}

// ── File type icon ────────────────────────────────────────────
const FileTypeIcon = ({ type }: { type: FileType }) => {
  const icons: Record<FileType, React.ReactNode> = {
    pdf:       <FileText size={16} className="text-red-500" />,
    audio:     <Volume2  size={16} className="text-purple-500" />,
    video:     <Video    size={16} className="text-blue-500" />,
    worksheet: <BookOpen size={16} className="text-green-500" />,
  };
  return <>{icons[type]}</>;
};

const LessonMaterialUpload = ({
  course_id,
  lesson_id,
  onDone,
}: LessonMaterialUploadProps) => {

  const [title,          setTitle]          = useState('');
  const [fileType,       setFileType]       = useState<FileType>('pdf');
  const [isDownloadable, setIsDownloadable] = useState(true);
  const [selectedFile,   setSelectedFile]   = useState<File | null>(null);
  const [dragOver,       setDragOver]       = useState(false);
  const fileInputRef                        = useRef<HTMLInputElement>(null);

  const { mutate: upload, isPending } = useUploadMaterial(course_id);

  // Accepted MIME types per file type selection
  const acceptMap: Record<FileType, string> = {
    pdf:       'application/pdf,image/jpeg,image/png',
    audio:     'audio/mpeg,audio/mp4,audio/wav',
    video:     'video/mp4,video/quicktime',
    worksheet: 'application/pdf,.docx',
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    // Auto-fill title from filename if title is empty
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (!selectedFile || !title.trim()) return;

    // Build FormData — backend expects these exact field names
    const formData = new FormData();
    formData.append('file',            selectedFile);
    formData.append('title',           title.trim());
    formData.append('lesson_id',       String(lesson_id));
    formData.append('is_downloadable', String(isDownloadable));

    upload(formData, {
      onSuccess: () => {
        // Reset form
        setTitle('');
        setSelectedFile(null);
        setIsDownloadable(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onDone?.();
      },
    });
  };

  const isReady = !!selectedFile && !!title.trim();

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-50
                     rounded-xl border border-dashed border-gray-300">

      <p className="text-sm font-semibold text-gray-700">
        Upload Material
      </p>

      {/* File type selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-600">
          Material Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(fileTypeLabels) as FileType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setFileType(type);
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg
                text-xs font-medium border transition-all
                ${fileType === type
                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }
              `}
            >
              <FileTypeIcon type={type} />
              {fileTypeLabels[type].split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      {!selectedFile ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center gap-2
            py-8 rounded-xl border-2 border-dashed cursor-pointer
            transition-colors duration-150
            ${dragOver
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 bg-white hover:border-primary-300 hover:bg-primary-50'
            }
          `}
        >
          <Upload size={24} className="text-gray-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {fileType === 'pdf'       && 'PDF, JPG, PNG'}
              {fileType === 'audio'     && 'MP3, MP4 audio, WAV'}
              {fileType === 'video'     && 'MP4, MOV (max 100MB)'}
              {fileType === 'worksheet' && 'PDF or DOCX'}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptMap[fileType]}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        // Selected file preview
        <div className="flex items-center gap-3 p-3 bg-white
                          rounded-xl border border-gray-200">
          <div className="w-9 h-9 bg-gray-50 rounded-lg
                            flex items-center justify-center flex-shrink-0">
            <FileTypeIcon type={fileType} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-400">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-1 text-gray-400 hover:text-red-500
                         transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Title input */}
      <Input
        label="Material Title"
        placeholder="e.g. Week 1 Reading, Introduction Video"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      {/* Downloadable toggle */}
      <label className="flex items-center gap-3 cursor-pointer
                          select-none">
        <div
          onClick={() => setIsDownloadable((v) => !v)}
          className={`
            relative w-10 h-5 rounded-full transition-colors
            ${isDownloadable ? 'bg-primary-600' : 'bg-gray-300'}
          `}
        >
          <div className={`
            absolute top-0.5 w-4 h-4 bg-white rounded-full
            shadow transition-transform duration-200
            ${isDownloadable ? 'translate-x-5' : 'translate-x-0.5'}
          `} />
        </div>
        <span className="text-sm text-gray-700">
          Allow learners to download this file
        </span>
      </label>

      {/* Upload button */}
      <Button
        onClick={handleSubmit}
        isLoading={isPending}
        disabled={!isReady}
        fullWidth
        leftIcon={<Upload size={15} />}
      >
        {isPending ? 'Uploading...' : 'Upload Material'}
      </Button>

    </div>
  );
};

export default LessonMaterialUpload;