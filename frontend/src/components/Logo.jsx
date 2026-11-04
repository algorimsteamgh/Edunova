import React from 'react';

/**
 * Edunova Technologies Vector Brand Logo
 * Supports 'full' (icon + Edunova + TECHNOLOGIES), 'compact' (icon + Edunova), and 'icon' (symbol only).
 */
export default function Logo({
  variant = 'full',
  size = 'md',
  className = '',
  style = {},
  iconOnly = false,
}) {
  // Dimension presets (enlarged for prominent, clear brand visibility across all devices)
  const sizeMap = {
    sm: { iconSize: 36, textScale: '1.25rem', subSize: '0.64rem', height: 38 },
    md: { iconSize: 48, textScale: '1.6rem', subSize: '0.74rem', height: 50 },
    lg: { iconSize: 62, textScale: '2.05rem', subSize: '0.9rem', height: 64 },
    xl: { iconSize: 76, textScale: '2.5rem', subSize: '1.05rem', height: 78 },
  };

  const config = typeof size === 'string' ? sizeMap[size] || sizeMap.md : {
    iconSize: size,
    textScale: `${(size * 0.033).toFixed(2)}rem`,
    subSize: `${(size * 0.016).toFixed(2)}rem`,
    height: size,
  };

  const isIconOnly = iconOnly || variant === 'icon';

  return (
    <div
      className={`edunova-logo edunova-logo-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isIconOnly ? 0 : '0.85rem',
        userSelect: 'none',
        textDecoration: 'none',
        flexShrink: 0,
        ...style,
      }}
      aria-label="Edunova Technologies"
    >
      {/* Dynamic Vector Emblem */}
      <div
        style={{
          width: config.iconSize,
          height: config.iconSize,
          minWidth: config.iconSize,
          minHeight: config.iconSize,
          borderRadius: Math.round(config.iconSize * 0.28),
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
          border: '1px solid var(--border-accent, rgba(99, 102, 241, 0.35))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 18px var(--primary-glow, rgba(99, 102, 241, 0.28))',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox="0 0 48 48"
          width={Math.round(config.iconSize * 0.82)}
          height={Math.round(config.iconSize * 0.82)}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="eduEmblemGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="eduEmblemGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Graduation Cap / Nova Beacon Top Crest */}
          <path d="M24 6 L41 15 L24 24 L7 15 Z" fill="url(#eduEmblemGrad1)" />
          <path d="M39 18.5 L42 20.5 L42 28 L40 29 L40 21 Z" fill="#06b6d4" opacity="0.95" />

          {/* Cap Underlayer */}
          <path d="M14 19.5 L14 26 C14 30.5 34 30.5 34 26 L34 19.5 L24 25 Z" fill="url(#eduEmblemGrad2)" opacity="0.85" />

          {/* Open Book Base Leaves */}
          <path d="M24 28 C19 28 13 26 7 29.5 L7 40 C13 36.5 19 38.5 24 41 Z" fill="url(#eduEmblemGrad2)" />
          <path d="M24 28 C29 28 35 26 41 29.5 L41 40 C35 36.5 29 38.5 24 41 Z" fill="url(#eduEmblemGrad1)" />

          {/* Spine & Nova Core Star */}
          <line x1="24" y1="28" x2="24" y2="41" stroke="#0b0f19" strokeWidth="1.8" strokeLinecap="round" />
          <polygon points="24,20 25.8,24.2 30,25.5 25.8,26.8 24,31 22.2,26.8 18,25.5 22.2,24.2" fill="#ffffff" />
        </svg>
      </div>

      {/* Typography Block */}
      {!isIconOnly && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, justifyContent: 'center' }}>
          <div
            style={{
              fontSize: config.textScale,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              display: 'flex',
              alignItems: 'baseline',
            }}
          >
            <span style={{ color: 'var(--text-main, #f9fafb)' }}>Edu</span>
            <span
              style={{
                background: 'linear-gradient(135deg, var(--primary, #6366f1), var(--accent-cyan, #06b6d4))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              nova
            </span>
          </div>

          {variant === 'full' && (
            <span
              style={{
                fontSize: config.subSize,
                fontWeight: 700,
                letterSpacing: '0.16em',
                color: 'var(--text-muted, #9ca3af)',
                textTransform: 'uppercase',
                marginTop: '2px',
              }}
            >
              Technologies
            </span>
          )}
        </div>
      )}
    </div>
  );
}
