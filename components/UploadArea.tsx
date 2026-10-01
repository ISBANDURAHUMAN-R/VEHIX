// src/components/UploadArea.tsx
import React, { useRef, useState } from 'react';

interface Props {
  onUpload: (file: File) => Promise<void>;
  loading: boolean;
}

const UploadArea: React.FC<Props> = ({ onUpload, loading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const processFile = async (file: File) => {
    setError('');
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Unsupported file type');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File exceeds 5 MB size limit');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    await onUpload(file);
    // Clean up preview after upload completes
    URL.revokeObjectURL(url);
    setPreviewUrl('');
  };

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      void processFile(e.target.files[0]);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="preview" className="mx-auto max-h-64 object-contain" />
        ) : (
          <p className="text-gray-600 dark:text-gray-400">Drag & drop an image or click to select</p>
        )}
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          ref={fileInputRef}
          className="hidden"
          onChange={onSelect}
        />
      </div>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      {loading && <p className="mt-2 text-blue-600">Analyzing image...</p>}
    </div>
  );
};

export default UploadArea;
