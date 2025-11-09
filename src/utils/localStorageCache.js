const CACHE_POSTS_KEY = 'bape_lc_trainer_posts_cache';
const CACHE_STATS_KEY = 'bape_lc_trainer_stats_cache';
const CACHE_POSTS_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export function savePostsCache(posts, timeFilter) {
  try {
    const data = {
      timestamp: Date.now(),
      timeFilter,
      posts,
    };
    localStorage.setItem(CACHE_POSTS_KEY, JSON.stringify(data));
  } catch {
    // fail silently
  }
}

/**
 * Loads cached posts if not expired and matching time filter
 * @param {string} timeFilter
 * @returns {Array|null} posts or null if none or expired
 */
export function loadPostsCache(timeFilter) {
  try {
    const raw = localStorage.getItem(CACHE_POSTS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (
      !data.timestamp ||
      !data.timeFilter ||
      !data.posts ||
      data.timeFilter !== timeFilter
    ) {
      return null;
    }
    if (Date.now() - data.timestamp > CACHE_POSTS_EXPIRY_MS) {
      return null;
    }
    return data.posts;
  } catch {
    return null;
  }
}

export function saveStatsCache(stats) {
  try {
    const data = {
      timestamp: Date.now(),
      stats,
    };
    localStorage.setItem(CACHE_STATS_KEY, JSON.stringify(data));
  } catch {}
}

export function loadStatsCache() {
  try {
    const raw = localStorage.getItem(CACHE_STATS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.timestamp || !data.stats) {
      return null;
    }
    return data.stats;
  } catch {
    return null;
  }
}
