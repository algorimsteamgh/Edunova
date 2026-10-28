import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Users, Search, AlertCircle, ChevronLeft, ChevronRight, Shield } from 'lucide-react';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (roleFilter !== 'all') params.role = roleFilter;
    if (search.trim()) params.search = search.trim();

    adminApi
      .listUsers(params)
      .then((res) => {
        setUsers(res.data.data || []);
        setPagination(res.data.pagination || { total: 0, totalPages: 1 });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search, roleFilter, page]);

  return (
    <div className="container page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Directory</h1>
          <p className="page-subtitle">Inspect registered students, instructors, and platform administrators.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Row */}
      <div
        className="card"
        style={{
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem', padding: '0.55rem 0.75rem 0.55rem 2.5rem', fontSize: '0.9rem' }}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'admin', 'student'].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRoleFilter(r);
                setPage(1);
              }}
              className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Enrollments</th>
              <th>Registration Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                  Loading user records...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                  No users match the search criteria.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ID: {u.id}</div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-student'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-active' : 'badge-dropped'}`}>
                      {u.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{u.enrollments_count || 0}</span> courses
                  </td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
    </div>
  );
}
