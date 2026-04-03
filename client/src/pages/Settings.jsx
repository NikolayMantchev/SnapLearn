import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { setLanguage } from '../i18n';

const languages = [
  { code: 'de', flag: '\u{1F1E9}\u{1F1EA}', label: 'german' },
  { code: 'en', flag: '\u{1F1EC}\u{1F1E7}', label: 'english' },
  { code: 'es', flag: '\u{1F1EA}\u{1F1F8}', label: 'spanish' },
  { code: 'fr', flag: '\u{1F1EB}\u{1F1F7}', label: 'french' },
];

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('nav.settings')}
      </h1>

      {/* Appearance */}
      <div className="mb-4 rounded-xl bg-white p-6 shadow-md dark:bg-[#1a1a2e]">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <Palette className="h-5 w-5" />
          {t('settings.appearance')}
        </h2>
        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-4 py-3 transition-all hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <span className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            {isDark ? t('settings.darkMode') : t('settings.lightMode')}
          </span>
          <div
            className={`relative h-6 w-11 rounded-full transition-colors ${
              isDark ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                isDark ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Language */}
      <div className="rounded-xl bg-white p-6 shadow-md dark:bg-[#1a1a2e]">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <Globe className="h-5 w-5" />
          {t('settings.language')}
        </h2>
        <div className="space-y-2">
          {languages.map(({ code, flag, label }) => {
            const isActive = i18n.language === code || i18n.language?.startsWith(code);
            return (
              <button
                key={code}
                onClick={() => setLanguage(code)}
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-500'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-xl">{flag}</span>
                {t(`settings.${label}`)}
                {isActive && (
                  <span className="ml-auto text-indigo-600 dark:text-indigo-400">&#10003;</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
