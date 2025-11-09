import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ImageViewer from './ImageViewer';
import Scoreboard from './Scoreboard';
import CommentsBreakdown from './CommentsBreakdown';
import LoadingIndicator from './LoadingIndicator';
import ToastNotification from './ToastNotification';
import SettingsPanel from './SettingsPanel';
import { useKeyboardShortcuts } from '../utils/keyboardShortcuts';
import { shufflePostsNoRepeats, resetSeenIds } from '../utils/shuffle';
import { savePostsCache, loadPostsCache, saveStatsCache, loadStatsCache } from '../utils/localStorageCache';

const POSTS_BATCH_SIZE = 20;
const VERIFIED_CHECKERS = new Set(['Tight-Purpose5316']);

function formatTimeAgo(utcSeconds) {
  const seconds = Math.floor(Date.now() / 1000) - utcSeconds;
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

export default function Game({ initialPosts, timeFilter, fetchMorePosts }) {
  const [posts, setPosts] = useState(() => shufflePostsNoRepeats(initialPosts));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [result, setResult] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [showCommentsBreakdown, setShowCommentsBreakdown] = useState(false);
  const [learningMode, setLearningMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('bape_lc_trainer_settings');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [toastMessage, setToastMessage] = useState('');

  const historyRef = useRef([]);

  const currentPost = posts[currentIndex] || null;

  // Update stats cache on answer changes
  useEffect(() => {
    const stats = {
      totalAnswered: answeredCount,
      totalCorrect: correctCount,
      currentStreak: streak,
    };
    saveStatsCache(stats);
  }, [answeredCount, correctCount, streak]);

  // Fetch more posts in background when close to end
  useEffect(() => {
    if (!fetchMorePosts || loadingMore || posts.length - currentIndex > 5) return;
    setLoadingMore(true);
    fetchMorePosts()
      .then((newPosts) => {
        if (newPosts && newPosts.length > 0) {
          const filteredNewPosts = newPosts.filter(
            (p) => !posts.find((existing) => existing.id === p.id)
          );
          if (filteredNewPosts.length > 0) {
            setPosts((prev) => [...prev, ...filteredNewPosts]);
            setToastMessage(`Loaded ${filteredNewPosts.length} new posts`);
          }
        }
      })
      .catch(() => {
        // Ignore background fetch errors
      })
      .finally(() => setLoadingMore(false));
  }, [currentIndex, posts, fetchMorePosts, loadingMore]);

  // Handle user guess
  const handleAnswer = useCallback(
    (guess) => {
      if (!currentPost) return;
      if (result) return; // prevent multiple answers

      const correctVerdict = currentPost.analysis.verdict;
      const isCorrect = guess === correctVerdict;

      setResult({
        guess,
        isCorrect,
        correctVerdict,
        message: isCorrect
          ? '✅ Correct!'
          : `❌ Wrong! Reddit says: ${correctVerdict.toUpperCase()}`,
      });

      setAnsweredCount((c) => c + 1);
      if (isCorrect) {
        setCorrectCount((c) => c + 1);
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }
      setShowCommentsBreakdown(settings?.learningModeShowAnswerFirst || false);

      // Save to history for scoreboard chart
      historyRef.current.push({
        index: answeredCount,
        accuracy: (correctCount + (isCorrect ? 1 : 0)) / (answeredCount + 1),
      });
    },
    [currentPost, result, answeredCount, correctCount, settings]
  );

  // Move to next post
  const handleNext = useCallback(() => {
    setResult(null);
    setShowCommentsBreakdown(false);
    setCurrentImageIndex(0);
    setCurrentIndex((idx) => {
      if (idx + 1 >= posts.length) return 0;
      return idx + 1;
    });
  }, [posts.length]);

  // Skip current post
  const handleSkip = useCallback(() => {
    setResult(null);
    setShowCommentsBreakdown(false);
    setCurrentImageIndex(0);
    setCurrentIndex((idx) => {
      if (idx + 1 >= posts.length) return 0;
      return idx + 1;
    });
  }, [posts.length]);

  // Keyboard shortcuts integration
  useKeyboardShortcuts(
    {
      onLegit: () => handleAnswer('legit'),
      onFake: () => handleAnswer('fake'),
      onNext: () => {
        if (result) handleNext();
      },
      onSkip: () => {
        if (!result) handleSkip();
      },
    },
    settings?.keyboardShortcuts !== false
  );

  // Change image index in gallery
  const onChangeImageIndex = (idx) => {
    setCurrentImageIndex(idx);
  };

  // Toggle learning mode
  const toggleLearningMode = () => {
    setLearningMode((v) => !v);
  };

  // Toggle settings panel
  const toggleSettingsPanel = () => {
    setSettingsOpen((v) => !v);
  };

  // Handle settings changes
  const onSettingsChange = (newSettings) => {
    setSettings(newSettings);
    if (newSettings.darkMode !== undefined) {
      if (newSettings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // On mount, apply dark mode setting
  useEffect(() => {
    if (settings?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Handle report issue click (mock)
  const handleReportIssue = () => {
    setToastMessage('Issue reported! Thank you for feedback.');
  };

  // Clear toast message
  const onToastClose = () => setToastMessage('');

  // Loading indicator when no posts
  if (!posts.length) {
    return (
      <div className="p-8 text-center text-textMuted">
        <p>No posts available to display. Please try another time period or refresh.</p>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4 flex flex-col gap-4 min-h-screen">
      <Scoreboard
        correct={correctCount}
        total={answeredCount}
        streak={streak}
        history={historyRef.current}
      />

      <div className="bg-card rounded-lg p-4 flex flex-col gap-4 select-none">
        <ImageViewer
          images={currentPost.images}
          currentIndex={currentImageIndex}
          onChangeIndex={onChangeImageIndex}
        />

        <div className="flex justify-center gap-8 mt-2">
          <button
            type="button"
            onClick={() => handleAnswer('legit')}
            disabled={!!result}
            className={`flex-1 py-4 rounded-lg font-bold text-white text-xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-green-600 transition-transform active:scale-95 ${
              settings?.animations ? 'animate-fadeIn' : ''
            } bg-gradient-to-r from-legitGreenStart to-legitGreenEnd shadow-lg`}
            aria-label="Mark as Legit"
          >
            LEGIT ✓
          </button>

          <button
            type="button"
            onClick={() => handleAnswer('fake')}
            disabled={!!result}
            className={`flex-1 py-4 rounded-lg font-bold text-white text-xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-red-600 transition-transform active:scale-95 ${
              settings?.animations ? 'animate-fadeIn' : ''
            } bg-gradient-to-r from-fakeRedStart to-fakeRedEnd shadow-lg`}
            aria-label="Mark as Fake"
          >
            FAKE ✗
          </button>
        </div>

        <div className="text-textMuted text-sm mt-2 break-words">
          <p className="font-semibold text-textPrimary">{currentPost.title}</p>
          <p>
            📅 {formatTimeAgo(currentPost.created_utc)} &nbsp;•&nbsp; 💬 {currentPost.num_comments} comments
          </p>
        </div>

        {result && (
          <div
            role="alert"
            aria-live="assertive"
            className={`mt-3 p-3 rounded text-white font-semibold ${
              result.isCorrect ? 'bg-green-700' : 'bg-red-700'
            } ${settings?.animations ? 'animate-fadeIn' : ''}`}
          >
            {result.message}
            {result.isCorrect === false && currentPost.analysis.topComment && (
              <blockquote className="mt-2 border-l-4 border-camoGreen pl-3 italic text-textMuted">
                Top comment: {currentPost.analysis.topComment.body}
              </blockquote>
            )}
          </div>
        )}

        {(showCommentsBreakdown || learningMode) && (
          <CommentsBreakdown
            legitComments={currentPost.analysis.legitComments}
            fakeComments={currentPost.analysis.fakeComments}
            verifiedCheckers={VERIFIED_CHECKERS}
          />
        )}

        <div className="flex justify-between items-center mt-4 gap-4 flex-wrap">
          <button
            type="button"
            onClick={handleSkip}
            disabled={!!result}
            className="py-2 px-4 rounded bg-gray-700 text-textMuted hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-camoGreen"
            aria-label="Skip post"
          >
            Skip
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!result}
            className="py-2 px-6 rounded bg-camoGreen text-black font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-camoGreen"
            aria-label="Next post"
          >
            Next Random
          </button>

          <button
            type="button"
            onClick={handleReportIssue}
            className="py-2 px-4 rounded bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
            aria-label="Report issue with this post"
          >
            Report Issue
          </button>

          <button
            type="button"
            onClick={toggleLearningMode}
            className={`py-2 px-4 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              learningMode ? 'bg-camoGreen text-black' : 'bg-gray-700 text-textMuted'
            }`}
            aria-pressed={learningMode}
          >
            {learningMode ? 'Learning Mode On' : 'Learning Mode Off'}
          </button>

          <button
            type="button"
            onClick={toggleSettingsPanel}
            className="py-2 px-4 rounded bg-gray-700 text-textMuted hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-camoGreen"
            aria-label="Open settings"
          >
            Settings
          </button>
        </div>

        {loadingMore && <LoadingIndicator message="Loading more posts..." className="mt-4" />}
      </div>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSettingsChange={onSettingsChange}
        settings={settings}
      />

      <ToastNotification message={toastMessage} onClose={onToastClose} />
    </main>
  );
}
