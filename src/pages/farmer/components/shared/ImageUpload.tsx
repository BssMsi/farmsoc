import React from 'react';
import { Plus, X } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  setImages: (images: string[]) => void;
  label?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ images, setImages, label = 'Images' }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-farmsoc-primary focus:border-transparent"
          type="text"
          placeholder="Enter image URL"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const input = e.currentTarget as HTMLInputElement;
              if (input.value.trim()) {
                setImages([...images, input.value.trim()]);
                input.value = '';
              }
            }
          }}
        />
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-700"
          onClick={() => {
            const input = document.querySelector('input[type="text"]') as HTMLInputElement;
            if (input.value.trim()) {
              setImages([...images, input.value.trim()]);
              input.value = '';
            }
          }}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {images.map((image, index) => (
          <div
            key={index}
            className="flex items-center bg-gray-100 rounded-full px-3 py-1"
          >
            <span className="text-sm text-gray-600 truncate max-w-xs">{image}</span>
            <button
              type="button"
              className="ml-2 text-gray-500 hover:text-gray-700"
              onClick={() => setImages(images.filter((_, i) => i !== index))}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUpload; 