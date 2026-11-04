import React from 'react';
import { X } from 'lucide-react';
import YouTubePlayer from './YouTubePlayer';
import Logo from './Logo';

/**
 * Edunova-Branded In-App Video Modal
 * Embeds YouTubePlayer directly inside the modal so learners can watch
 * preview and supplementary lessons without ever leaving the application.
 */
export default function VideoModal({ isOpen, onClose, videoData }) {
  if (!isOpen || !videoData) return null;

  const videoId = videoData.videoId || videoData.video_id;
  const videoUrl = videoData.videoUrl || videoData.video_url;
  const title = videoData.title || 'Course Video Lesson';
  const channelName = videoData.channelName || videoData.channel_name || 'Edunova Faculty';
  const duration = videoData.duration || '';

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '95%',
          padding: 0,
          overflow: 'hidden',
          background: 'rgba(11, 15, 25, 0.98)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Modal Header */}
        <div
          className="modal-header"
          style={{
            padding: '0.85rem 1.25rem',
            background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Logo variant="compact" size="sm" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>•</span>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                maxWidth: '400px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            aria-label="Close modal"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '0.35rem',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body with Embedded Edunova Player */}
        <div style={{ padding: '1rem', background: '#0a0f1d' }}>
          <YouTubePlayer
            videoId={videoId}
            videoUrl={videoUrl}
            title={title}
            courseTitle={videoData.courseTitle || videoData.course_title || ''}
            channelName={channelName}
            duration={duration}
          />
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.8)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Streamed in-app via Edunova Technologies Video Classroom
          </div>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
