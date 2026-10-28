import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container page-container" style={{ textAlign: 'center', maxWidth: '520px', paddingTop: '4rem' }}>
      <div className="card" style={{ padding: '3rem 2rem' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.1)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <HelpCircle size={36} />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>404 Not Found</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          The requested page or course resource could not be found.
        </p>
        <Link to="/courses" className="btn btn-primary">
          <ArrowLeft size={16} /> Explore Catalog
        </Link>
      </div>
    </div>
  );
}
