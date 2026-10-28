import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { enrollmentApi, progressApi } from '../services/api';
import { CheckCircle2, Circle, ArrowLeft, BookOpen, AlertCircle, Calendar } from 'lucide-react';

export default function ProgressDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDetails = () => {
    setLoading(true);
    enrollmentApi
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
    fetchDetails();
  }, [id]);

  const handleToggle = async (lessonId, currentCompleted) => {
    setUpdatingId(lessonId);
    try {
      await progressApi.updateProgress(id, lessonId, !currentCompleted);
      fetchDetails();
    } catch (err) {
      alert(`Failed to update lesson: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container page-container">
        <div className="card skeleton" style={{ height: '400px' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container page-container">
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error || 'Enrollment details not found'}</span>
        </div>
        <Link to="/my-learning" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to My Learning
        </Link>
      </div>
    );
  }

  const { enrollment, totalLessons, completedLessons, progressPercentage, lessons } = data;
  const isFinished = progressPercentage === 100;

  return (
    <div className="container page-container" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/my-learning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} /> Back to My Learning
        </Link>
      </div>

      {/* Progress Header Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span className="badge badge-published" style={{ marginBottom: '0.5rem' }}>
              {enrollment.course_category}
            </span>
            <h1 style={{ fontSize: '1.85rem' }}>{enrollment.course_title}</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Enrolled on {new Date(enrollment.enrolled_at).toLocaleDateString()}
            </p>
          </div>

          <span className={`badge ${isFinished ? 'badge-completed' : 'badge-active'}`} style={{ padding: '0.5rem 1rem' }}>
            {isFinished ? 'Course Completed' : 'In Progress'}
          </span>
        </div>

        {/* Progress Bar & Counter */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span>Curriculum Completion</span>
            <strong style={{ color: isFinished ? 'var(--success)' : 'var(--primary)' }}>
              {progressPercentage}% ({completedLessons}/{totalLessons} lessons)
            </strong>
          </div>
          <div className="progress-container" style={{ height: '10px' }}>
            <div
              className={`progress-bar ${isFinished ? 'progress-bar-completed' : ''}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lesson Progress Breakdown */}
      <div className="card">
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>Lesson Completion Checklist</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {lessons.map((lesson) => {
            const isComp = Boolean(lesson.is_completed);

            return (
              <div
                key={lesson.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button
                    onClick={() => handleToggle(lesson.id, isComp)}
                    disabled={updatingId === lesson.id}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isComp ? 'var(--success)' : 'var(--text-dim)',
                    }}
                    title={isComp ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {isComp ? <CheckCircle2 size={22} color="#10b981" /> : <Circle size={22} />}
                  </button>

                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{lesson.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      Module #{lesson.position}
                      {lesson.completed_at && (
                        <span> • Completed {new Date(lesson.completed_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <Link to={`/lessons/${lesson.id}`} className="btn btn-secondary btn-sm">
                  View Content
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
