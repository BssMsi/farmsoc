import React from 'react';

const PREDEFINED_PLATFORMS = ['Instagram', 'Facebook', 'Linkedin', 'YouTube'];

interface PlatformSelectorProps {
  platforms: string[];
  setPlatforms: (platforms: string[]) => void;
  label?: string;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({ 
  platforms, 
  setPlatforms, 
  label = 'Additional Platforms to be reached' 
}) => {
  const togglePlatform = (platform: string) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PREDEFINED_PLATFORMS.map((platform) => (
          <button
            key={platform}
            type="button"
            onClick={() => togglePlatform(platform)}
            className={`px-4 py-2 rounded-lg border transition-colors duration-200
              ${platforms.includes(platform)
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            {platform}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlatformSelector; 