import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Lock,
  PlayCircle,
  Clock,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  FileText,
  Sparkles,
  Filter,
  Check,
} from 'lucide-react';

export default function InteractiveRoadmap({
  roadmap,
  modules = [],
  topics = [],
  userProgress = {},
  isEnrolled = false,
  onUpdateStatus,
}) {
  const navigate = useNavigate();

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [collapsedModules, setCollapsedModules] = useState({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed' | 'in_progress'
  const [viewMode, setViewMode] = useState('modules'); // 'modules' | 'graph'

  // Helper to determine topic status: 'completed' | 'in_progress' | 'locked' | 'available'
  const getTopicStatus = (topic) => {
    const directStatus = userProgress[topic.id];
    if (directStatus === 'completed') return 'completed';
    if (directStatus === 'in_progress') return 'in_progress';

    const prereqs = Array.isArray(topic.prerequisites) ? topic.prerequisites : [];
    if (prereqs.length > 0 && isEnrolled) {
      const allPrereqsMet = prereqs.every((preId) => userProgress[preId] === 'completed');
      if (!allPrereqsMet) return 'locked';
    }

    return 'available';
  };

  const completedCount = topics.filter((t) => userProgress[t.id] === 'completed').length;
  const inProgressCount = topics.filter((t) => userProgress[t.id] === 'in_progress').length;
  const progressPercent = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  const handleStatusChange = async (topicId, nextStatus) => {
    if (!onUpdateStatus) return;
    setUpdatingId(topicId);
    try {
      await onUpdateStatus(topicId, nextStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleModuleCollapse = (moduleId) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const expandAll = () => setCollapsedModules({});
  const collapseAll = () => {
    const all = {};
    modules.forEach((m) => { all[m.id] = true; });
    setCollapsedModules(all);
  };

  // Group topics by module
  const safeModules = modules.length > 0 ? modules : [
    { id: 'default-mod-1', title: 'Foundations & Core Principles', description: 'Essential prerequisites and foundational knowledge' },
    { id: 'default-mod-2', title: 'Advanced Architecture & Production', description: 'Enterprise engineering and real-world implementation' },
  ];

  const filteredTopics = (topicList) => {
    return topicList.filter((t) => {
      const status = getTopicStatus(t);
      if (statusFilter === 'all') return true;
      if (statusFilter === 'completed') return status === 'completed';
      if (statusFilter === 'in_progress') return status === 'in_progress';
      if (statusFilter === 'pending') return status === 'available' || status === 'locked';
      return true;
    });
  };

  return (
    <div className="interactive-roadmap-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Roadmap Controls Bar (Zoom, Filter, View Mode) */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Left: Overall Completion Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: '280px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Roadmap Milestone Progress</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                {completedCount} / {topics.length} Milestones ({progressPercent}%)
              </span>
            </div>
            <div
              style={{
                height: '7px',
                width: '100%',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: progressPercent === 100 ? '#10b981' : 'linear-gradient(90deg, #6366f1, #06b6d4)',
                  borderRadius: '9999px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Right: Interactive Canvas Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Status Filters */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '0.2rem' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', height: 'auto' }}
            >
              All ({topics.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`btn btn-sm ${statusFilter === 'completed' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', height: 'auto', color: statusFilter === 'completed' ? '#fff' : '#10b981' }}
            >
              Done ({completedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('in_progress')}
              className={`btn btn-sm ${statusFilter === 'in_progress' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', height: 'auto', color: statusFilter === 'in_progress' ? '#fff' : '#06b6d4' }}
            >
              Active ({inProgressCount})
            </button>
          </div>

          {/* Zoom Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.6rem' }}>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.1))}
              className="btn btn-secondary btn-sm"
              title="Zoom Out"
              style={{ padding: '0.35rem 0.5rem' }}
            >
              <ZoomOut size={14} />
            </button>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', minWidth: '42px', textAlign: 'center' }}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(1.25, z + 0.1))}
              className="btn btn-secondary btn-sm"
              title="Zoom In"
              style={{ padding: '0.35rem 0.5rem' }}
            >
              <ZoomIn size={14} />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="btn btn-secondary btn-sm"
              title="Reset Zoom"
              style={{ padding: '0.35rem 0.5rem' }}
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Expand/Collapse All */}
          <button
            type="button"
            onClick={Object.keys(collapsedModules).length > 0 ? expandAll : collapseAll}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            {Object.keys(collapsedModules).length > 0 ? 'Expand All' : 'Collapse All'}
          </button>
        </div>
      </div>

      {/* 2. Main Interactive Roadmap Canvas (supports zoom transformation) */}
      <div
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
        }}
      >
        {safeModules.map((mod, mIdx) => {
          const modTopics = topics.filter((t) => t.module_id === mod.id || (!t.module_id && mIdx === 0));
          const visibleTopics = filteredTopics(modTopics);
          const isCollapsed = Boolean(collapsedModules[mod.id]);

          if (visibleTopics.length === 0 && modTopics.length > 0 && statusFilter !== 'all') {
            return null;
          }

          const modDone = modTopics.filter((t) => userProgress[t.id] === 'completed').length;
          const modPercent = modTopics.length > 0 ? Math.round((modDone / modTopics.length) * 100) : 0;

          return (
            <div
              key={mod.id}
              className="roadmap-module-card"
              style={{
                background: 'rgba(15, 23, 42, 0.45)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Module Header Bar */}
              <div
                onClick={() => toggleModuleCollapse(mod.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.75rem',
                  background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.6) 100%)',
                  borderBottom: isCollapsed ? 'none' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}
                  >
                    M{mIdx + 1}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      {mod.title}
                    </h3>
                    {mod.description && (
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                        {mod.description}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {modDone}/{modTopics.length} Done ({modPercent}%)
                    </span>
                    <div style={{ width: '60px', height: '6px', borderRadius: '9999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{ width: `${modPercent}%`, height: '100%', background: modPercent === 100 ? '#10b981' : 'var(--primary)', borderRadius: '9999px' }} />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '0.25rem' }}
                    aria-label={isCollapsed ? 'Expand module' : 'Collapse module'}
                  >
                    {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                  </button>
                </div>
              </div>

              {/* Module Topics Grid with Directional Connectors */}
              {!isCollapsed && (
                <div style={{ padding: '1.75rem', position: 'relative' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                      gap: '1.25rem',
                    }}
                  >
                    {visibleTopics.map((topic, tIdx) => {
                      const status = getTopicStatus(topic);
                      const isSelected = selectedTopic?.id === topic.id;
                      const isArticleOnly = topic.resource_type === 'article' || (!topic.video_id && topic.article_url);

                      let nodeBorder = 'var(--border-subtle)';
                      let nodeBg = 'rgba(255, 255, 255, 0.02)';
                      let accentColor = 'var(--text-muted)';

                      if (status === 'completed') {
                        nodeBorder = 'rgba(16, 185, 129, 0.45)';
                        nodeBg = 'rgba(16, 185, 129, 0.06)';
                        accentColor = '#10b981';
                      } else if (status === 'in_progress') {
                        nodeBorder = 'rgba(6, 182, 212, 0.55)';
                        nodeBg = 'rgba(6, 182, 212, 0.08)';
                        accentColor = '#06b6d4';
                      } else if (status === 'locked') {
                        nodeBorder = 'rgba(255, 255, 255, 0.03)';
                        nodeBg = 'rgba(0, 0, 0, 0.25)';
                        accentColor = '#64748b';
                      }

                      return (
                        <div
                          key={topic.id}
                          className="roadmap-topic-node"
                          onClick={() => setSelectedTopic(isSelected ? null : topic)}
                          style={{
                            padding: '1.25rem',
                            borderRadius: 'var(--radius-lg)',
                            background: nodeBg,
                            border: `1px solid ${isSelected ? 'var(--primary)' : nodeBorder}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.85rem',
                            opacity: status === 'locked' ? 0.65 : 1,
                            position: 'relative',
                            boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.35)' : 'none',
                          }}
                        >
                          {/* Node Header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                                Step {topic.display_order || tIdx + 1}
                              </span>
                              {isArticleOnly && (
                                <span
                                  style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    padding: '0.1rem 0.45rem',
                                    borderRadius: '9999px',
                                    background: 'rgba(6, 182, 212, 0.15)',
                                    color: 'var(--accent-cyan)',
                                  }}
                                >
                                  Article
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              {status === 'completed' && <CheckCircle2 size={17} color="#10b981" />}
                              {status === 'in_progress' && <PlayCircle size={17} color="#06b6d4" />}
                              {status === 'locked' && <Lock size={15} color="#64748b" />}
                              {status === 'available' && (
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.25)' }} />
                              )}
                            </div>
                          </div>

                          {/* Node Title & Description */}
                          <div>
                            <h4 style={{ fontSize: '0.985rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.35rem 0', lineHeight: 1.35 }}>
                              {topic.title}
                            </h4>
                            <p
                              style={{
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                                margin: 0,
                                lineHeight: 1.45,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {topic.description}
                            </p>
                          </div>

                          {/* Node Footer */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingTop: '0.5rem',
                              borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                              fontSize: '0.75rem',
                              color: 'var(--text-dim)',
                            }}
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Clock size={12} /> {topic.estimated_duration || '45 mins'}
                            </span>
                            <span style={{ color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              {isSelected ? 'Selected' : 'Inspect'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Selected Topic Inspector Drawer (With Link to Dedicated Learning Page) */}
      {selectedTopic && (
        <div
          className="topic-inspector-drawer"
          style={{
            position: 'sticky',
            bottom: '1.5rem',
            padding: '1.75rem',
            background: 'rgba(11, 15, 25, 0.98)',
            border: '1px solid var(--primary)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                <span className="badge badge-published" style={{ fontSize: '0.75rem' }}>
                  {selectedTopic.difficulty_level || 'Core Concept'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Duration: {selectedTopic.estimated_duration || '45 mins'}
                </span>
                {selectedTopic.resource_type === 'article' && (
                  <span className="badge badge-active" style={{ fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
                    Article Fallback
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem 0', fontWeight: 700, color: 'var(--text-main)' }}>
                {selectedTopic.title}
              </h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0, maxWidth: '780px' }}>
                {selectedTopic.description}
              </p>
            </div>

            {/* Quick Status Action Buttons */}
            {isEnrolled && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                {userProgress[selectedTopic.id] !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedTopic.id, 'completed')}
                    disabled={updatingId === selectedTopic.id}
                    className="btn btn-primary btn-sm btn-glow"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Mark Done</span>
                  </button>
                )}
                {userProgress[selectedTopic.id] !== 'in_progress' && userProgress[selectedTopic.id] !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedTopic.id, 'in_progress')}
                    disabled={updatingId === selectedTopic.id}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <PlayCircle size={15} />
                    <span>Set Active</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action Links: Open Topic Learning Page */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to={`/roadmaps/${roadmap.slug || roadmap.id}/topics/${selectedTopic.id}`}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.35rem' }}
              >
                <BookOpen size={16} />
                <span>Start Learning Topic</span>
                <ArrowRight size={15} />
              </Link>

              {selectedTopic.article_url && (
                <a
                  href={selectedTopic.article_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ExternalLink size={14} />
                  <span>View Documentation</span>
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedTopic(null)}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--text-dim)' }}
            >
              Close Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
