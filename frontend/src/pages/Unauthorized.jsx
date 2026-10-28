import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="container page-container" style={{ textAlign: 'center', maxWidth: '520px', paddingTop: '4rem' }}>
      <div className="card" style={{ padding: '3rem 2rem' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <ShieldAlert size={36} />
        </div>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Access Restricted</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Your current account does not have sufficient permissions to view this administrative area.
        </p>
        <Link to="/courses" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Course Catalog
        </Link>
      </div>
    </div>
  );
}
