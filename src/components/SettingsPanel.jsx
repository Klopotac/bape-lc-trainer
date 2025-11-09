import React, { useEffect, useState } from 'react';

const SETTINGS_STORAGE_KEY = 'bape_lc_trainer_settings';

const DEFAULT_SETTINGS = {
  animations: true,
  imageQuality: 'high', // low, medium, high (currently only UI placeholder)
  darkMode: true,
  keyboardShortcuts: true,
  learningModeShowAnswerFirst: false,
};

export default function SettingsPanel({ isOpen, onClose, onSettingsChange, settings }) {
  const [localSettings, setLocalSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onSettingsChange(updated);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  return (
    <>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-70 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside
            className="fixed right-0 top-0 h-full w-72 bg-card text-textPrimary shadow-lg z-50 p-6 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
          >
            <h2 id="settings-title" className="text-2xl font-bold mb-6 select-none">
              Settings
            </h2>

            <div className="space-y-4 flex-grow overflow-auto">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={localSettings.animations}
                  onChange={(e) => updateSetting('animations', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-camoGreen"
                />
                <span>Enable Animations</span>
              </label>

              <fieldset className="space-y-2">
                <legend className="font-semibold select-none">Image Quality</legend>
                {['low', 'medium', 'high'].map((quality) => (
                  <label key={quality} className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="imageQuality"
                      value={quality}
                      checked={localSettings.imageQuality === quality}
                      onChange={() => updateSetting('imageQuality', quality)}
                      className="form-radio text-camoGreen"
                    />
                    <span>{quality.charAt(0).toUpperCase() + quality.slice(1)}</span>
                  </label>
                ))}
              </fieldset>

              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={localSettings.darkMode}
                  onChange={(e) => updateSetting('darkMode', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-camoGreen"
                />
                <span>Dark Mode</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={localSettings.keyboardShortcuts}
                  onChange={(e) => updateSetting('keyboardShortcuts', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-camoGreen"
                />
                <span>Enable Keyboard Shortcuts</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={localSettings.learningModeShowAnswerFirst}
                  onChange={(e) => updateSetting('learningModeShowAnswerFirst', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-camoGreen"
                />
                <span>Learning Mode: Show Answer First</span>
              </label>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 bg-camoGreen text-black font-semibold py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-camoGreen"
            >
              Close
            </button>
          </aside>
        </>
      )}
    </>
  );
}
