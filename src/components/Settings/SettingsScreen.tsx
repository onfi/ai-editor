import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';

interface SettingsScreenProps {
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const { geminiApiKey, setGeminiApiKey } = useSettingsStore();
  const [apiKey, setApiKey] = useState(geminiApiKey);

  const handleSave = () => {
    setGeminiApiKey(apiKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">設定</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
              Gemini API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              Google AI StudioでAPIキーを取得してください
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Save size={16} />
            保存
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};