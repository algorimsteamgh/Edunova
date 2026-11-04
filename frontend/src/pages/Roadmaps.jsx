import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { roadmapApi } from '../services/api';
import {
  Compass,
  Search,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Award,
  Cpu,
  Cloud,
  Terminal,
  Code,
  Database,
  ShieldCheck,
  Server,
  Layout,
  Smartphone,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

const DOMAIN_FILTERS = [
  { label: 'All Domains', value: 'all', icon: Compass },
  { label: 'Programming & CS', value: 'Programming & Computer Science', icon: Code },
  { label: 'Frontend Dev', value: 'Frontend Development', icon: Layout },
  { label: 'Backend Dev', value: 'Backend Development', icon: Server },
  { label: 'Full Stack', value: 'Full Stack Development', icon: Layers },
  { label: 'Database Engineering', value: 'Database Engineering', icon: Database },
  { label: 'Cloud Computing', value: 'Cloud Computing', icon: Cloud },
  { label: 'DevOps & SRE', value: 'DevOps & Site Reliability Engineering', icon: Terminal },
  { label: 'AI & Machine Learning', value: 'Artificial Intelligence & Machine Learning', icon: Cpu },
  { label: 'Data Engineering', value: 'Data Engineering', icon: BarChart3 },
  { label: 'Software Testing & QA', value: 'Software Testing & Quality Engineering', icon: CheckCircle2 },
  { label: 'Cybersecurity', value: 'Cybersecurity & Application Security', icon: ShieldCheck },
  { label: 'Mobile App Dev', value: 'Mobile App Development', icon: Smartphone },
];

export default function Roadmaps() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => {
    setLoading(true);
    roadmapApi
      .list({ limit: 100 })
      .then((res) => {
        const raw = res.data?.data || res.data?.roadmaps || [];
        setRoadmaps(Array.isArray(raw) ? raw : (raw.roadmaps || []));
      })
      .catch((err) => {
        setError(err.message || 'Failed to load career roadmaps.');
        setRoadmaps([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSelectCategory = (catValue) => {
    setActiveCategory(catValue);
    if (catValue === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catValue);
    }
    setSearchParams(searchParams);
  };

  const safeList = Array.isArray(roadmaps) ? roadmaps : [];
  const filteredRoadmaps = safeList.filter((rm) => {
    const matchesCategory =
      activeCategory === 'all' ||
      rm.domain === activeCategory ||
      rm.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      rm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rm.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container page-container">
      {/* Header / Hero */}
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            background: 'rgba(99, 102, 241, 0.12)',
            borderRadius: '9999px',
            color: 'var(--primary)',
            fontSize: '0.825rem',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          <Compass size={15} />
          <span>Interactive Career Paths & Roadmaps</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', lineHeight: 1.15, marginBottom: '1rem' }}>
          Explore Structured <span className="text-gradient">Engineering Roadmaps</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
          Step-by-step career tracks inspired by roadmap.sh. Master prerequisite-driven skills,
          track milestone completions, and progress from beginner to senior production level.
        </p>
      </div>

      {/* Search & Domain Filter Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roadmaps by role, domain, or technology..."
            style={{ paddingLeft: '46px', width: '100%', height: '48px', fontSize: '0.95rem' }}
          />
        </div>

        {/* Domain Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: '0.6rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {DOMAIN_FILTERS.map((df) => {
            const Icon = df.icon;
            const isSelected = activeCategory === df.value;
            return (
              <button
                key={df.value}
                type="button"
                onClick={() => handleSelectCategory(df.value)}
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  borderRadius: '9999px',
                  padding: '0.45rem 1rem',
                }}
              >
                <Icon size={14} />
                <span>{df.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Roadmaps Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card" style={{ height: '240px' }}>
              <div className="skeleton" style={{ height: '24px', width: '50%', marginBottom: '1rem' }} />
              <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: '0.5rem' }} />
              <div className="skeleton" style={{ height: '60px' }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : filteredRoadmaps.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem 1rem' }}>
          <Compass size={48} className="empty-icon" />
          <h3 className="empty-title">No roadmaps found</h3>
          <p className="empty-desc">Try selecting another domain or clearing your search query.</p>
          <button type="button" onClick={() => { setActiveCategory('all'); setSearchQuery(''); }} className="btn btn-secondary">
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredRoadmaps.map((rm) => (
            <div
              key={rm.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.75rem',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-published" style={{ fontSize: '0.75rem' }}>
                    {rm.domain || rm.category || 'Engineering'}
                  </span>
                  <span className="badge badge-student" style={{ fontSize: '0.75rem' }}>
                    {rm.level || 'Beginner'} • {rm.estimated_weeks || 12} Wks
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', lineHeight: 1.35 }}>
                  <Link to={`/roadmaps/${rm.slug || rm.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                    {rm.title}
                  </Link>
                </h3>

                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                    margin: '0 0 0.75rem 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {rm.description}
                </p>

                {/* Skills tags preview */}
                {(() => {
                  const skills = typeof rm.skills_covered === 'string'
                    ? JSON.parse(rm.skills_covered || '[]')
                    : (rm.skills_covered || []);
                  if (!skills || skills.length === 0) return null;
                  return (
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      {skills.slice(0, 3).map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-dim)',
                          }}
                        >
                          {sk}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
                          +{skills.length - 3}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Layers size={13} color="var(--primary)" /> {rm.modules_count || 4} Modules • {rm.topic_count || rm.topics_count || 6} Milestones
                  </span>
                </div>

                <Link
                  to={`/roadmaps/${rm.slug || rm.id}`}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                >
                  <span>View Path</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

