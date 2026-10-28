/**
 * LearnSphere YouTube Video Utilities
 * Provides secure parsing, normalization, and validation of YouTube URLs and video IDs.
 */

export const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

const ALLOWED_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'gaming.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

/**
 * Extracts and validates an 11-character YouTube video ID from a raw URL or standalone ID string.
 * Rejects unsupported domains, arbitrary URLs, and malformed strings.
 *
 * @param {string} input - Raw URL or 11-character ID
 * @returns {string|null} - Validated 11-character YouTube video ID, or null
 */
export function extractYouTubeVideoId(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  try {
    const urlString = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

    const parsed = new URL(urlString);
    const host = parsed.hostname.toLowerCase();

    if (!ALLOWED_HOSTS.has(host)) {
      return null;
    }

    // Handle youtu.be/VIDEO_ID
    if (host === 'youtu.be' || host === 'www.youtu.be') {
      const match = parsed.pathname.match(/^\/([a-zA-Z0-9_-]{11})/);
      if (match && YOUTUBE_ID_REGEX.test(match[1])) {
        return match[1];
      }
      return null;
    }

    // Handle youtube.com/watch?v=VIDEO_ID
    if (parsed.pathname === '/watch') {
      const v = parsed.searchParams.get('v');
      if (v && YOUTUBE_ID_REGEX.test(v)) {
        return v;
      }
      return null;
    }

    // Handle youtube.com/embed/VIDEO_ID, /shorts/VIDEO_ID, /v/VIDEO_ID, /live/VIDEO_ID
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
 * Validates whether the given string is a valid YouTube video ID.
 * @param {string} videoId
 * @returns {boolean}
 */
export function isValidYouTubeVideoId(videoId) {
  return typeof videoId === 'string' && YOUTUBE_ID_REGEX.test(videoId.trim());
}

/**
 * Generates the canonical standard YouTube watch URL from a video ID or raw URL.
 * @param {string} input
 * @returns {string|null}
 */
export function normalizeYouTubeUrl(input) {
  const videoId = extractYouTubeVideoId(input);
  if (!videoId) return null;
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Constructs the official privacy-enhanced embed URL for the embedded player.
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
