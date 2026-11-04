import React, { useState, useEffect, useRef } from 'react';
import { extractYouTubeVideoId } from '../utils/youtube';
import Logo from './Logo';
import {
  Play,
  RotateCcw,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
} from 'lucide-react';

/**
 * Edunova Technologies Video Player Component
 * Fully custom UI with Edunova Technologies branding around the official
 * YouTube IFrame Player embed.
 *
 * Requirements fulfilled:
 * 1. Edunova Technologies branding (no external YouTube logos outside player).
 * 2. Embedded in-app playback with official YouTube IFrame Player API.
 * 3. Course name and lesson title displayed prominently in the player.
 * 4. Integrated Previous Lesson & Next Lesson navigation.
 * 5. Integrated Lesson completion tracking ("Mark as Completed" / "Completed").
 * 6. Saved learning progress with resume & restart functionality.
 * 7. Fully responsive desktop and mobile layouts.
 * 8. Compliant with YouTube embedding requirements (no tampering with internal player).
 */
export default function YouTubePlayer({
  videoId,
  videoUrl,
  title = 'Course Video Lesson',
  description = '',
  channelName = 'Edunova Technologies Faculty',
  duration = '',
  courseTitle = '',
  topicTitle = '',
  // Integrated Navigation
  prevLesson = null,
  nextLesson = null,
  onPrevLesson = null,
  onNextLesson = null,
  // Integrated Completion Tracking
  isCompleted = false,
  onToggleComplete = null,
  updatingProgress = false,
  onEnded = null,
  className = '',
}) {
  const effectiveId = extractYouTubeVideoId(videoId || videoUrl);
  const iframeRef = useRef(null);

  // Resume position storage key
  const storageKey = effectiveId ? `edunova_video_pos_${effectiveId}` : null;
  const initialSavedPos = storageKey ? parseInt(localStorage.getItem(storageKey) || '0', 10) : 0;

  const [savedPosition, setSavedPosition] = useState(initialSavedPos);
  const [currentStart, setCurrentStart] = useState(initialSavedPos > 10 ? initialSavedPos : 0);
  const [playerKey, setPlayerKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(initialSavedPos);

  // Sync state whenever the video changes
  useEffect(() => {
    if (!storageKey) return;
    const pos = parseInt(localStorage.getItem(storageKey) || '0', 10);
    setSavedPosition(pos);
    setCurrentStart(pos > 10 ? pos : 0);
    setLastSavedTime(pos);
  }, [storageKey]);

  // Listen for YouTube IFrame Player API postMessages for playback progress
  useEffect(() => {
    if (!effectiveId) return;

    const handleMessage = (event) => {
      if (!event.origin || !event.origin.includes('youtube')) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        // infoDelivery event containing currentTime and playerState
        if (data.event === 'infoDelivery' && data.info) {
          const { currentTime, playerState } = data.info;
          if (typeof currentTime === 'number' && currentTime > 0) {
            const rounded = Math.floor(currentTime);
            setLastSavedTime(rounded);
            if (storageKey && rounded % 3 === 0) {
              // Auto-save timestamp every 3 seconds to localStorage
              localStorage.setItem(storageKey, String(rounded));
              setSavedPosition(rounded);
            }
          }
          if (playerState === 1) {
            setIsPlaying(true);
          } else if (playerState === 2) {
            setIsPlaying(false);
          } else if (playerState === 0) {
            // Video completed
            setIsPlaying(false);
            if (onEnded) onEnded();
          }
        }
      } catch {
        // Ignore non-JSON postMessages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [effectiveId, storageKey, onEnded]);

  const handleRestart = () => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
    setSavedPosition(0);
    setCurrentStart(0);
    setPlayerKey((k) => k + 1);
  };

  const handleResume = (seconds) => {
    setCurrentStart(seconds);
    setPlayerKey((k) => k + 1);
  };

  const formatSeconds = (sec) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

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
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px dashed var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <Logo variant="icon" size={36} />
        </div>
        <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)', fontSize: '1.1rem' }}>
          Interactive Educational Lesson
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: '420px', margin: 0 }}>
          Study the curriculum specifications, complete the hands-on lab exercise, and verify your understanding below.
        </p>
      </div>
    );
  }

  // Privacy-enhanced official YouTube embed URL with JS API and host origin
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${effectiveId}?rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(origin)}${currentStart > 0 ? `&start=${currentStart}` : ''}`;

  return (
    <div
      className={`edunova-player-wrapper ${className}`}
      style={{
        background: 'rgba(11, 15, 25, 0.98)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65)',
        marginBottom: '1.75rem',
      }}
    >
      {/* 1. Header: Edunova Technologies Logo & Stream Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.9rem 1.25rem',
          background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Logo variant="full" size="sm" />
          <div
            style={{
              height: '18px',
              width: '1px',
              background: 'var(--border-subtle)',
            }}
          />
          <span
            style={{
              fontSize: '0.725rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--accent-cyan)',
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              padding: '0.2rem 0.55rem',
              borderRadius: '4px',
            }}
          >
            Classroom Player
          </span>
        </div>

        {/* Right Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={13} />
            <span>In-App HD Stream</span>
          </div>
        </div>
      </div>

      {/* 2. Course Name & Lesson Title Banner */}
      <div
        style={{
          padding: '0.9rem 1.25rem',
          background: 'rgba(15, 23, 42, 0.75)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        {courseTitle && (
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Course: {courseTitle}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {title}
            </h2>
            {topicTitle && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Topic: <strong style={{ color: 'var(--text-main)' }}>{topicTitle}</strong>
              </div>
            )}
          </div>

          {/* Saved Learning Progress & Resume Bar */}
          {savedPosition > 10 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>
                Saved: <strong style={{ color: '#38bdf8' }}>{formatSeconds(savedPosition)}</strong>
              </span>
              <button
                type="button"
                onClick={handleRestart}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                title="Restart from beginning"
              >
                <RotateCcw size={11} />
                <span>Restart</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Embedded Video IFrame (16:9 Aspect Ratio) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          background: '#000000',
        }}
      >
        <iframe
          key={playerKey}
          ref={iframeRef}
          src={embedUrl}
          title={title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="eager"
        />
      </div>

      {/* 4. Integrated Navigation & Completion Controls Bar */}
      {(onPrevLesson || onNextLesson || onToggleComplete) && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 15, 25, 0.98) 100%)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {/* Previous Lesson Button */}
          <div>
            {onPrevLesson ? (
              <button
                type="button"
                onClick={onPrevLesson}
                disabled={!prevLesson}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  opacity: prevLesson ? 1 : 0.4,
                  cursor: prevLesson ? 'pointer' : 'not-allowed',
                }}
                title={prevLesson ? `Previous: ${prevLesson.title}` : 'First lesson'}
              >
                <ChevronLeft size={16} />
                <span>Previous Lesson</span>
              </button>
            ) : (
              <div />
            )}
          </div>

          {/* Lesson Completion Tracking Button */}
          <div>
            {onToggleComplete && (
              <button
                type="button"
                onClick={onToggleComplete}
                disabled={updatingProgress}
                className={`btn btn-sm ${isCompleted ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  background: isCompleted ? 'var(--success-bg)' : undefined,
                  color: isCompleted ? '#34d399' : undefined,
                  borderColor: isCompleted ? 'rgba(16, 185, 129, 0.4)' : undefined,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontWeight: 600,
                  padding: '0.45rem 1rem',
                }}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Circle size={16} />
                    <span>Mark as Completed</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Next Lesson Button */}
          <div>
            {onNextLesson ? (
              <button
                type="button"
                onClick={onNextLesson}
                disabled={!nextLesson}
                className="btn btn-primary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  opacity: nextLesson ? 1 : 0.4,
                  cursor: nextLesson ? 'pointer' : 'not-allowed',
                }}
                title={nextLesson ? `Next: ${nextLesson.title}` : 'Last lesson'}
              >
                <span>Next Lesson</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      )}

      {/* 5. Player Metadata & Attribution Footer */}
      <div
        style={{
          padding: '0.75rem 1.25rem',
          background: 'rgba(10, 15, 26, 0.98)',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {channelName && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={13} color="var(--primary)" />
              <span>Instructor: <strong style={{ color: 'var(--text-main)' }}>{channelName}</strong></span>
            </span>
          )}
          {duration && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={13} />
              <span>Duration: <strong>{duration}</strong></span>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          <Sparkles size={13} color="var(--primary)" />
          <span>Edunova Technologies Video Classroom</span>
        </div>
      </div>
    </div>
  );
}
