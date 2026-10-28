import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentApi } from '../services/api';
import { BookOpen, CheckCircle2, Clock, ArrowRight, AlertCircle, Layers } from 'lucide-react';

export default function MyLearning() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    enrollmentApi
      .getMyEnrollments()
      .then((res) => setEnrollments(res.data.data.enrollments || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter((e) => e.status === 'completed' || e.progressPercentage === 100).length;
  const activeCourses = totalCourses - completedCourses;

  const filteredCourses = enrollments.filter((e) => {
    if (filter === 'completed') return e.status === 'completed' || e.progressPercentage === 100;
    if (filter === 'active') return e.status === 'active' && e.progressPercentage < 100;
    return true;
  });

  return (
    <div className="container page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Learning Dashboard</h1>
          <p className="page-subtitle">Track your enrolled courses, lesson progress, and video milestones.</p>
        </div>
        <Link to="/courses" className="btn btn-primary">
          <BookOpen size={16} /> Explore Course Catalog
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalCourses}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enrolled Courses</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--warning-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--warning)',
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{activeCourses}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>In Progress</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{completedCourses}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Completed Courses</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setFilter('all')}
          className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All ({totalCourses})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`btn btn-sm ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
        >
          In Progress ({activeCourses})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`btn btn-sm ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Completed ({completedCourses})
        </button>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="card skeleton" style={{ height: '240px' }} />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="empty-state">
          <BookOpen className="empty-icon" size={48} />
          <h3 className="empty-title">No Enrolled Courses Found</h3>
          <p className="empty-desc">You haven't enrolled in any courses in this category yet.</p>
          <Link to="/courses" className="btn btn-primary">
            Explore Course Catalog
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.75rem' }}>
          {filteredCourses.map((item) => {
            const isFinished = item.status === 'completed' || item.progressPercentage === 100;

            return (
              <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span className="badge badge-published">{item.course_category}</span>
                  <span className={`badge ${isFinished ? 'badge-completed' : 'badge-active'}`}>
                    {isFinished ? 'Completed' : 'Active'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                  {item.course_title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
                  Instructor: {item.instructor_name || 'Staff Instructor'}
                </div>

                {/* Progress Indicators */}
                <div style={{ marginTop: 'auto', marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      marginBottom: '0.5rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>Course Progress</span>
                    <strong style={{ color: isFinished ? 'var(--success)' : 'var(--text-main)' }}>
                      {item.progressPercentage}%
                    </strong>
                  </div>

                  <div className="progress-container">
                    <div
                      className={`progress-bar ${isFinished ? 'progress-bar-completed' : ''}`}
                      style={{ width: `${item.progressPercentage}%` }}
                    />
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                    {item.completedLessons} of {item.totalLessons} lessons completed
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link to={`/courses/${item.course_id}/learn`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    Continue Learning <ArrowRight size={14} />
                  </Link>
                  <Link to={`/enrollments/${item.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                    Progress Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
