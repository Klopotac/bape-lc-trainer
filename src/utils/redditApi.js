const LEGIT_KEYWORDS = [
  'legit', 'real', 'authentic', 'retail', 'gl', 
  'green light', 'good to go', 'looks good', '✓', 
  '✅', 'Lgt', 'verified', 'genuine', 'original', 
  'on point', '100% real', 'legit check passed'
];

const FAKE_KEYWORDS = [
  'fake', 'rep', 'replica', 'red light', 
  'sus', 'off', 'dhgate', '✗', '❌', 'bad', 
  'terrible', 'counterfeit', 'knockoff', 'fufu', 
  'low quality', 'looks off', 'not legit'
];

// Verified checkers with 10x weight
const VERIFIED_CHECKERS = new Set(['Tight-Purpose5316']);

function keywordMatches(text, keywords) {
  if (!text) return 0;
  const lowerText = text.toLowerCase();
  let count = 0;
  for (const kw of keywords) {
    const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) count += matches.length;
  }
  return count;
}

/**
 * Analyze comments for legit/fake score and consensus.
 * @param {Array} comments - Reddit comments array as from Reddit API
 * @returns {object} verdict info with scores, consensus, top comment, and relevant comments
 */
export function analyzeCommentsForVerdict(comments) {
  if (!Array.isArray(comments) || comments.length === 0) {
    return {
      verdict: 'unknown',
      legitScore: 0,
      fakeScore: 0,
      consensus: null,
      topComment: null,
      legitComments: [],
      fakeComments: [],
      communitySplit: false,
    };
  }

  let legitScore = 0;
  let fakeScore = 0;

  const legitComments = [];
  const fakeComments = [];

  // Filter only top-level comments with body and ups
  const filteredComments = comments.filter(
    (c) => c && c.body && typeof c.ups === 'number' && !c.stickied
  );

  if (filteredComments.length === 0) {
    return {
      verdict: 'unknown',
      legitScore: 0,
      fakeScore: 0,
      consensus: null,
      topComment: null,
      legitComments: [],
      fakeComments: [],
      communitySplit: false,
    };
  }

  // Determine top comment by ups (or first)
  let topComment = filteredComments.reduce((top, current) =>
    current.ups > top.ups ? current : top
  );

  for (const comment of filteredComments) {
    const body = comment.body.toLowerCase();
    // Count keyword matches
    const legitMatches = keywordMatches(body, LEGIT_KEYWORDS);
    const fakeMatches = keywordMatches(body, FAKE_KEYWORDS);

    if (legitMatches === 0 && fakeMatches === 0) {
      continue; // skip neutral comments
    }

    // Weight calculation
    let weight = Math.max(comment.ups, 1);

    if (comment.id === topComment.id) weight *= 2;
    if (VERIFIED_CHECKERS.has(comment.author)) weight *= 10;

    if (legitMatches > 0 && fakeMatches === 0) {
      legitScore += legitMatches * weight;
      legitComments.push({ ...comment, weight, matches: legitMatches });
    } else if (fakeMatches > 0 && legitMatches === 0) {
      fakeScore += fakeMatches * weight;
      fakeComments.push({ ...comment, weight, matches: fakeMatches });
    } else {
      // If comment contains both legit and fake keywords, ignore for consensus
    }
  }

  let verdict = 'unknown';
  let communitySplit = false;

  if (legitScore === 0 && fakeScore === 0) {
    verdict = 'unknown';
  } else if (legitScore > fakeScore) {
    // Check if close to split (within 20%)
    if (fakeScore / legitScore >= 0.8) {
      communitySplit = true;
    }
    verdict = 'legit';
  } else if (fakeScore > legitScore) {
    if (legitScore / fakeScore >= 0.8) {
      communitySplit = true;
    }
    verdict = 'fake';
  } else {
    verdict = 'unknown';
  }

  return {
    verdict,
    legitScore,
    fakeScore,
    consensus: verdict === 'unknown' ? null : verdict,
    topComment,
    legitComments,
    fakeComments,
    communitySplit,
  };
}

/**
 * Check if a Reddit post title or flair matches LC keywords.
 * @param {string} title
 * @param {string} flair
 * @returns {boolean}
 */
function isLegitCheckPost(title, flair) {
  if (!title) return false;
  const lcKeywords = ['lc', 'legit check', 'legit?', 'real?', 'fake?', 'qc', 'quality check'];

  const lowerTitle = title.toLowerCase();
  for (const kw of lcKeywords) {
    if (lowerTitle.includes(kw)) return true;
  }
  if (flair && typeof flair === 'string') {
    const lowerFlair = flair.toLowerCase();
    for (const kw of lcKeywords) {
      if (lowerFlair.includes(kw)) return true;
    }
  }
  return false;
}

/**
 * Extract images URLs from Reddit post data.
 * Supports single and gallery posts.
 * @param {object} postData
 * @returns {string[]} array of image URLs
 */
function extractImageUrls(postData) {
  if (!postData) return [];

  const images = [];
  // Gallery posts
  if (postData.is_gallery && postData.gallery_data && postData.media_metadata) {
    for (const item of postData.gallery_data.items) {
      const media = postData.media_metadata[item.media_id];
      if (media && media.status === 'valid') {
        // Pick highest quality image
        if (media.s && media.s.u) {
          let url = media.s.u.replace(/&amp;/g, '&');
          images.push(url);
        }
      }
    }
  }
  // Single image posts or preview images
  else if (postData.url && /\.(jpg|jpeg|png|gif)$/i.test(postData.url)) {
    images.push(postData.url);
  } else if (
    postData.preview &&
    postData.preview.images &&
    postData.preview.images.length > 0
  ) {
    // Reddit sometimes supplies preview images
    const img = postData.preview.images[0];
    if (img.source && img.source.url) {
      const url = img.source.url.replace(/&amp;/g, '&');
      images.push(url);
    }
  }
  return images;
}

/**
 * Fetch Reddit posts from r/bapeheads with LC filtering
 * @param {string} timeFilter - one of 'hour', 'day', 'week', 'month', 'year', 'all'
 * @param {number} limit - number of posts to fetch (max 100 recommended)
 * @returns {Promise<Array>} filtered posts with images, comments, and analysis
 */
export async function fetchPosts(timeFilter = 'week', limit = 100) {
  const tParam = timeFilter === 'hour' ? 'day' : timeFilter; // Reddit supports hour? fallback to day
  const url = `https://www.reddit.com/r/bapeheads/new.json?limit=${limit}&t=${tParam}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BAPE-LC-Trainer/1.0 (by u/Tight-Purpose5316)',
      },
    });
    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }
    const json = await response.json();
    if (!json.data || !json.data.children) {
      throw new Error('Invalid Reddit response format');
    }
    const postsRaw = json.data.children;

    // For each post, filter for LC posts with images and comments
    const posts = [];
    for (const postWrapper of postsRaw) {
      const post = postWrapper.data;
      if (
        !post ||
        post.is_self ||
        post.removed_by_category ||
        post.locked ||
        !post.num_comments ||
        post.num_comments < 3 || // We want multiple comments
        !isLegitCheckPost(post.title, post.link_flair_text)
      ) {
        continue;
      }

      const images = extractImageUrls(post);
      if (images.length === 0) continue;

      // Fetch top-level comments for analysis
      // Reddit JSON for post comments: https://www.reddit.com/comments/{post.id}.json?limit=20
      let comments = [];
      try {
        const commentsResp = await fetch(
          `https://www.reddit.com/comments/${post.id}.json?limit=20`
        );
        if (commentsResp.ok) {
          const commentsJson = await commentsResp.json();
          if (
            Array.isArray(commentsJson) &&
            commentsJson.length > 1 &&
            commentsJson[1].data &&
            Array.isArray(commentsJson[1].data.children)
          ) {
            comments = commentsJson[1].data.children
              .map((c) => c.data)
              .filter((c) => c && c.body);
          }
        }
      } catch {
        // Ignore fetch errors for comments
      }

      if (!comments.length) continue;

      // Analyze comments for verdict
      const analysis = analyzeCommentsForVerdict(comments);

      // Skip posts with unknown verdict or community split
      if (
        analysis.verdict === 'unknown' ||
        analysis.communitySplit ||
        (analysis.legitScore === 0 && analysis.fakeScore === 0)
      ) {
        continue;
      }

      posts.push({
        id: post.id,
        title: post.title,
        created_utc: post.created_utc,
        num_comments: post.num_comments,
        permalink: `https://reddit.com${post.permalink}`,
        images,
        analysis,
      });
    }

    return posts;
  } catch (error) {
    throw new Error(`Failed to fetch Reddit posts: ${error.message}`);
  }
}
