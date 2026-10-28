import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Download, FileText, CheckCircle2, Activity, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('enrollments'); // enrollments, completions, health
  const [enrollmentsData, setEnrollmentsData] = useState([]);
  const [completionsData, setCompletionsData] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchTabContent = () => {
    setLoading(true);
    setError('');

    if (activeTab === 'enrollments') {
      adminApi
        .getEnrollmentsReport({ page, limit: 20 })
        .then((res) => {
          setEnrollmentsData(res.data.data || []);
          setPagination(res.data.pagination || { total: 0, totalPages: 1 });
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else if (activeTab === 'completions') {
      adminApi
        .getCompletionsReport({ page, limit: 20 })
        .then((res) => {
          setCompletionsData(res.data.data || []);
          setPagination(res.data.pagination || { total: 0, totalPages: 1 });
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else if (activeTab === 'health') {
      adminApi
        .getHealthSummary()
        .then((res) => {
          setHealthData(res.data.data);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchTabContent();
  }, [activeTab, page]);

  const handleDownloadCsv = (endpoint) => {
    const token = localStorage.getItem('learnsphere_token');
    // Fetch CSV with bearer token and trigger browser download
    fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = endpoint.includes('completions') ? 'completions-report.csv' : 'enrollments-report.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert(`Failed to download CSV: ${err.message}`));
  };

  return (
    <div className="container page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Administrative Reports & Telemetry</h1>
          <p className="page-subtitle">Export auditable completion reports and inspect real-time database integrity.</p>
        </div>

        {activeTab !== 'health' && (
          <button
            onClick={() =>
              handleDownloadCsv(
                activeTab === 'enrollments'
                  ? adminApi.downloadEnrollmentsCsv()
                  : adminApi.downloadCompletionsCsv()
              )
            }
            className="btn btn-primary"
          >
            <Download size={16} /> Export {activeTab === 'enrollments' ? 'Enrollments' : 'Completions'} CSV
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <button
          onClick={() => {
            setActiveTab('enrollments');
            setPage(1);
          }}
          className={`btn btn-sm ${activeTab === 'enrollments' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <FileText size={16} /> Enrollment Report
        </button>
        <button
          onClick={() => {
            setActiveTab('completions');
            setPage(1);
          }}
          className={`btn btn-sm ${activeTab === 'completions' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <CheckCircle2 size={16} /> Course Completion Report
        </button>
        <button
          onClick={() => {
            setActiveTab('health');
            setPage(1);
          }}
          className={`btn btn-sm ${activeTab === 'health' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Activity size={16} /> System Health & Telemetry
        </button>
      </div>

      {/* Tab 1: Enrollments Report */}
      {activeTab === 'enrollments' && (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student Email</th>
                  <th>Course Title</th>
                  <th>Category</th>
                  <th>Enrolled Date</th>
                  <th>Status</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                      Generating report...
                    </td>
                  </tr>
                ) : enrollmentsData.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                      No enrollment records found.
                    </td>
                  </tr>
                ) : (
                  enrollmentsData.map((row) => (
                    <tr key={row.enrollment_id}>
                      <td style={{ fontWeight: 600 }}>{row.student_name}</td>
                      <td>{row.student_email}</td>
                      <td>{row.course_title}</td>
                      <td>
                        <span className="badge badge-published">{row.course_category}</span>
                      </td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>
                        {new Date(row.enrolled_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            row.enrollment_status === 'completed' ? 'badge-completed' : 'badge-active'
                          }`}
                        >
                          {row.enrollment_status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, minWidth: '40px' }}>{row.progressPercentage}%</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            ({row.completed_lessons}/{row.total_lessons})
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Tab 2: Completions Report */}
      {activeTab === 'completions' && (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student Email</th>
                  <th>Course Title</th>
                  <th>Category</th>
                  <th>Enrolled Date</th>
                  <th>Completed Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                      Generating completions report...
                    </td>
                  </tr>
                ) : completionsData.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                      No 100% completed courses recorded yet.
                    </td>
                  </tr>
                ) : (
                  completionsData.map((row) => (
                    <tr key={row.enrollment_id}>
                      <td style={{ fontWeight: 600 }}>{row.student_name}</td>
                      <td>{row.student_email}</td>
                      <td>{row.course_title}</td>
                      <td>
                        <span className="badge badge-published">{row.course_category}</span>
                      </td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>
                        {new Date(row.enrolled_at).toLocaleDateString()}
                      </td>
                      <td style={{ fontSize: '0.825rem', color: 'var(--success)' }}>
                        {row.completed_at ? new Date(row.completed_at).toLocaleDateString() : 'Recorded'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Tab 3: Health & Telemetry */}
      {activeTab === 'health' && healthData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          {/* Integrity Diagnostics */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Relational & Disk Integrity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Database Engine:</span>
                <strong>{healthData.database}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)' }}>PRAGMA integrity_check:</span>
                <span className={`badge ${healthData.integrity.integrityOk ? 'badge-completed' : 'badge-draft'}`}>
                  {healthData.integrity.integrityOk ? 'PASSED (ok)' : 'FAILED'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)' }}>PRAGMA foreign_key_check:</span>
                <span className={`badge ${healthData.integrity.fkOk ? 'badge-completed' : 'badge-draft'}`}>
                  {healthData.integrity.fkViolations.length} Violations
                </span>
              </div>
            </div>

            <h4 style={{ fontSize: '1.05rem', margin: '1.5rem 0 0.75rem' }}>Table Record Distribution</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {Object.entries(healthData.tableCounts).map(([tbl, cnt]) => (
                <div key={tbl} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>{tbl}</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{cnt}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Migration Audit Trail */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Versioned Schema Migrations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {healthData.migrations.map((m) => (
                <div
                  key={m.version}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.version}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      Applied: {new Date(m.applied_at).toLocaleString()}
                    </div>
                  </div>
                  <span className="badge badge-published">Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
