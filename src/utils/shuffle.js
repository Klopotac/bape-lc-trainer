const SESSION_SEEN_IDS_KEY = 'bape_lc_trainer_seen_ids_session';

/**
 * Shuffle array in place using Durstenfeld shuffle algorithm
 * @param {Array} array
 * @returns {Array} shuffled array
 */
export function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Get seen post IDs in this session
 * @returns {Set<string>}
 */
function getSeenIds() {
  try {
    const raw = sessionStorage.getItem(SESSION_SEEN_IDS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr);
  } catch {
    return new Set();
  }
}

/**
 * Save seen post IDs in this session
 * @param {Set<string>} seenIds
 */
function saveSeenIds(seenIds) {
  try {
    sessionStorage.setItem(SESSION_SEEN_IDS_KEY, JSON.stringify(Array.from(seenIds)));
  } catch {}
}

/**
 * Shuffle posts without repeats in current session.
 * If all posts are seen, resets the seen list.
 * @param {Array} posts
 * @returns {Array} shuffled posts filtered to unseen first
 */
export function shufflePostsNoRepeats(posts) {
  if (!Array.isArray(posts)) return [];

  const seenIds = getSeenIds();

  // Filter unseen posts
  const unseenPosts = posts.filter((p) => !seenIds.has(p.id));

  let toShuffle = unseenPosts.length > 0 ? unseenPosts : posts;

  const shuffled = shuffleArray(toShuffle);

  // Update seen IDs with shuffled posts
  shuffled.forEach((post) => seenIds.add(post.id));
  saveSeenIds(seenIds);

  return shuffled;
}

/**
 * Reset seen IDs session storage (e.g. new session)
 */
export function resetSeenIds() {
  try {
    sessionStorage.removeItem(SESSION_SEEN_IDS_KEY);
  } catch {}
}
