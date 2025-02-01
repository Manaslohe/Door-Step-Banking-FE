import React from 'react';
import { useTranslation } from '../context/TranslationContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <span className="text-white/90 text-sm">EN</span>
      <button
        onClick={() => setLanguage(prev => prev === 'english' ? 'hindi' : 'english')}
        className={`w-12 h-6 rounded-full p-1 transition-colors ${
          language === 'hindi' ? 'bg-green-500' : 'bg-gray-400'
        }`}
      >
        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
          language === 'hindi' ? 'translate-x-6' : 'translate-x-0'
        }`} />
      </button>
      <span className="text-white/90 text-sm">हि</span>
    </div>
  );
};

export default LanguageSwitcher;
