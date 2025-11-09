import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function ToastNotification({ message, duration = 4000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onClose && onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!visible || !message) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-camoGreen bg-opacity-90 text-white px-5 py-3 rounded shadow-lg flex items-center space-x-3 max-w-xs w-full"
    >
      <span className="flex-1 text-sm select-none">{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          onClose && onClose();
        }}
        aria-label="Close notification"
        className="hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-white rounded"
      >
        <X size={18} />
      </button>
    </div>
  );
}
