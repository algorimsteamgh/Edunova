import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { roadmapApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import YouTubePlayer from '../components/YouTubePlayer';
import Logo from '../components/Logo';
import {
  Compass,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
  ExternalLink,
  PlayCircle,
  FileText,
  AlertCircle,
  Sparkles,
  Layers,
  Award,
  ChevronRight,
  ListChecks,
  Code,
  ShieldCheck,
  HelpCircle,
  Share2,
  RotateCcw,
} from 'lucide-react';

export default function TopicLearningView() {
  const { roadmapId, topicId } = useParams();
  const effectiveTopicId = topicId || roadmapId;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSubtopicIdx, setActiveSubtopicIdx] = useState(0);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [status, setStatus] = useState('available');

  const fetchTopicData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await roadmapApi.getTopicDetails(effectiveTopicId);
      const data = res.data?.data || res.data || {};
      setTopic(data);
      const isComp = Boolean(data.user_progress?.is_completed || data.user_progress?.status === 'completed');
      setStatus(isComp ? 'completed' : (data.user_progress?.status || 'available'));
    } catch (err) {
      setError(err.message || 'Failed to load topic learning content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopicData();
  }, [effectiveTopicId]);

  const handleUpdateStatus = async (nextStatus) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setUpdatingProgress(true);
    try {
      await roadmapApi.updateTopicProgress(topic.id, nextStatus);
      setStatus(nextStatus);
    } catch (err) {
      console.error('Failed to update topic status:', err);
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleMarkVideoWatched = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setVideoWatched(true);
    try {
      await roadmapApi.updateVideoProgress(topic.id);
    } catch (err) {
      console.error('Failed to log video watch progress:', err);
    }
  };

  if (loading) {
    return (
      <div className="container page-container" style={{ maxWidth: '1040px', padding: '2rem 1rem' }}>
        <div className="skeleton" style={{ height: '32px', width: '40%', marginBottom: '1.25rem' }} />
        <div className="skeleton" style={{ height: '220px', marginBottom: '2rem', borderRadius: '16px' }} />
        <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="container page-container" style={{ maxWidth: '800px', textAlign: 'center', padding: '4rem 1rem' }}>
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={20} />
          <span>{error || 'Topic learning content could not be located.'}</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} />
          <span>Return to Previous View</span>
        </button>
      </div>
    );
  }

  const subtopics = Array.isArray(topic.subtopics) ? topic.subtopics : [];
  const objectives = Array.isArray(topic.learning_objectives) ? topic.learning_objectives : [];
  const prerequisites = Array.isArray(topic.prerequisites) ? topic.prerequisites : [];
  const referenceUrls = Array.isArray(topic.reference_urls) ? topic.reference_urls : [];

  const currentSubtopic = (activeSubtopicIdx !== null && subtopics[activeSubtopicIdx]) || null;
  const activeVideoId = (currentSubtopic && currentSubtopic.video_id) || topic.video_id;
  const activeVideoTitle = (currentSubtopic && (currentSubtopic.video_title || currentSubtopic.title)) || topic.video_title || topic.title;
  const activeChannelName = (currentSubtopic && currentSubtopic.channel_name) || topic.channel_name || 'Edunova Technologies Faculty';
  const activeDuration = (currentSubtopic && currentSubtopic.duration) || topic.video_duration || 'Full Lesson';
  const activeArticleUrl = (currentSubtopic && currentSubtopic.article_url) || topic.article_url;
  const activeArticleTitle = (currentSubtopic && currentSubtopic.article_title) || topic.article_title || `${activeVideoTitle} Technical Documentation`;
  const activeArticleSource = (currentSubtopic && currentSubtopic.article_source) || topic.article_source || 'Official Documentation';
  const activeArticleDesc = (currentSubtopic && currentSubtopic.summary) || topic.article_description;

  const isVideoResource = Boolean(activeVideoId);
  const isArticleResource = !activeVideoId && Boolean(activeArticleUrl);

  return (
    <div className="topic-learning-page" style={{ minHeight: '100vh', background: 'var(--bg-main, #0b0f19)' }}>
      {/* Top Breadcrumb & Navigation Bar */}
      <div
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(16px)',
          padding: '0.85rem 0',
          position: 'sticky',
          top: '76px',
          zIndex: 40,
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Link to="/roadmaps" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Compass size={15} color="var(--primary)" />
              <span>Roadmaps</span>
            </Link>
            <span>/</span>
            <Link
              to={`/roadmaps/${topic.roadmap_slug || topic.roadmap_id}`}
              style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
            >
              {topic.roadmap_title || 'Roadmap'}
            </Link>
            {topic.module_name && (
              <>
                <span>/</span>
                <span style={{ color: 'var(--text-dim)', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {topic.module_name}
                </span>
              </>
            )}
          </div>

          {/* Quick Mark Completed Trigger in Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.785rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                background: status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                color: status === 'completed' ? '#10b981' : 'var(--primary)',
                border: `1px solid ${status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
              }}
            >
              {status === 'completed' ? <CheckCircle2 size={13} /> : <PlayCircle size={13} />}
              <span>{status === 'completed' ? 'Completed' : 'In Progress'}</span>
            </span>

            {status !== 'completed' ? (
              <button
                type="button"
                onClick={() => handleUpdateStatus('completed')}
                disabled={updatingProgress}
                className="btn btn-primary btn-sm btn-glow"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <CheckCircle2 size={15} />
                <span>Mark Completed</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleUpdateStatus('in_progress')}
                disabled={updatingProgress}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Reset to In Progress</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container page-container" style={{ maxWidth: '1040px', padding: '2rem 1rem 4rem' }}>
        {/* Topic Hero Card */}
        <div
          style={{
            padding: '2.25rem',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: '2rem',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge-published" style={{ fontSize: '0.75rem' }}>
              {topic.difficulty_level || 'Intermediate'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Clock size={13} />
              <span>Estimated Study: {topic.estimated_duration || '45 mins'}</span>
            </span>
            {isArticleResource && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                }}
              >
                <FileText size={12} />
                <span>Technical Reference Article Fallback</span>
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.75rem 0', lineHeight: 1.25 }}>
            {topic.title}
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, maxWidth: '820px' }}>
            {topic.description}
          </p>

          {/* Prerequisites tags */}
          {prerequisites.length > 0 && (
            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Prerequisites:</span>
              {prerequisites.map((prereq, pIdx) => (
                <span
                  key={pIdx}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {prereq}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* 1. PRIMARY VIDEO LESSON OR ARTICLE FALLBACK MECHANISM           */}
        {/* ================================================================ */}
        <section style={{ marginBottom: '2.5rem' }}>
          {isVideoResource ? (
            <div>
              {/* Active Subtopic Milestone Banner */}
              {currentSubtopic && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.1))',
                    border: '1px solid rgba(99, 102, 241, 0.35)',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Sparkles size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>
                      Playing Subtopic Milestone <strong>{activeSubtopicIdx + 1}</strong>: <strong style={{ color: '#ffffff' }}>{currentSubtopic.title}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSubtopicIdx(null)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.785rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <RotateCcw size={13} />
                    <span>Switch to Topic Overview</span>
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PlayCircle size={18} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
                    Curated Interactive Video Lesson
                  </h3>
                </div>
                {activeChannelName && (
                  <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Educational Source: <strong>{activeChannelName}</strong>
                  </span>
                )}
              </div>

              {/* In-App YouTube Player with Edunova branding and official API integration */}
              <YouTubePlayer
                key={activeVideoId}
                videoId={activeVideoId}
                title={activeVideoTitle}
                channelTitle={activeChannelName}
                duration={activeDuration}
                topicTitle={currentSubtopic ? `${topic.title} • ${currentSubtopic.title}` : topic.title}
                courseTitle={topic.roadmap_title || 'Edunova Learning Track'}
                autoPlay={false}
                onProgress={({ progressPercent }) => {
                  if (progressPercent >= 80 && !videoWatched) {
                    handleMarkVideoWatched();
                  }
                }}
              />
            </div>
          ) : isArticleResource ? (
            /* ================================================================ */
            /* MANDATORY ARTICLE FALLBACK RESOURCE (MDN / Official Docs)       */
            /* ================================================================ */
            <div
              style={{
                padding: '2rem',
                background: 'rgba(6, 182, 212, 0.04)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: 'var(--accent-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: 'var(--accent-cyan)',
                        letterSpacing: '0.08em',
                      }}
                    >
                      Official Technical Reading & Fallback Guide
                    </span>
                    <h3 style={{ fontSize: '1.25rem', margin: '0.2rem 0 0 0', fontWeight: 700, color: 'var(--text-main)' }}>
                      {activeArticleTitle}
                    </h3>
                  </div>
                </div>

                <a
                  href={activeArticleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
                >
                  <span>Open {activeArticleSource || 'Documentation'}</span>
                  <ExternalLink size={15} />
                </a>
              </div>

              <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                {activeArticleDesc ||
                  `This topic leverages official technical documentation from ${activeArticleSource || 'industry authorities'} to provide an authoritative, deep-dive specification and implementation standard.`}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.825rem',
                  color: 'var(--text-dim)',
                  flexWrap: 'wrap',
                }}
              >
                <span>Source: <strong style={{ color: 'var(--text-main)' }}>{activeArticleSource || 'Official Docs'}</strong></span>
                <span>•</span>
                <span style={{ maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  URL: <a href={activeArticleUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{activeArticleUrl}</a>
                </span>
              </div>
            </div>
          ) : (
            /* Fallback state when no video and no article exists */
            <div
              style={{
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed var(--border-subtle)',
                textAlign: 'center',
              }}
            >
              <AlertCircle size={28} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)' }}>Topic Under Structured Review</h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                This topic syllabus is established. The curriculum committee is finalizing interactive media assets.
              </p>
            </div>
          )}
        </section>

        {/* ================================================================ */}
        {/* 2. LEARNING OBJECTIVES CHECKLIST                                */}
        {/* ================================================================ */}
        {objectives.length > 0 && (
          <section
            style={{
              marginBottom: '2.5rem',
              padding: '1.75rem',
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ListChecks size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
                Core Learning Objectives
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
              {objectives.map((obj, oIdx) => (
                <div
                  key={oIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    padding: '0.85rem 1rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    color: 'var(--text-muted)',
                  }}
                >
                  <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================================================================ */}
        {/* 3. SUBTOPICS NAVIGATION & PRACTICAL GUIDE                      */}
        {/* ================================================================ */}
        {subtopics.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Layers size={20} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
                Structured Subtopics & Milestones
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
              {subtopics.map((st, stIdx) => {
                const isSelected = activeSubtopicIdx === stIdx;
                const titleStr = typeof st === 'string' ? st : (st.title || `Subtopic ${stIdx + 1}`);
                const summaryStr = typeof st === 'object' ? st.summary : '';
                const hasSubVideo = Boolean(st.video_id);
                const hasSubArticle = Boolean(st.article_url);

                return (
                  <div
                    key={stIdx}
                    onClick={() => setActiveSubtopicIdx(isSelected ? null : stIdx)}
                    style={{
                      padding: '1.25rem 1.5rem',
                      borderRadius: 'var(--radius-lg)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 6px 20px rgba(99, 102, 241, 0.25)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                            color: isSelected ? '#ffffff' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.785rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {stIdx + 1}
                        </span>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: isSelected ? '#ffffff' : 'var(--text-main)' }}>
                            {titleStr}
                          </h4>
                          {st.duration && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                              <Clock size={12} /> {st.duration}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {hasSubVideo && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '0.25rem 0.65rem',
                              borderRadius: '4px',
                              background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                              color: isSelected ? 'var(--primary-light, #a5b4fc)' : 'var(--text-muted)',
                            }}
                          >
                            <PlayCircle size={13} />
                            <span>{isSelected ? 'Now Playing' : 'Play Milestone'}</span>
                          </span>
                        )}
                        {hasSubArticle && (
                          <a
                            href={st.article_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.75rem',
                              color: 'var(--accent-cyan)',
                              textDecoration: 'none',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '4px',
                              background: 'rgba(6, 182, 212, 0.1)',
                              border: '1px solid rgba(6, 182, 212, 0.25)',
                            }}
                          >
                            <BookOpen size={12} />
                            <span>Docs</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>

                    {summaryStr && (
                      <p style={{ margin: '0.75rem 0 0 2.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                        {summaryStr}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ================================================================ */}
        {/* 4. DETAILED TOPIC EXPLANATION (Technical Reading)               */}
        {/* ================================================================ */}
        {topic.detailed_explanation && (
          <section
            style={{
              marginBottom: '3rem',
              padding: '2.25rem',
              background: 'rgba(15, 23, 42, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <FileText size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
                Detailed Engineering Guide & Architecture Notes
              </h3>
            </div>

            <div
              style={{
                color: 'var(--text-muted)',
                lineHeight: 1.7,
                fontSize: '0.95rem',
                whiteSpace: 'pre-line',
              }}
            >
              {topic.detailed_explanation}
            </div>
          </section>
        )}

        {/* ================================================================ */}
        {/* 5. PREVIOUS & NEXT TOPIC NAVIGATION CONTROLS                    */}
        {/* ================================================================ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '2rem',
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {topic.previous_topic ? (
            <Link
              to={`/roadmaps/${topic.roadmap_slug || topic.roadmap_id}/topics/${topic.previous_topic.id}`}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}
            >
              <ArrowLeft size={16} />
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Previous Milestone</span>
                <span style={{ fontWeight: 600 }}>{topic.previous_topic.title}</span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => handleUpdateStatus(status === 'completed' ? 'in_progress' : 'completed')}
              disabled={updatingProgress}
              className={`btn ${status === 'completed' ? 'btn-secondary' : 'btn-primary btn-glow'}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
            >
              <CheckCircle2 size={16} />
              <span>{status === 'completed' ? 'Marked Completed ✓' : 'Mark Topic as Completed'}</span>
            </button>
          </div>

          {topic.next_topic ? (
            <Link
              to={`/roadmaps/${topic.roadmap_slug || topic.roadmap_id}/topics/${topic.next_topic.id}`}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}
            >
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', display: 'block', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Next Milestone</span>
                <span style={{ fontWeight: 600 }}>{topic.next_topic.title}</span>
              </div>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <Link
              to={`/roadmaps/${topic.roadmap_slug || topic.roadmap_id}`}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Compass size={16} />
              <span>Back to Roadmap Overview</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

