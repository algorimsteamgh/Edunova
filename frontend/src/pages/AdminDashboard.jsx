import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/api';
import { Users, BookOpen, Layers, CheckCircle2, TrendingUp, AlertCircle, Shield, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .getStats()
      .then((res) => {
        setStats(res.data.data.stats);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container page-container">
        <div className="card skeleton" style={{ height: '400px' }} />
      </div>
    );
  }

  return (
    <div className="container page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Administration</h1>
          <p className="page-subtitle">Real-time system telemetry, enrollment statistics, and course curriculum metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/courses" className="btn btn-secondary">
            Manage Courses
          </Link>
          <Link to="/admin/reports" className="btn btn-primary">
            Export Reports
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Registered Users</span>
            <Users size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalUsers}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            {stats.totalStudents} students • {stats.totalAdmins} admins
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Published Courses</span>
            <BookOpen size={20} color="var(--secondary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.publishedCourses}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            of {stats.totalCourses} total created courses
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Enrollments</span>
            <Layers size={20} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalEnrollments}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            total student course registrations
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Completion Rate</span>
            <TrendingUp size={20} color="var(--success)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.completionRate}%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            {stats.completedEnrollments} completed curriculums
          </div>
        </div>
      </div>

      {/* Grid: Course Completion Breakdown & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem' }}>
        {/* Course Performance Breakdown */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Course Completion Summaries</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Enrolled</th>
                  <th>Completed</th>
                  <th>Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.courseCompletionBreakdown.map((c) => {
                  const rate = c.total_enrolled > 0 ? Math.round((c.total_completed / c.total_enrolled) * 100) : 0;
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.title}</td>
                      <td>{c.total_enrolled}</td>
                      <td>{c.total_completed}</td>
                      <td>
                        <span style={{ color: rate > 0 ? 'var(--success)' : 'var(--text-dim)', fontWeight: 600 }}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Enrollments Activity */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Recent Enrollment Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentEnrollments.map((e) => (
              <div
                key={e.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>{e.student_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Enrolled in: {e.course_title}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${e.status === 'completed' ? 'badge-completed' : 'badge-active'}`}>
                    {e.status}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                    {new Date(e.enrolled_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
