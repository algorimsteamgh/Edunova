import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { lessonApi, progressApi } from '../services/api';
import YouTubePlayer from '../components/YouTubePlayer';
import {
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  AlertCircle,
  ArrowLeft,
  Play,
  Layers,
} from 'lucide-react';

export default function LessonViewer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchLesson = () => {
    setLoading(true);
    lessonApi
      .getById(id)
      .then((res) => {
        setData(res.data.data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const handleToggleComplete = async () => {
    if (!data.enrollmentId) return;
    setUpdating(true);
    try {
      const nextCompleted = !data.isCompleted;
      await progressApi.updateProgress(data.enrollmentId, data.lesson.id, nextCompleted);
      setData((prev) => ({
        ...prev,
        isCompleted: nextCompleted,
      }));
    } catch (err) {
      alert(`Error updating progress: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-container" style={{ maxWidth: '960px' }}>
        <div className="card skeleton" style={{ height: '540px' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container page-container" style={{ maxWidth: '860px' }}>
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={20} />
          <span>{error || 'Unable to display lesson content.'}</span>
        </div>
        <Link to="/courses" className="btn btn-secondary">
          <ArrowLeft size={16} /> Return to Courses
        </Link>
      </div>
    );
  }

  const { lesson, course, navigation, enrollmentId, isCompleted } = data;

  return (
    <div className="container page-container" style={{ maxWidth: '1020px' }}>
      {/* Breadcrumb / Course Nav */}
      <div
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to={`/courses/${course.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            <ArrowLeft size={16} /> Back to {course.title}
          </Link>

          <Link
            to={`/courses/${course.id}/learn?lesson=${lesson.id}`}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Layers size={14} /> Open Full Classroom Player
          </Link>
        </div>

        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          Lesson {navigation.currentIndex} of {navigation.totalLessons}
        </span>
      </div>

      {/* Main Lesson Card */}
      <article className="card" style={{ padding: '2rem 2.5rem', marginBottom: '2rem' }}>
        {/* Lesson Header */}
        <header
          style={{
            paddingBottom: '1.5rem',
            marginBottom: '1.75rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span className="badge badge-published" style={{ marginBottom: '0.5rem' }}>
              {course.category}
            </span>
            <h1 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>{lesson.title}</h1>
          </div>

          {/* Progress Completion Toggle */}
          {enrollmentId && (
            <button
              onClick={handleToggleComplete}
              disabled={updating}
              className={`btn ${isCompleted ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                background: isCompleted ? 'var(--success-bg)' : undefined,
                color: isCompleted ? '#34d399' : undefined,
                borderColor: isCompleted ? 'rgba(16, 185, 129, 0.4)' : undefined,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {isCompleted ? <CheckCircle size={18} color="#34d399" /> : <Circle size={18} />}
              {updating ? 'Updating...' : isCompleted ? 'Completed' : 'Mark as Complete'}
            </button>
          )}
        </header>

        {/* Embedded YouTube Video Player */}
        <div style={{ marginBottom: '2.5rem' }}>
          <YouTubePlayer
            videoId={lesson.video_id}
            videoUrl={lesson.video_url}
            title={lesson.title}
            description={lesson.description}
            channelName={lesson.channel_name}
            duration={lesson.duration}
            autoplay={false}
          />
        </div>

        {/* Written Lesson Notes */}
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
            Curriculum Documentation & Code Notes
          </h3>
          <div
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.8,
              color: '#e5e7eb',
              whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {lesson.content}
          </div>
        </div>
      </article>

      {/* Navigation Footer (Prev / Next) */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {navigation.prevLessonId ? (
          <Link to={`/lessons/${navigation.prevLessonId}`} className="btn btn-secondary">
            <ChevronLeft size={18} /> Previous: {navigation.prevLessonTitle}
          </Link>
        ) : (
          <div />
        )}

        {navigation.nextLessonId ? (
          <Link to={`/lessons/${navigation.nextLessonId}`} className="btn btn-primary">
            Next: {navigation.nextLessonTitle} <ChevronRight size={18} />
          </Link>
        ) : (
          <Link to={`/courses/${course.id}`} className="btn btn-secondary">
            Finish Course Review <CheckCircle size={18} />
          </Link>
        )}
      </nav>
    </div>
  );
}
