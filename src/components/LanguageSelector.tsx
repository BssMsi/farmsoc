import React from 'react';
import { LanguageOption } from '../hooks/useAiChat';

interface LanguageSelectorProps {
  selectedLanguage: LanguageOption;
  languages: LanguageOption[];
  onChange: (language: LanguageOption) => void;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  languages,
  onChange,
  className = ''
}) => {
  return (
    <div className={`language-selector ${className}`}>
      <label htmlFor="language-select" className="sr-only">Select Language</label>
      <div className="relative">
        <select
          id="language-select"
          value={selectedLanguage.code}
          onChange={(e) => {
            const selected = languages.find(lang => lang.code === e.target.value);
            if (selected) onChange(selected);
          }}
          className="appearance-none bg-slate-800 border border-slate-700 text-slate-200 py-2 px-4 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.flag} {language.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector; 