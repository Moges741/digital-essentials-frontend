import { useState }          from 'react';
import {
  FileText, Volume2, Video,
  BookOpen, ExternalLink,
  Trash2,
} from 'lucide-react';
import { useDeleteMaterial } from '../../hooks/useMaterials';
import { useAuthStore }      from '../../store/auth.store';
import { ConfirmModal }      from '../ui/Modal';
import Button                from '../ui/Button';
import { fileTypeLabels }    from '../../types/material.types';
import type { Material, FileType } from '../../types/material.types';
import { ROLES }             from '../../utils/constants';

interface LessonMaterialsProps {
  materials: Material[];
  course_id: number;
}

// ── File icon by type ─────────────────────────────────────────
const FileIcon = ({ type }: { type: FileType }) => {
  const map: Record<FileType, React.ReactNode> = {
    pdf:       <FileText size={18} className="text-red-500" />,
    audio:     <Volume2  size={18} className="text-purple-500" />,
    video:     <Video    size={18} className="text-blue-500" />,
    worksheet: <BookOpen size={18} className="text-green-500" />,
  };
  return <>{map[type] ?? <FileText size={18} />}</>;
};

const iconBg: Record<FileType, string> = {
  pdf:       'bg-red-50',
  audio:     'bg-purple-50',
  video:     'bg-blue-50',
  worksheet: 'bg-green-50',
};

// ── Single material row ───────────────
const MaterialRow = ({
  material,
  course_id,
  canDelete,
}: {
  material:  Material;
  course_id: number;
  canDelete: boolean;
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: deleteMaterial, isPending } = useDeleteMaterial(course_id);

  const handleDelete = () => {
    deleteMaterial(material.material_id, {
      onSuccess: () => setShowConfirm(false),
    });
  };

  return (
    <>
      <div className="flex items-center gap-3 p-3 bg-white
                       rounded-xl border border-gray-200
                       hover:border-gray-300 transition-colors">

        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg flex items-center
                          justify-center flex-shrink-0
                          ${iconBg[material.file_type]}`}>
          <FileIcon type={material.file_type} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {material.title}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {fileTypeLabels[material.file_type]}
            {material.is_downloadable && ' · Downloadable'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* View */}
          <a
            href={material.file_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="sm"
                    leftIcon={<ExternalLink size={13} />}>
              View
            </Button>
          </a>
          {/* Delete (mentor/admin only) */}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirm(true)}
              className="text-red-400 hover:text-red-600
                          hover:bg-red-50"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        isLoading={isPending}
        title="Delete Material"
        message={`Delete "${material.title}"? This will also remove the file from Cloudinary.`}
      />
    </>
  );
};

// ── Main component ────────────────────────────────────────────
const LessonMaterials = ({
  materials,
  course_id,
}: LessonMaterialsProps) => {
  const user     = useAuthStore((s) => s.user);
  const canDelete =
    user?.role === ROLES.MENTOR ||
    user?.role === ROLES.ADMINISTRATOR;

  if (!materials.length) return null;

  return (
    <div className="flex flex-col gap-2">
      {materials.map((material) => (
        <MaterialRow
          key={material.material_id}
          material={material}
          course_id={course_id}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
};

export default LessonMaterials;