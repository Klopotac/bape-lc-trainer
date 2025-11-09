import { useEffect } from 'react';

/**
 * Hook to register keyboard shortcuts for legit check game
 * @param {Object} handlers - callbacks: onLegit, onFake, onNext, onSkip
 * @param {boolean} enabled - enable or disable shortcuts
 */
export function useKeyboardShortcuts(handlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.isComposing) {
        return; // ignore when typing input
      }
      const key = e.key.toLowerCase();

      if (key === 'l' && handlers.onLegit) {
        e.preventDefault();
        handlers.onLegit();
      } else if (key === 'f' && handlers.onFake) {
        e.preventDefault();
        handlers.onFake();
      } else if ((key === 'arrowright' || key === 'd') && handlers.onNext) {
        e.preventDefault();
        handlers.onNext();
      } else if ((key === 'arrowleft' || key === 'a') && handlers.onSkip) {
        e.preventDefault();
        handlers.onSkip();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers, enabled]);
}
