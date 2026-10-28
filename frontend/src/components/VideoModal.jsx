import React, { useEffect } from 'react';
import { X, ExternalLink, BookOpen, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import YouTubePlayer from './YouTubePlayer';

/**
 * VideoModal Component
 * Plays embedded YouTube videos directly inside the Course Catalog or Course Details page
 * ensuring the student is never redirected away to external websites.
 */
export default function VideoModal({
  isOpen,
  onClose,
  videoData, // { videoId, title, courseTitle, courseId, description, channelName, duration }
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !videoData) return null;

  const { videoId, title, courseTitle, courseId, description, channelName, duration } = videoData;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(5, 8, 16, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '1.75rem',
          backgroundColor: '#0f172a',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(99, 102, 241, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Header with Title and Close Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '1rem',
          }}
        >
          <div>
            {courseTitle && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  marginBottom: '0.35rem',
                }}
              >
                <Layers size={14} /> Course: {courseTitle}
              </div>
            )}
            <h2 id="video-modal-title" style={{ fontSize: '1.35rem', lineHeight: 1.3 }}>
              {title || 'Video Lesson Preview'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.4rem',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Close video player"
          >
            <X size={20} />
          </button>
        </div>

        {/* Embedded YouTube Player */}
        <div style={{ marginBottom: '1.25rem' }}>
          <YouTubePlayer
            videoId={videoId}
            title={title}
            description={description}
            channelName={channelName}
            duration={duration}
            autoplay={true}
          />
        </div>

        {/* Modal Action Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Playing directly within LearnSphere LMS without external redirection.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {courseId && (
              <Link
                to={`/courses/${courseId}`}
                onClick={onClose}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <BookOpen size={16} /> Open Course Details
              </Link>
            )}
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Close Player
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
