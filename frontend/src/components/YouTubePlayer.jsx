import React, { useState, useEffect } from 'react';
import { extractYouTubeVideoId, getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../utils/youtube';
import { Play, AlertCircle, ExternalLink, RefreshCw, Youtube } from 'lucide-react';

/**
 * YouTubePlayer Component
 * Renders a responsive 16:9 embedded YouTube player adhering to official embedding guidelines.
 * Includes loading states, sandboxing, accessibility labels, and playback fallback states.
 */
export default function YouTubePlayer({
  videoId,
  videoUrl,
  title = 'Educational Video Lesson',
  description = '',
  channelName = '',
  duration = '',
  autoplay = false,
  className = '',
}) {
  const [loading, setLoading] = useState(true);
  const [playbackError, setPlaybackError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Extract and validate the 11-char YouTube ID
  const effectiveId = extractYouTubeVideoId(videoId || videoUrl);
  const embedUrl = effectiveId ? getYouTubeEmbedUrl(effectiveId, { autoplay }) : '';
  const watchUrl = effectiveId ? getYouTubeWatchUrl(effectiveId) : '';

  // Reset states whenever videoId changes
  useEffect(() => {
    setLoading(true);
    setPlaybackError(false);
  }, [effectiveId]);

  if (!effectiveId) {
    return (
      <div
        className="card"
        style={{
          aspectRatio: '16 / 9',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(17, 24, 39, 0.85)',
          border: '1px dashed var(--border-subtle)',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <Youtube size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
        <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>No Video Available</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px' }}>
          This lesson does not currently have an associated YouTube video attached.
        </p>
      </div>
    );
  }

  return (
    <div className={`youtube-player-wrapper ${className}`} style={{ width: '100%', position: 'relative' }}>
      {/* 16:9 Video Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: '#000000',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px var(--border-subtle)',
        }}
      >
        {/* Loading Overlay */}
        {loading && (
          <div
            className="skeleton"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '0.75rem',
              backgroundColor: '#0d131f',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 1.8s infinite',
              }}
            >
              <Play size={24} color="var(--primary)" />
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Loading embedded video lesson...
            </span>
          </div>
        )}

        {/* Playback Fallback Overlay (if user reports issue or embedding blocked) */}
        {playbackError ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              background: 'radial-gradient(circle at center, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.98))',
              textAlign: 'center',
            }}
          >
            <AlertCircle size={44} style={{ color: 'var(--warning)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Embedded Playback Notice</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              If third-party cookies, privacy extensions, or YouTube embedding restrictions prevent playback in this frame, you can open the original verified video directly on YouTube.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ExternalLink size={16} /> Open on YouTube
              </a>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setPlaybackError(false);
                  setLoading(true);
                  setIframeKey((prev) => prev + 1);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <RefreshCw size={16} /> Reload Player
              </button>
            </div>
          </div>
        ) : (
          /* Official YouTube Embed IFrame */
          <iframe
            key={iframeKey}
            src={embedUrl}
            title={title || 'YouTube Educational Video Player'}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0,
            }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setPlaybackError(true);
            }}
          />
        )}
      </div>

      {/* Video Attribution & Auxiliary Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginTop: '0.85rem',
          fontSize: '0.825rem',
          color: 'var(--text-dim)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {channelName && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--primary)',
                fontWeight: 600,
              }}
            >
              <Youtube size={14} /> Channel: {channelName}
            </span>
          )}

          {duration && (
            <span style={{ color: 'var(--text-muted)' }}>
              Duration: <strong>{duration}</strong>
            </span>
          )}
        </div>

        {/* Video Fallback Toggle */}
        <button
          type="button"
          onClick={() => setPlaybackError((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '0.8rem',
            padding: 0,
          }}
        >
          {playbackError ? 'Show Player' : 'Having trouble playing? Click here'}
        </button>
      </div>

      {description && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
    </div>
  );
}
