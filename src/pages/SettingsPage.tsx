import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Monitor, Moon, Sun } from 'lucide-react';
import { useThemeContext } from '../contexts/ThemeContext';
import { useSettingsStore } from '../stores/settingsStore';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme, colors } = useThemeContext();
  const { geminiApiKey, setGeminiApiKey } = useSettingsStore();

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeminiApiKey(e.target.value);
  };

  const themeOptions = [
    { value: 'light', label: 'ライト', icon: Sun },
    { value: 'dark', label: 'ダーク', icon: Moon },
    { value: 'system', label: 'システム設定', icon: Monitor }
  ];

  return (
    <div className={`min-h-screen ${colors.bg}`}>
      <div className={`${colors.bgSecondary} ${colors.border}`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className={`text-2xl font-bold ${colors.text}`}>気かきくエディタ</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">

          {/* AI設定 */}
          <section>
            <h2 className={`text-lg font-semibold mb-4 ${colors.text}`}>AI設定</h2>
            <div className={`p-6 rounded-lg ${colors.bgSecondary} ${colors.border}`}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="gemini-key" className={`block text-sm font-medium mb-2 ${colors.text}`}>
                    Gemini API Key
                  </label>
                  <input
                    id="gemini-key"
                    type="password"
                    value={geminiApiKey}
                    onChange={handleApiKeyChange}
                    placeholder="AIアシスト機能を使用するにはAPIキーを設定してください"
                    className={`w-full px-4 py-2 rounded-lg border ${colors.bg} ${colors.border} ${colors.text} placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
                <p className={`text-sm ${colors.textMuted}`}>
                  Gemini API Keyは
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline ml-1"
                  >
                    Google AI Studio
                  </a>
                  で取得できます。
                </p>
              </div>
            </div>
          </section>

          
          {/* テーマ設定 */}
          <section>
            <h2 className={`text-lg font-semibold mb-4 ${colors.text}`}>テーマ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value as any)}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                      theme === option.value
                        ? `${colors.active} ${colors.text}`
                        : `${colors.bgSecondary} ${colors.textSecondary} ${colors.hover} ${colors.border}`
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
          {geminiApiKey && 
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded transition-colors bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 align-middle`}
            >
              OK
            </Link>
          }
        </div>
      </div>
    </div>
  );
};