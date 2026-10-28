/**
 * Frontend YouTube Utility
 * Extracts, validates, and generates embed URLs for YouTube videos.
 */

export const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

const ALLOWED_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

/**
 * Extracts the 11-character YouTube video ID.
 * @param {string} input - Raw URL or ID
 * @returns {string|null}
 */
export function extractYouTubeVideoId(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (YOUTUBE_ID_REGEX.test(trimmed)) return trimmed;

  try {
    const urlString = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

    const parsed = new URL(urlString);
    const host = parsed.hostname.toLowerCase();

    if (!ALLOWED_HOSTS.has(host)) return null;

    if (host === 'youtu.be' || host === 'www.youtu.be') {
      const match = parsed.pathname.match(/^\/([a-zA-Z0-9_-]{11})/);
      if (match && YOUTUBE_ID_REGEX.test(match[1])) return match[1];
      return null;
    }

    if (parsed.pathname === '/watch') {
      const v = parsed.searchParams.get('v');
      if (v && YOUTUBE_ID_REGEX.test(v)) return v;
      return null;
    }

    const pathMatch = parsed.pathname.match(/^\/(?:embed|shorts|v|live)\/([a-zA-Z0-9_-]{11})/);
    if (pathMatch && YOUTUBE_ID_REGEX.test(pathMatch[1])) {
      return pathMatch[1];
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Validates whether string is a valid YouTube video ID.
 * @param {string} id
 * @returns {boolean}
 */
export function isValidYouTubeVideoId(id) {
  return typeof id === 'string' && YOUTUBE_ID_REGEX.test(id.trim());
}

/**
 * Constructs the privacy-enhanced embed URL for the iframe.
 * @param {string} videoId
 * @param {Object} [options]
 * @returns {string}
 */
export function getYouTubeEmbedUrl(videoId, options = {}) {
  const cleanId = extractYouTubeVideoId(videoId);
  if (!cleanId) return '';

  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
    ...(options.autoplay ? { autoplay: '1' } : {}),
    ...(options.start ? { start: String(options.start) } : {}),
  });

  return `https://www.youtube-nocookie.com/embed/${cleanId}?${params.toString()}`;
}

/**
 * Returns the fallback standard YouTube watch URL.
 * @param {string} videoId
 * @returns {string}
 */
export function getYouTubeWatchUrl(videoId) {
  const cleanId = extractYouTubeVideoId(videoId);
  if (!cleanId) return '';
  return `https://www.youtube.com/watch?v=${cleanId}`;
}
