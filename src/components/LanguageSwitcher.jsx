import React from 'react';
import { useTranslation } from '../context/TranslationContext';

const LanguageSwitcher = () => {
  const { currentLanguage, toggleLanguage } = useTranslation();

  const handleToggle = () => {
    toggleLanguage();
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm ${currentLanguage === 'en' ? 'text-white' : 'text-white/60'}`}>EN</span>
      <button
        onClick={handleToggle}
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
          currentLanguage === 'hi' ? 'bg-green-400' : 'bg-gray-400'
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
            currentLanguage === 'hi' ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
      <span className={`text-sm ${currentLanguage === 'hi' ? 'text-white' : 'text-white/60'}`}>हि</span>
    </div>
  );
};

export default LanguageSwitcher;
