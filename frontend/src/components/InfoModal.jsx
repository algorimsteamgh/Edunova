import React from 'react';
import { X, Shield, FileText, HelpCircle, CheckCircle } from 'lucide-react';

export default function InfoModal({ isOpen, onClose, type }) {
  if (!isOpen) return null;

  const contentMap = {
    privacy: {
      icon: Shield,
      color: '#10b981',
      title: 'Privacy Policy',
      subtitle: 'Edunova Technologies Data Protection & Privacy Commitment',
      body: (
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
          <p style={{ marginBottom: '1rem' }}>
            At <strong>Edunova Technologies</strong>, we respect your privacy and are committed to protecting your personal information. This Privacy Policy details how we handle account data, video playback telemetry, and syllabus completion records.
          </p>
          <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>1. Information We Collect</h4>
          <p style={{ marginBottom: '1rem' }}>
            We collect your full name, email address, password hash (salted using industry-standard bcrypt with minimum 10 rounds), and enrollment progress metrics. We do not sell, rent, or monetize your learning activity or personal data to third-party ad networks.
          </p>
          <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>2. Video Embeds & Playback Privacy</h4>
          <p style={{ marginBottom: '1rem' }}>
            Educational video previews and classroom lessons are served using strict privacy-enhanced streaming domains with sandbox attributes preventing unauthorized third-party tracking scripts from harvesting your session data.
          </p>
          <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>3. Data Integrity & Retention</h4>
          <p>
            Your course completions and progress records are maintained in relational SQLite database tables backed by foreign keys. You may request account deletion or data export at any time through your account management settings.
          </p>
        </div>
      ),
    },
    terms: {
      icon: FileText,
      color: '#6366f1',
      title: 'Terms of Service',
      subtitle: 'Standard Educational Platform Agreement & Learning Rules',
      body: (
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
          <p style={{ marginBottom: '1rem' }}>
            Welcome to <strong>Edunova Technologies</strong>. By accessing or enrolling in our technical courses, you agree to comply with and be bound by the following terms and conditions.
          </p>
          <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>1. Educational License</h4>
          <p style={{ marginBottom: '1rem' }}>
            All course syllabuses, video materials, and architectural documentation provided on Edunova Technologies are for individual, non-commercial educational use. Course enrollments grant students a personal, non-transferable lifetime license to review published lessons.
          </p>
          <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>2. Academic Honesty & Safety</h4>
          <p style={{ marginBottom: '1rem' }}>
            Students agree not to tamper with progress calculation APIs, forge completions, or exploit platform endpoints. Edunova Technologies enforces automated relational safeguards against cross-course progress modification.
          </p>
          <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>3. Service Availability</h4>
          <p>
            We strive for 99.9% uptime. Scheduled database checkpoints and maintenance windows are announced in advance. We reserve the right to remove outdated course drafts or update curriculums to reflect modern best practices.
          </p>
        </div>
      ),
    },
    help: {
      icon: HelpCircle,
      color: '#06b6d4',
      title: 'Help Center & FAQ',
      subtitle: 'Frequently Asked Questions & Technical Guidance',
      body: (
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
              Q: Are the video previews free to watch?
            </h4>
            <p>
              Yes! All courses on Edunova Technologies feature a free video preview that you can watch immediately inside the platform without registering or providing payment credentials.
            </p>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
              Q: How do I track my lesson progress?
            </h4>
            <p>
              Once enrolled, navigate to the dedicated classroom view. Check the "Mark as Completed" box on each lesson. Your progress percentage updates dynamically based on relational database counts.
            </p>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
              Q: How do I become an instructor?
            </h4>
            <p>
              Click "Become an Instructor" on the homepage or in the navigation bar to submit your curriculum proposal. Our advisory team will review and provision authoring credentials.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '0.3rem' }}>
              Q: How do I reset my credentials?
            </h4>
            <p>
              You can sign in with your email or username handle. For local development, pre-seeded accounts such as <code>alex.mercer</code> with password <code>StudentPass123!</code> are ready for instant login.
            </p>
          </div>
        </div>
      ),
    },
  };

  const item = contentMap[type] || contentMap.privacy;
  const IconComp = item.icon;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: `${item.color}22`,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconComp size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{item.title}</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.subtitle}</div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {item.body}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0, 0, 0, 0.2)' }}>
          <button type="button" onClick={onClose} className="btn btn-primary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
