import React, { useState } from 'react';
import { Play, Clock, Sparkles } from 'lucide-react';
import Logo from './Logo';
import YouTubePlayer from './YouTubePlayer';

/**
 * Edunova-Branded Video Resource Card
 * - 100% Edunova Technologies branding (no external YouTube logos).
 * - Plays embedded directly in-app either inline or via onPlay callback.
 * - Does not redirect users away to external YouTube site.
 */
export default function ExternalVideoCard({ video, compact = false, onPlay }) {
  const [inlinePlaying, setInlinePlaying] = useState(false);

  if (!video) return null;

  const videoId = video.videoId || video.video_id;
  const title = video.title || 'Course Video Resource';
  const channelName = video.channelName || video.channel_name || 'Edunova Technologies Faculty';
  const duration = video.duration || 'Video Lesson';
  const thumbnailUrl =
    video.thumbnailUrl ||
    video.thumbnail_url ||
    (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');

  const handlePlayClick = (e) => {
    e.preventDefault();
    if (onPlay) {
      onPlay(video);
    } else {
      setInlinePlaying((prev) => !prev);
    }
  };

  if (inlinePlaying && videoId) {
    return (
      <div style={{ marginBottom: '1rem', width: '100%' }}>
        <YouTubePlayer
          videoId={videoId}
          videoUrl={video.videoUrl || video.video_url}
          title={title}
          channelName={channelName}
          duration={duration}
        />
        <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => setInlinePlaying(false)}
            className="btn btn-secondary btn-sm"
          >
            Close Video
          </button>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Logo variant="icon" size={26} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              {channelName} • {duration}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePlayClick}
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}
        >
          <Play size={13} fill="currentColor" />
          <span>Play Lesson</span>
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
        transition: 'border-color 0.2s ease, transform 0.2s ease',
      }}
    >
      {/* Thumbnail area with play indicator */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '180px',
          background: '#0a0f1d',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={handlePlayClick}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.85)',
              transition: 'filter 0.2s ease',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'radial-gradient(circle at center, #1e293b, #0b0f19)',
            }}
          >
            <Logo variant="icon" size={52} />
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(11, 15, 25, 0.85) 0%, transparent 60%)',
          }}
        />

        {/* Center Play Button Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.9)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            transition: 'transform 0.2s ease',
          }}
        >
          <Play size={22} fill="#ffffff" style={{ marginLeft: '3px' }} />
        </div>

        {/* Duration badge */}
        {duration && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              padding: '0.2rem 0.5rem',
              background: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <Clock size={12} />
            <span>{duration}</span>
          </div>
        )}

        {/* Edunova Tag */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            padding: '0.25rem 0.65rem',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            backdropFilter: 'blur(8px)',
            borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--accent-cyan)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Sparkles size={11} />
          <span>Edunova Technologies Video Module</span>
        </div>
      </div>

      {/* Details Area */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h4
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            margin: '0 0 0.5rem 0',
            lineHeight: 1.4,
          }}
        >
          {title}
        </h4>

        <div
          style={{
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
            marginBottom: '1rem',
          }}
        >
          Instructor: <strong style={{ color: 'var(--text-main)' }}>{channelName}</strong>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            In-App HD Playback
          </span>
          <button
            type="button"
            onClick={handlePlayClick}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Play size={13} fill="currentColor" />
            <span>Watch Lesson</span>
          </button>
        </div>
      </div>
    </div>
  );
}
