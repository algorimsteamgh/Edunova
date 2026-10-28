import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { courseApi, lessonApi, progressApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import YouTubePlayer from '../components/YouTubePlayer';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Play,
  Clock,
  Youtube,
  BookOpen,
  Layers,
  AlertCircle,
  Menu,
  X,
  ExternalLink,
  Terminal,
  Sparkles,
} from 'lucide-react';

export default function CoursePlayer() {
  const { id: courseId, lessonId: paramLessonId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [courseData, setCourseData] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load course details, ordered lessons, and enrollment progress
  const fetchCourseContent = async () => {
    setLoading(true);
    setError('');

    try {
      // Determine the courseId: if not directly provided in params, fetch via lessonId
      let targetCourseId = courseId;

      if (!targetCourseId && paramLessonId) {
        const lessonRes = await lessonApi.getById(paramLessonId);
        targetCourseId = lessonRes.data.data.course.id;
      }

      if (!targetCourseId) {
        throw new Error('Course identifier not found.');
      }

      const res = await courseApi.getById(targetCourseId);
      const data = res.data.data;

      // Access verification: User must be enrolled or admin
      if (!data.enrollment && !isAdmin) {
        // If first lesson is preview, allow preview mode
        const hasPreview = data.lessons.some((l) => l.is_preview);
        if (!hasPreview) {
          navigate(`/courses/${targetCourseId}`);
          return;
        }
      }

      setCourseData(data);

      // Determine initial active lesson:
      // Priority: 1. URL search param 'lesson', 2. paramLessonId, 3. first incomplete lesson, 4. first lesson
      const requestedLessonId = searchParams.get('lesson') || paramLessonId;
      let initialLesson = null;

      if (requestedLessonId) {
        initialLesson = data.lessons.find((l) => l.id === requestedLessonId);
      }

      if (!initialLesson) {
        initialLesson = data.lessons.find((l) => !l.is_completed) || data.lessons[0];
      }

      if (initialLesson) {
        // Fetch full lesson content if needed
        loadLessonDetails(initialLesson.id, data);
      }
    } catch (err) {
      setError(err.message || 'Unable to load course lessons.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch full details of an active lesson (markdown content, etc.)
  const loadLessonDetails = async (lessonId, currentCourseData = null) => {
    try {
      const res = await lessonApi.getById(lessonId);
      setActiveLesson(res.data.data.lesson);
    } catch {
      // Fallback to local lesson object in courseData
      const local = (currentCourseData || courseData)?.lessons?.find((l) => l.id === lessonId);
      if (local) setActiveLesson(local);
    }
  };

  useEffect(() => {
    fetchCourseContent();
  }, [courseId, paramLessonId]);

  // Handle switching lessons
  const handleSelectLesson = (lesson) => {
    setSearchParams({ lesson: lesson.id });
    loadLessonDetails(lesson.id);
    setSidebarOpen(false); // Close mobile drawer
  };

  // Toggle lesson completion
  const handleToggleComplete = async () => {
    if (!courseData?.enrollment?.id || !activeLesson) return;
    setUpdatingProgress(true);

    try {
      const enrollmentId = courseData.enrollment.id;
      const currentCompleted = Boolean(
        courseData.lessons.find((l) => l.id === activeLesson.id)?.is_completed
      );
      const nextCompleted = !currentCompleted;

      await progressApi.updateProgress(enrollmentId, activeLesson.id, nextCompleted);

      // Optimistically update local courseData lessons and progress
      setCourseData((prev) => {
        if (!prev) return prev;
        const updatedLessons = prev.lessons.map((l) =>
          l.id === activeLesson.id ? { ...l, is_completed: nextCompleted } : l
        );
        const completedCount = updatedLessons.filter((l) => l.is_completed).length;
        const total = updatedLessons.length;
        const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        return {
          ...prev,
          lessons: updatedLessons,
          progress: {
            completedLessons: completedCount,
            totalLessons: total,
            percentage,
          },
        };
      });
    } catch (err) {
      alert(`Error updating progress: ${err.message}`);
    } finally {
      setUpdatingProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-container" style={{ maxWidth: '1240px' }}>
        <div className="card skeleton" style={{ height: '70px', marginBottom: '1.5rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
          <div className="card skeleton" style={{ height: '520px' }} />
          <div className="card skeleton" style={{ height: '520px' }} />
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="container page-container" style={{ maxWidth: '860px' }}>
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={20} />
          <span>{error || 'Unable to load course player.'}</span>
        </div>
        <Link to="/courses" className="btn btn-secondary">
          <ArrowLeft size={16} /> Return to Course Catalog
        </Link>
      </div>
    );
  }

  const { course, lessons, enrollment, progress } = courseData;
  const currentIndex = lessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const isCurrentLessonCompleted = Boolean(
    lessons.find((l) => l.id === activeLesson?.id)?.is_completed
  );

  return (
    <div className="container page-container" style={{ maxWidth: '1280px', paddingBottom: '3rem' }}>
      {/* Top Bar: Navigation, Course Title & Progress Bar */}
      <header
        className="card"
        style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid var(--border-accent)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to={`/courses/${course.id}`}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={16} /> Course Overview
          </Link>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {course.category}
            </div>
            <h1 style={{ fontSize: '1.25rem', lineHeight: 1.2, margin: 0 }}>{course.title}</h1>
          </div>
        </div>

        {/* Progress & Sidebar Toggle for Mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {progress && (
            <div style={{ minWidth: '180px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>Course Progress</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  {progress.completedLessons}/{progress.totalLessons} ({progress.percentage}%)
                </span>
              </div>
              <div
                style={{
                  height: '6px',
                  width: '100%',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progress.percentage}%`,
                    backgroundColor: progress.percentage === 100 ? '#10b981' : 'var(--primary)',
                    borderRadius: '9999px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* Mobile Sidebar Toggle */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setSidebarOpen((prev) => !prev)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Menu size={16} /> Curriculum
          </button>
        </div>
      </header>

      {/* Main Learning Workspace */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: '1.75rem',
          alignItems: 'start',
        }}
        className="course-player-grid"
      >
        {/* Left Column: Embedded YouTube Player & Lesson Content */}
        <main style={{ minWidth: 0 }}>
          {activeLesson ? (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Responsive 16:9 YouTube Player */}
              <div style={{ marginBottom: '1.5rem' }}>
                <YouTubePlayer
                  videoId={activeLesson.video_id}
                  videoUrl={activeLesson.video_url}
                  title={activeLesson.title}
                  description={activeLesson.description}
                  channelName={activeLesson.channel_name}
                  duration={activeLesson.duration}
                  autoplay={false}
                />
              </div>

              {/* Lesson Controls: Mark Complete & Prev / Next */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: 'var(--primary)',
                        background: 'rgba(99, 102, 241, 0.12)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                      }}
                    >
                      {activeLesson.topicTitle || activeLesson.topic_title
                        ? `Topic: ${activeLesson.topicTitle || activeLesson.topic_title}`
                        : `Module #${activeLesson.position}`}
                    </span>
                    {activeLesson.channel_name && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Youtube size={12} color="var(--primary)" /> {activeLesson.channel_name}
                      </span>
                    )}
                    {activeLesson.duration && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {activeLesson.duration}
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '1.4rem', margin: '0.2rem 0 0.35rem' }}>{activeLesson.title}</h2>
                  {(activeLesson.subtopicTitle || activeLesson.subtopic_title) && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong>Subtopic:</strong> {activeLesson.subtopicTitle || activeLesson.subtopic_title}
                    </div>
                  )}
                </div>

                {/* Mark as Completed Button */}
                {enrollment && (
                  <button
                    type="button"
                    onClick={handleToggleComplete}
                    disabled={updatingProgress}
                    className={`btn ${isCurrentLessonCompleted ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      background: isCurrentLessonCompleted ? 'var(--success-bg)' : undefined,
                      color: isCurrentLessonCompleted ? '#34d399' : undefined,
                      borderColor: isCurrentLessonCompleted ? 'rgba(16, 185, 129, 0.4)' : undefined,
                      padding: '0.65rem 1.25rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 600,
                    }}
                  >
                    {isCurrentLessonCompleted ? (
                      <>
                        <CheckCircle2 size={18} color="#34d399" /> Completed
                      </>
                    ) : (
                      <>
                        <Circle size={18} /> Mark as Completed
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Written Notes / Curriculum Documentation */}
              <div style={{ padding: '0.5rem 0.25rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
                  Lesson Curriculum & Code Notes
                </h3>
                <div
                  style={{
                    fontSize: '0.975rem',
                    lineHeight: 1.8,
                    color: '#e2e8f0',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {activeLesson.content || 'Comprehensive tutorial video notes and code demonstrations.'}
                </div>
              </div>

              {/* Hands-on Practical Lab Exercise */}
              {(activeLesson.practicalExercise || activeLesson.practical_exercise) && (
                <div
                  style={{
                    marginTop: '1.5rem',
                    marginBottom: '1.5rem',
                    padding: '1.25rem 1.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(15, 23, 42, 0.7))',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#10b981', fontWeight: 600, fontSize: '1.05rem' }}>
                    <Terminal size={18} />
                    <span>Hands-on Practical Lab Exercise</span>
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '0.925rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {activeLesson.practicalExercise || activeLesson.practical_exercise}
                  </div>
                </div>
              )}

              {/* Reference Documentation & Resources */}
              {(() => {
                const urls = activeLesson.referenceUrls || (typeof activeLesson.reference_urls === 'string' ? JSON.parse(activeLesson.reference_urls || '[]') : (activeLesson.reference_urls || []));
                if (!urls || urls.length === 0) return null;
                return (
                  <div
                    style={{
                      marginTop: '1.25rem',
                      marginBottom: '1.5rem',
                      padding: '1.25rem 1.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      background: 'rgba(56, 189, 248, 0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#38bdf8', fontWeight: 600, fontSize: '1.05rem' }}>
                      <BookOpen size={18} />
                      <span>Official Documentation & Technical References</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {urls.map((url, idx) => (
                        <li key={idx}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              color: '#60a5fa',
                              fontSize: '0.875rem',
                              textDecoration: 'none',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                          >
                            <ExternalLink size={13} /> {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="card empty-state">
              <BookOpen size={48} className="empty-icon" />
              <h3>Select a Lesson to Begin</h3>
            </div>
          )}

          {/* Navigation Controls: Previous / Next */}
          <nav
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {prevLesson ? (
              <button
                type="button"
                onClick={() => handleSelectLesson(prevLesson)}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ChevronLeft size={18} /> Previous: {prevLesson.title}
              </button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <button
                type="button"
                onClick={() => handleSelectLesson(nextLesson)}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Next: {nextLesson.title} <ChevronRight size={18} />
              </button>
            ) : (
              <Link
                to={`/courses/${course.id}`}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Finish Course Review <CheckCircle2 size={18} />
              </Link>
            )}
          </nav>
        </main>

        {/* Right Column: Curriculum Syllabus Navigation Sidebar */}
        <aside
          className={`card ${sidebarOpen ? 'sidebar-open' : ''}`}
          style={{
            padding: '1.25rem',
            position: 'sticky',
            top: '20px',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Course Curriculum</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                {lessons.length} Modules Available
              </span>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSidebarOpen(false)}
              style={{ padding: '0.35rem', borderRadius: '50%' }}
              aria-label="Close sidebar"
            >
              <X size={16} />
            </button>
          </div>

          {/* Lesson List Grouped by Topic */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(() => {
              const topicGroups = [];
              const topicMap = new Map();

              lessons.forEach((lesson) => {
                const topicKey = lesson.topicTitle || lesson.topic_title || 'General Curriculum';
                if (!topicMap.has(topicKey)) {
                  const grp = { topicTitle: topicKey, lessons: [] };
                  topicMap.set(topicKey, grp);
                  topicGroups.push(grp);
                }
                topicMap.get(topicKey).lessons.push(lesson);
              });

              return topicGroups.map((group, gIdx) => (
                <div key={group.topicTitle + gIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: 'var(--text-dim)',
                      padding: '0.2rem 0.25rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Topic #{gIdx + 1}: {group.topicTitle}
                  </div>
                  {group.lessons.map((lesson) => {
                    const isActive = lesson.id === activeLesson?.id;
                    const isCompleted = Boolean(lesson.is_completed);

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => handleSelectLesson(lesson)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          border: isActive
                            ? '1px solid var(--primary)'
                            : isCompleted
                            ? '1px solid rgba(16, 185, 129, 0.25)'
                            : '1px solid var(--border-subtle)',
                          backgroundColor: isActive
                            ? 'rgba(99, 102, 241, 0.12)'
                            : isCompleted
                            ? 'rgba(16, 185, 129, 0.04)'
                            : 'rgba(255, 255, 255, 0.01)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          width: '100%',
                          color: 'inherit',
                        }}
                      >
                        {/* Status Indicator Icon */}
                        <div style={{ flexShrink: 0 }}>
                          {isCompleted ? (
                            <CheckCircle2 size={18} color="#10b981" />
                          ) : isActive ? (
                            <Play size={16} color="var(--primary)" fill="var(--primary)" />
                          ) : (
                            <Circle size={16} color="var(--text-dim)" />
                          )}
                        </div>

                        {/* Title & Duration */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {lesson.position}. {lesson.title.replace(/^[0-9]+\.\s*/, '')}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.75rem',
                              color: 'var(--text-dim)',
                              marginTop: '0.2rem',
                            }}
                          >
                            {lesson.duration && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                <Clock size={11} /> {lesson.duration}
                              </span>
                            )}
                            {lesson.channel_name && (
                              <span>• {lesson.channel_name}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        </aside>
      </div>
    </div>
  );
}
