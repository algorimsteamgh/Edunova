import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentApi, roadmapApi, bookmarkApi } from '../services/api';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Layers,
  Compass,
  Bookmark,
  ExternalLink,
  Award,
} from 'lucide-react';

export default function MyLearning() {
  const [enrollments, setEnrollments] = useState([]);
  const [enrolledRoadmaps, setEnrolledRoadmaps] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [studentDashboard, setStudentDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'roadmaps' | 'bookmarks'
  const [courseFilter, setCourseFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      enrollmentApi.getMyEnrollments(),
      roadmapApi.getMyRoadmaps(),
      bookmarkApi.getMyBookmarks(),
      roadmapApi.getStudentDashboard(),
    ])
      .then(([enrollRes, roadmapRes, bookmarkRes, dashRes]) => {
        if (enrollRes.status === 'fulfilled') {
          const enrollData = enrollRes.value.data?.data?.enrollments || enrollRes.value.data?.data || [];
          setEnrollments(Array.isArray(enrollData) ? enrollData : []);
        }
        if (roadmapRes.status === 'fulfilled') {
          const raw = roadmapRes.value.data?.data || roadmapRes.value.data?.roadmaps || [];
          setEnrolledRoadmaps(Array.isArray(raw) ? raw : (raw.roadmaps || []));
        }
        if (bookmarkRes.status === 'fulfilled') {
          const raw = bookmarkRes.value.data?.data || bookmarkRes.value.data?.bookmarks || [];
          setBookmarks(Array.isArray(raw) ? raw : (raw.bookmarks || []));
        }
        if (dashRes.status === 'fulfilled') {
          const raw = dashRes.value.data?.data || null;
          setStudentDashboard(raw);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load learner dashboard.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(
    (e) => e.status === 'completed' || e.progressPercentage === 100
  ).length;
  const activeCourses = totalCourses - completedCourses;

  const filteredCourses = enrollments.filter((e) => {
    if (courseFilter === 'completed') return e.status === 'completed' || e.progressPercentage === 100;
    if (courseFilter === 'active') return e.status === 'active' && e.progressPercentage < 100;
    return true;
  });

  return (
    <div className="container page-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">My Learning Dashboard</h1>
          <p className="page-subtitle">
            Track your multi-domain courses, interactive career roadmaps, and bookmarked lessons.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/courses" className="btn btn-secondary">
            <BookOpen size={16} /> Course Catalog
          </Link>
          <Link to="/roadmaps" className="btn btn-primary">
            <Compass size={16} /> Explore Roadmaps
          </Link>
        </div>
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
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
            }}
          >
            <Compass size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{enrolledRoadmaps.length}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Career Roadmaps</div>
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
            <Bookmark size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{bookmarks.length}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Bookmarked Lessons</div>
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

      {/* Main Tab Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`btn ${activeTab === 'courses' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <BookOpen size={15} />
          <span>Courses ({totalCourses})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('roadmaps')}
          className={`btn ${activeTab === 'roadmaps' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Compass size={15} />
          <span>Career Roadmaps ({enrolledRoadmaps.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bookmarks')}
          className={`btn ${activeTab === 'bookmarks' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Bookmark size={15} />
          <span>Saved Bookmarks ({bookmarks.length})</span>
        </button>
      </div>

      {/* TAB 1: Enrolled Courses */}
      {activeTab === 'courses' && (
        <div>
          {/* Filter Sub-Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
            <button
              onClick={() => setCourseFilter('all')}
              className={`btn btn-sm ${courseFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All ({totalCourses})
            </button>
            <button
              onClick={() => setCourseFilter('active')}
              className={`btn btn-sm ${courseFilter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
            >
              In Progress ({activeCourses})
            </button>
            <button
              onClick={() => setCourseFilter('completed')}
              className={`btn btn-sm ${courseFilter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Completed ({completedCourses})
            </button>
          </div>

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
              <p className="empty-desc">You haven't enrolled in any courses in this filter category yet.</p>
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
      )}

      {/* TAB 2: Enrolled Career Roadmaps */}
      {activeTab === 'roadmaps' && (
        <div>
          {/* Continue Learning Milestone Banner if any topic in progress */}
          {studentDashboard?.inProgressTopics?.length > 0 && (
            <div
              style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(15,23,42,0.6))',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 'var(--radius-xl)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                    Continue Learning Milestone
                  </span>
                  <h3 style={{ margin: '0.35rem 0', fontSize: '1.25rem', color: 'var(--text-main)' }}>
                    {studentDashboard.inProgressTopics[0].title}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Roadmap: {studentDashboard.inProgressTopics[0].roadmap_title} • {studentDashboard.inProgressTopics[0].estimated_duration || '45 mins'}
                  </span>
                </div>

                <Link
                  to={`/roadmaps/${studentDashboard.inProgressTopics[0].roadmap_slug || studentDashboard.inProgressTopics[0].roadmap_id}/topics/${studentDashboard.inProgressTopics[0].id}`}
                  className="btn btn-primary btn-glow"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <span>Resume Topic</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}

          {enrolledRoadmaps.length === 0 ? (
            <div className="empty-state">
              <Compass className="empty-icon" size={48} />
              <h3 className="empty-title">No Enrolled Roadmaps Yet</h3>
              <p className="empty-desc">
                Follow structured, step-by-step career tracks inspired by roadmap.sh to master engineering domains.
              </p>
              <Link to="/roadmaps" className="btn btn-primary">
                Browse 34 Career Roadmaps
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.75rem' }}>
              {enrolledRoadmaps.map((rm) => (
                <div key={rm.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span className="badge badge-published">{rm.domain || rm.category}</span>
                    <span className="badge badge-student">{rm.estimated_weeks || 12} Weeks</span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                    {rm.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      marginBottom: '1.25rem',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {rm.description}
                  </p>

                  {/* Roadmap Progress */}
                  <div style={{ marginTop: 'auto', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Milestone Progress</span>
                      <strong style={{ color: 'var(--primary)' }}>
                        {rm.completed_topics || 0} / {rm.total_topics || 0} ({rm.progress_percentage || 0}%)
                      </strong>
                    </div>
                    <div className="progress-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${rm.progress_percentage || 0}%` }}
                      />
                    </div>
                  </div>

                  <Link to={`/roadmaps/${rm.slug || rm.id}`} className="btn btn-primary btn-sm" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}>
                    <span>Open Interactive Roadmap</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Recent Learning Activity Timeline */}
          {studentDashboard?.recentActivity?.length > 0 && (
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="var(--primary)" />
                <span>Recent Learning Activity</span>
              </h3>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  {studentDashboard.recentActivity.slice(0, 5).map((act) => (
                    <div
                      key={act.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.875rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CheckCircle2 size={16} color="var(--primary)" />
                        <span style={{ fontWeight: 600 }}>{act.title}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {new Date(act.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Saved Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div>
          {bookmarks.length === 0 ? (
            <div className="empty-state">
              <Bookmark className="empty-icon" size={48} />
              <h3 className="empty-title">No Bookmarks Saved</h3>
              <p className="empty-desc">
                When studying a lesson, click the "Bookmark" button to save key lessons for quick revision here.
              </p>
              <Link to="/courses" className="btn btn-primary">
                Explore Courses
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {bookmarks.map((b) => (
                <div key={b.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="badge badge-published" style={{ fontSize: '0.75rem' }}>
                      {b.course_category || 'Lesson'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Module #{b.position || 1}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', margin: '0.2rem 0 0.5rem', lineHeight: 1.35 }}>
                    {b.lesson_title}
                  </h4>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Course: <strong>{b.course_title}</strong>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <Link
                      to={`/courses/${b.course_id}/learn?lesson=${b.lesson_id}`}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <span>Resume Lesson</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
