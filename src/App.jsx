import React, { useEffect, useState, useCallback } from 'react';
import TimePeriodSelector from './components/TimePeriodSelector';
import Game from './components/Game';
import LoadingIndicator from './components/LoadingIndicator';
import { fetchPosts } from './utils/redditApi';
import { savePostsCache, loadPostsCache } from './utils/localStorageCache';

export default function App() {
  const [timeFilter, setTimeFilter] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cached posts if available for selected time filter
  const loadCachedPosts = useCallback(
    (filter) => {
      const cached = loadPostsCache(filter);
      if (cached && cached.length > 0) {
        setPosts(cached);
        return true;
      }
      return false;
    },
    []
  );

  // Fetch posts from Reddit API
  const loadPosts = useCallback(
    async (filter) => {
      setLoading(true);
      setError(null);
      try {
        const fetchedPosts = await fetchPosts(filter, 100);
        if (Array.isArray(fetchedPosts) && fetchedPosts.length > 0) {
          setPosts(fetchedPosts);
          savePostsCache(fetchedPosts, filter);
        } else {
          setError('No legit check posts found for this time period.');
          setPosts([]);
        }
      } catch (e) {
        setError(e.message || 'Failed to load posts.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // On time filter selection
  const handleTimeFilterSelect = (filter) => {
    setTimeFilter(filter);
  };

  // When timeFilter changes, load cached or fetch posts
  useEffect(() => {
    if (!timeFilter) return;
    const cachedLoaded = loadCachedPosts(timeFilter);
    if (!cachedLoaded) {
      loadPosts(timeFilter);
    }
  }, [timeFilter, loadCachedPosts, loadPosts]);

  // Background fetch more posts for game component
  const fetchMorePosts = useCallback(async () => {
    if (!timeFilter) return [];
    try {
      const morePosts = await fetchPosts(timeFilter, 50);
      return morePosts;
    } catch {
      return [];
    }
  }, [timeFilter]);

  // Dark mode by default, toggle handled in Game and SettingsPanel
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background text-textPrimary flex flex-col">
      {!timeFilter ? (
        <TimePeriodSelector onSelect={handleTimeFilterSelect} />
      ) : loading ? (
        <LoadingIndicator message={`Loading ${timeFilter} LC posts from r/bapeheads...`} />
      ) : error ? (
        <div className="p-6 text-center text-red-500 font-semibold">{error}</div>
      ) : posts.length === 0 ? (
        <div className="p-6 text-center text-textMuted">No posts available for this period.</div>
      ) : (
        <Game initialPosts={posts} timeFilter={timeFilter} fetchMorePosts={fetchMorePosts} />
      )}

      <footer className="text-textMuted text-center text-xs p-4 select-none bg-card mt-auto">
        <p>
          Powered by Reddit r/bapeheads data. Accuracy based on community consensus and comments.
        </p>
        <p>
          Verified checker: Tight-Purpose5316.{' '}
          <a
            href="https://github.com/Tight-Purpose5316/bape-lc-trainer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-camoGreen underline"
          >
            GitHub Repo
          </a>{' '}
          •{' '}
          <a
            href="https://www.reddit.com/r/bapeheads/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-camoGreen underline"
          >
            r/bapeheads
          </a>{' '}
          •{' '}
          <a
            href="mailto:bape-lc-trainer-feedback@example.com"
            className="text-camoGreen underline"
          >
            Submit Feedback
          </a>
        </p>
      </footer>
    </div>
  );
}
