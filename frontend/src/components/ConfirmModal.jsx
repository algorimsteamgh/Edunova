import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, confirmText = 'Confirm', onConfirm, onCancel, isDanger = true }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} ref={modalRef} tabIndex={-1}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isDanger && (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--danger-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--danger)',
                }}
              >
                <AlertTriangle size={20} />
              </div>
            )}
            <h3 id="modal-title" style={{ fontSize: '1.25rem' }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: 1.6 }}>{message}</p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
