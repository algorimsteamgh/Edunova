import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courseApi, enrollmentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoModal from '../components/VideoModal';
import {
  BookOpen,
  User,
  CheckCircle2,
  Lock,
  ArrowRight,
  Layers,
  AlertCircle,
  Play,
  Clock,
  Youtube,
  Sparkles,
} from 'lucide-react';

export default function CourseDetails() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Active in-page embedded video player modal
  const [activeModalVideo, setActiveModalVideo] = useState(null);

  const fetchCourse = () => {
    setLoading(true);
    courseApi
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
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }

    setEnrolling(true);
    setError('');
    setSuccess('');

    try {
      await enrollmentApi.enroll(id);
      setSuccess('You have successfully enrolled in this course! All video lessons are unlocked.');
      fetchCourse(); // Refresh enrollment status
    } catch (err) {
      setError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-container">
        <div className="card skeleton" style={{ height: '300px', marginBottom: '2rem' }} />
        <div className="card skeleton" style={{ height: '400px' }} />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="container page-container">
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
        <Link to="/courses" className="btn btn-secondary">
          Back to Courses
        </Link>
      </div>
    );
  }

  const { course, lessons, enrollment, progress } = data;
  const isEnrolled = Boolean(enrollment);

  const handlePreviewLesson = (lesson) => {
    setActiveModalVideo({
      videoId: lesson.video_id,
      title: lesson.title,
      courseTitle: course.title,
      courseId: course.id,
      description: lesson.description || lesson.content,
      channelName: lesson.channel_name || 'Verified YouTube Educator',
      duration: lesson.duration || '',
    });
  };

  const handlePreviewCourse = () => {
    const firstPreview = lessons.find((l) => l.video_id) || lessons[0];
    setActiveModalVideo({
      videoId: course.preview_video_id || (firstPreview ? firstPreview.video_id : 'bMknfKXIFA8'),
      title: `${course.title} — Course Introduction & Overview`,
      courseTitle: course.title,
      courseId: course.id,
      description: course.description,
      channelName: (firstPreview && firstPreview.channel_name) || 'LearnSphere Engineering',
      duration: course.estimated_duration || 'Full Course',
    });
  };

  return (
    <div className="container page-container">
      {/* Direct In-Page Embedded Video Player Modal */}
      <VideoModal
        isOpen={Boolean(activeModalVideo)}
        onClose={() => setActiveModalVideo(null)}
        videoData={activeModalVideo}
      />

      {/* Notifications */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Course Header Banner */}
      <div
        className="card"
        style={{
          padding: '2.5rem',
          marginBottom: '2.5rem',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.9))',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid var(--border-accent)',
        }}
      >
        <div style={{ maxWidth: '850px' }}>
          {/* Top Badges */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="badge badge-published">{course.category}</span>
            <span className={`badge ${course.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
              {course.status}
            </span>
            {course.difficulty_level || course.difficultyLevel ? (
              <span
                style={{
                  fontSize: '0.8rem',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  fontWeight: 600,
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                }}
              >
                {course.difficulty_level || course.difficultyLevel} Level
              </span>
            ) : null}
            {course.estimated_duration && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <Clock size={13} /> {course.estimated_duration}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '2.4rem', marginBottom: '1rem', lineHeight: 1.25 }}>{course.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            {course.description}
          </p>

          {/* Quick Metrics */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
              marginBottom: '2rem',
              color: 'var(--text-dim)',
              fontSize: '0.9rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--primary)" />
              <span>
                Instructor: <strong>{course.instructor_name || 'Staff Instructor'}</strong>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="var(--primary)" />
              <span>
                <strong>{lessons.length}</strong> Video Lessons
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--primary)" />
              <span>
                <strong>{course.enrollments_count || 0}</strong> Students Enrolled
              </span>
            </div>
          </div>

          {/* Enrolled Progress Bar */}
          {isEnrolled && progress && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '2rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Your Course Progress</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  {progress.completedLessons} of {progress.totalLessons} Completed ({progress.percentage}%)
                </span>
              </div>
              <div
                style={{
                  height: '8px',
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
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Call to Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {isEnrolled ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span className="badge badge-active" style={{ padding: '0.55rem 1rem' }}>
                  <CheckCircle2 size={16} /> Enrolled ({enrollment.status})
                </span>
                {lessons.length > 0 && (
                  <Link
                    to={`/courses/${course.id}/learn`}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.75rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Play size={18} fill="white" /> Start / Continue Learning <ArrowRight size={18} />
                  </Link>
                )}
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling || course.status !== 'published'}
                className="btn btn-primary"
                style={{ padding: '0.85rem 2rem', fontSize: '1.05rem' }}
              >
                {enrolling ? 'Processing Enrollment...' : 'Enroll in this Course'}
              </button>
            )}

            {/* Direct Watch Trailer / Video Preview Button */}
            <button
              type="button"
              onClick={handlePreviewCourse}
              className="btn btn-secondary"
              style={{ padding: '0.85rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              title="Watch embedded course trailer directly in LMS"
            >
              <Play size={16} /> Watch Course Preview
            </button>
          </div>
        </div>
      </div>

      {/* Learning Objectives */}
      {((course.learningObjectives && course.learningObjectives.length > 0) ||
        (Array.isArray(course.learning_objectives) && course.learning_objectives.length > 0)) && (
        <div
          className="card"
          style={{
            padding: '1.5rem 1.75rem',
            marginBottom: '2rem',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(15, 23, 42, 0.6))',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Sparkles size={18} color="var(--primary)" /> Learning Objectives & Core Competencies
          </h3>
          <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem', listStyle: 'none', padding: 0, margin: 0 }}>
            {(course.learningObjectives || course.learning_objectives || []).map((obj, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.925rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '3px' }} />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Course Syllabus & Topic-Subtopic-Lesson Hierarchy */}
      <div className="card">
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Curriculum Modules & YouTube Video Lessons</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Structured hierarchy: Course → Topics → Subtopics → Lessons → Videos & Exercises
            </p>
          </div>
        </div>

        {lessons.length === 0 ? (
          <div className="empty-state">
            <BookOpen className="empty-icon" size={40} />
            <h4 className="empty-title">No Lessons Published Yet</h4>
            <p className="empty-desc">The instructor is currently preparing curriculum modules.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {(() => {
              // Group lessons by topic if available
              const topicGroups = [];
              const topicMap = new Map();

              lessons.forEach((lesson) => {
                const topicKey = lesson.topicTitle || lesson.topic_title || 'General Curriculum';
                if (!topicMap.has(topicKey)) {
                  const grp = {
                    topicTitle: topicKey,
                    subtopicTitle: lesson.subtopicTitle || lesson.subtopic_title || '',
                    lessons: [],
                  };
                  topicMap.set(topicKey, grp);
                  topicGroups.push(grp);
                }
                topicMap.get(topicKey).lessons.push(lesson);
              });

              return topicGroups.map((group, gIdx) => (
                <div
                  key={group.topicTitle + gIdx}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.01)',
                  }}
                >
                  {/* Topic Group Header */}
                  <div
                    style={{
                      padding: '0.85rem 1.25rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: 'var(--primary)',
                          }}
                        >
                          Topic #{gIdx + 1}
                        </span>
                        <h3 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-main)', fontWeight: 600 }}>
                          {group.topicTitle}
                        </h3>
                      </div>
                      {group.subtopicTitle ? (
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <strong>Subtopics:</strong> {group.subtopicTitle}
                        </p>
                      ) : null}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {group.lessons.length} {group.lessons.length === 1 ? 'Lesson' : 'Lessons'}
                    </span>
                  </div>

                  {/* Lessons in Topic */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem 1rem' }}>
                    {group.lessons.map((lesson) => {
                      const canAccess = isEnrolled || isAdmin || Boolean(lesson.is_preview);
                      const exercise = lesson.practicalExercise || lesson.practical_exercise;
                      const refUrls = lesson.referenceUrls || (typeof lesson.reference_urls === 'string' ? JSON.parse(lesson.reference_urls || '[]') : (lesson.reference_urls || []));

                      return (
                        <div
                          key={lesson.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.85rem 1rem',
                            background: lesson.is_completed ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                            border: lesson.is_completed
                              ? '1px solid rgba(16, 185, 129, 0.25)'
                              : '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            transition: 'border-color var(--transition-fast)',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1 1 300px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: lesson.is_completed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.12)',
                                color: lesson.is_completed ? '#10b981' : 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifySelf: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                flexShrink: 0,
                              }}
                            >
                              {lesson.is_completed ? <CheckCircle2 size={16} /> : lesson.position}
                            </div>

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                  {lesson.title}
                                </span>
                                {lesson.is_preview ? (
                                  <span
                                    style={{
                                      fontSize: '0.7rem',
                                      padding: '0.15rem 0.5rem',
                                      borderRadius: '9999px',
                                      background: 'rgba(99, 102, 241, 0.15)',
                                      color: 'var(--primary)',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Free Preview
                                  </span>
                                ) : null}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                                {lesson.channel_name && (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                                    <Youtube size={12} color="var(--primary)" /> {lesson.channel_name}
                                  </span>
                                )}
                                {lesson.duration && (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={11} /> {lesson.duration}
                                  </span>
                                )}
                                {exercise && (
                                  <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                    Hands-on Lab
                                  </span>
                                )}
                                {refUrls && refUrls.length > 0 && (
                                  <span style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                    {refUrls.length} Docs
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div>
                            {canAccess ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {lesson.video_id && (
                                  <button
                                    type="button"
                                    onClick={() => handlePreviewLesson(lesson)}
                                    className="btn btn-secondary btn-sm"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
                                    title="Play embedded video in-page"
                                  >
                                    <Play size={13} /> Preview
                                  </button>
                                )}

                                <Link
                                  to={isEnrolled ? `/courses/${course.id}/learn?lesson=${lesson.id}` : `/lessons/${lesson.id}`}
                                  className="btn btn-primary btn-sm"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
                                >
                                  {isEnrolled ? 'Open Lesson' : 'View Module'} <ArrowRight size={13} />
                                </Link>
                              </div>
                            ) : (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  color: 'var(--text-dim)',
                                  fontSize: '0.8rem',
                                }}
                              >
                                <Lock size={14} /> Enroll to Unlock
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
