import React, { useCallback, useState } from 'react';
import { Plus, X, Upload, Image as ImageIcon, Video, File } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  images: string[];
  setImages: (images: string[]) => void;
  label?: string;
  accept?: {
    'image/*'?: string[];
    'video/*'?: string[];
  };
  maxSize?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  images, 
  setImages, 
  label = 'Images',
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'video/*': ['.mp4', '.mov', '.avi']
  },
  maxSize = 10 * 1024 * 1024 // 10MB
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setError(null);

    try {
      // TODO: Implement actual file upload to your backend
      // For now, we'll create object URLs for preview
      const newImageUrls = await Promise.all(
        acceptedFiles.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(file);
          });
        })
      );

      setImages([...images, ...newImageUrls]);
    } catch (err) {
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [images, setImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: true
  });

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      {/* File Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-kisanly-primary bg-kisanly-primary/5' : 'border-gray-300 hover:border-kisanly-primary'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={uploading} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-gray-400" />
          {isDragActive ? (
            <p className="text-sm text-gray-600">Drop the files here ...</p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Drag and drop files here, or click to select files
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: Images (PNG, JPG, GIF) and Videos (MP4, MOV, AVI)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-kisanly-primary h-2.5 rounded-full animate-pulse" style={{ width: '50%' }}></div>
          </div>
        </div>
      )}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              {image.startsWith('data:video') ? (
                <video
                  src={image}
                  className="w-full h-32 object-cover rounded-lg"
                  controls
                />
              ) : (
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              <button
                type="button"
                className="absolute top-2 right-2 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 