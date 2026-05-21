import React from 'react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { Sun, Moon, Languages } from 'lucide-react';

export default function ThemeLanguageSwitcher() {
  const { theme, toggleTheme, language, setLanguage } = useThemeLanguage();

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={toggleTheme}
        className="p-3 rounded-full hover:bg-violet-500/20 transition-all duration-300 ease-in-out border border-transparent hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
      >
        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
      <button 
        onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
        className="px-4 py-2 rounded-full hover:bg-violet-500/20 transition-all duration-300 ease-in-out border border-transparent hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] text-sm font-bold flex items-center gap-2"
      >
        <Languages size={18} />
        {language.toUpperCase()}
      </button>
    </div>
  );
}
