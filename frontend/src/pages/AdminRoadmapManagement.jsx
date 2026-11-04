import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roadmapApi } from '../services/api';
import {
  Compass,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Video,
  FileText,
  Search,
  ExternalLink,
  RefreshCw,
  Eye,
  Sliders,
} from 'lucide-react';

const CATEGORIES = [
  'Programming & Computer Science',
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Database Engineering',
  'Cloud Computing',
  'DevOps & Site Reliability Engineering',
  'Artificial Intelligence & Machine Learning',
  'Data Engineering',
  'Cybersecurity & Application Security',
  'Mobile App Development',
  'Software Testing & Quality Engineering',
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function AdminRoadmapManagement() {
  const [activeTab, setActiveTab] = useState('roadmaps'); // 'roadmaps' | 'modules' | 'auditor'
  const [roadmaps, setRoadmaps] = useState([]);
  const [missingResources, setMissingResources] = useState({ missingVideos: [], missingArticles: [], totalMissing: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Roadmap for Module/Topic Management
  const [selectedRoadmapId, setSelectedRoadmapId] = useState('');
  const [selectedRoadmapData, setSelectedRoadmapData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Modal State for Roadmap
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState(null);
  const [roadmapFormData, setRoadmapFormData] = useState({
    title: '',
    slug: '',
    category: CATEGORIES[0],
    level: 'Beginner',
    estimated_weeks: 12,
    description: '',
    skills_covered: '',
  });

  // Modal State for Topic
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicFormData, setTopicFormData] = useState({
    title: '',
    description: '',
    module_id: '',
    resource_type: 'video',
    video_id: '',
    video_duration: '',
    article_title: '',
    article_url: '',
    article_source: '',
    article_description: '',
    subtopics_text: '',
  });

  const loadAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [rmRes, auditRes] = await Promise.all([
        roadmapApi.adminList(),
        roadmapApi.adminGetMissingResources(),
      ]);
      const rmList = rmRes.data?.data?.roadmaps || [];
      setRoadmaps(rmList);
      setMissingResources(auditRes.data?.data || { missingVideos: [], missingArticles: [], totalMissing: 0 });

      if (rmList.length > 0 && !selectedRoadmapId) {
        setSelectedRoadmapId(rmList[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load roadmap management data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadRoadmapDetails = async (id) => {
    if (!id) return;
    setLoadingDetails(true);
    try {
      const res = await roadmapApi.getByIdOrSlug(id);
      const data = res.data?.data || {};
      setSelectedRoadmapData(data);
    } catch (err) {
      console.error('Failed to load roadmap details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (selectedRoadmapId) {
      loadRoadmapDetails(selectedRoadmapId);
    }
  }, [selectedRoadmapId]);

  const handleOpenRoadmapModal = (rm = null) => {
    if (rm) {
      setEditingRoadmap(rm);
      const skills = Array.isArray(rm.skills_covered)
        ? rm.skills_covered.join(', ')
        : (typeof rm.skills_covered === 'string' ? JSON.parse(rm.skills_covered || '[]').join(', ') : '');
      setRoadmapFormData({
        title: rm.title,
        slug: rm.slug,
        category: rm.category || CATEGORIES[0],
        level: rm.level || 'Beginner',
        estimated_weeks: rm.estimated_weeks || 12,
        description: rm.description || '',
        skills_covered: skills,
      });
    } else {
      setEditingRoadmap(null);
      setRoadmapFormData({
        title: '',
        slug: '',
        category: CATEGORIES[0],
        level: 'Beginner',
        estimated_weeks: 12,
        description: '',
        skills_covered: '',
      });
    }
    setShowRoadmapModal(true);
  };

  const handleSaveRoadmap = async (e) => {
    e.preventDefault();
    setError('');
    const skillsArray = roadmapFormData.skills_covered
      ? roadmapFormData.skills_covered.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      ...roadmapFormData,
      skills_covered: skillsArray,
    };

    try {
      if (editingRoadmap) {
        await roadmapApi.adminUpdateRoadmap(editingRoadmap.id, payload);
        setSuccessMsg(`Roadmap "${payload.title}" updated successfully.`);
      } else {
        await roadmapApi.adminCreateRoadmap(payload);
        setSuccessMsg(`Roadmap "${payload.title}" created successfully.`);
      }
      setShowRoadmapModal(false);
      loadAllData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save roadmap.');
    }
  };

  const handleDeleteRoadmap = async (rm) => {
    if (!window.confirm(`Are you sure you want to delete "${rm.title}" and all its modules and topics?`)) return;
    try {
      await roadmapApi.adminDeleteRoadmap(rm.id);
      setSuccessMsg(`Roadmap "${rm.title}" deleted.`);
      loadAllData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete roadmap.');
    }
  };

  const handleOpenTopicModal = (topic = null) => {
    if (topic) {
      setEditingTopic(topic);
      const subtopicsList = Array.isArray(topic.subtopics)
        ? topic.subtopics.map((st) => typeof st === 'string' ? st : st.title).join('\n')
        : '';

      setTopicFormData({
        title: topic.title,
        description: topic.description || '',
        module_id: topic.module_id || '',
        resource_type: topic.resource_type || (topic.video_id ? 'video' : 'article'),
        video_id: topic.video_id || '',
        video_duration: topic.video_duration || '',
        article_title: topic.article_title || '',
        article_url: topic.article_url || '',
        article_source: topic.article_source || '',
        article_description: topic.article_description || '',
        subtopics_text: subtopicsList,
      });
    } else {
      setEditingTopic(null);
      setTopicFormData({
        title: '',
        description: '',
        module_id: selectedRoadmapData?.modules?.[0]?.id || '',
        resource_type: 'video',
        video_id: '',
        video_duration: '35 mins',
        article_title: '',
        article_url: '',
        article_source: 'Official Docs',
        article_description: '',
        subtopics_text: '',
      });
    }
    setShowTopicModal(true);
  };

  const handleSaveTopic = async (e) => {
    e.preventDefault();
    if (!selectedRoadmapId) return;

    const subtopics = topicFormData.subtopics_text
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((title) => ({ title, summary: `Key learning concepts for ${title}.` }));

    const payload = {
      title: topicFormData.title,
      description: topicFormData.description,
      module_id: topicFormData.module_id,
      resource_type: topicFormData.resource_type,
      video_id: topicFormData.video_id,
      video_duration: topicFormData.video_duration,
      article_title: topicFormData.article_title,
      article_url: topicFormData.article_url,
      article_source: topicFormData.article_source,
      article_description: topicFormData.article_description,
      subtopics_json: subtopics,
    };

    try {
      if (editingTopic) {
        await roadmapApi.adminUpdateTopic(editingTopic.id, payload);
        setSuccessMsg(`Topic "${payload.title}" updated.`);
      } else {
        await roadmapApi.adminCreateTopic(selectedRoadmapId, payload);
        setSuccessMsg(`Topic "${payload.title}" added to roadmap.`);
      }
      setShowTopicModal(false);
      loadRoadmapDetails(selectedRoadmapId);
      loadAllData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save topic.');
    }
  };

  const handleDeleteTopic = async (topicId, topicTitle) => {
    if (!window.confirm(`Delete milestone "${topicTitle}"?`)) return;
    try {
      await roadmapApi.adminDeleteTopic(topicId);
      setSuccessMsg(`Topic "${topicTitle}" deleted.`);
      loadRoadmapDetails(selectedRoadmapId);
      loadAllData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to delete topic.');
    }
  };

  const filteredRoadmaps = roadmaps.filter((rm) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      rm.title?.toLowerCase().includes(term) ||
      rm.category?.toLowerCase().includes(term) ||
      rm.level?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container page-container" style={{ maxWidth: '1280px' }}>
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <Compass size={28} color="var(--primary)" />
            <h1 className="page-title" style={{ margin: 0 }}>Roadmap & Learning Track CMS</h1>
          </div>
          <p className="page-subtitle">
            Administer multi-domain learning paths, milestone modules, in-app YouTube video IDs, and technical article fallbacks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleOpenRoadmapModal()}
            className="btn btn-primary btn-glow"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Plus size={16} /> New Learning Path
          </button>
          <Link to="/admin" className="btn btn-secondary">
            Admin Overview
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('roadmaps')}
          style={{
            padding: '0.85rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'roadmaps' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'roadmaps' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Compass size={18} />
          <span>34 Canonical Roadmaps ({roadmaps.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('modules')}
          style={{
            padding: '0.85rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'modules' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'modules' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Layers size={18} />
          <span>Modules & Topics Inspector</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('auditor')}
          style={{
            padding: '0.85rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'auditor' ? '2px solid var(--accent-amber, #f59e0b)' : '2px solid transparent',
            color: activeTab === 'auditor' ? 'var(--accent-amber, #f59e0b)' : 'var(--text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertTriangle size={18} />
          <span>Missing Resources Auditor ({missingResources.totalMissing})</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: ROADMAPS LIST                                                 */}
      {/* ==================================================================== */}
      {activeTab === 'roadmaps' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '340px' }}>
              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search roadmaps by title or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '2.5rem', width: '100%' }}
              />
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Showing {filteredRoadmaps.length} of {roadmaps.length} learning paths
            </span>
          </div>

          <div className="table-responsive" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Roadmap Title</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Level</th>
                  <th style={{ padding: '1rem' }}>Modules</th>
                  <th style={{ padding: '1rem' }}>Topics</th>
                  <th style={{ padding: '1rem' }}>Duration</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoadmaps.map((rm) => (
                  <tr key={rm.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Link to={`/roadmaps/${rm.slug || rm.id}`} target="_blank" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                          {rm.title}
                        </Link>
                        <ExternalLink size={13} color="var(--text-dim)" />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>/{rm.slug}</span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {rm.category}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-published" style={{ fontSize: '0.75rem' }}>
                        {rm.level || 'Beginner'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{rm.modules_count || 4}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{rm.topic_count || 0}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-dim)' }}>{rm.estimated_weeks || 12} wks</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRoadmapId(rm.id);
                            setActiveTab('modules');
                          }}
                          className="btn btn-secondary btn-sm"
                          title="Manage Modules & Topics"
                        >
                          <Sliders size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenRoadmapModal(rm)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Roadmap Info"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRoadmap(rm)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#ef4444' }}
                          title="Delete Roadmap"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: MODULES & TOPICS INSPECTOR                                    */}
      {/* ==================================================================== */}
      {activeTab === 'modules' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label htmlFor="roadmap-select" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Select Roadmap:</label>
              <select
                id="roadmap-select"
                value={selectedRoadmapId}
                onChange={(e) => setSelectedRoadmapId(e.target.value)}
                className="input-field"
                style={{ width: '320px', padding: '0.6rem 1rem' }}
              >
                {roadmaps.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.category})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => handleOpenTopicModal()}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={16} /> Add Topic Milestone
              </button>
              {selectedRoadmapData?.roadmap && (
                <Link
                  to={`/roadmaps/${selectedRoadmapData.roadmap.slug || selectedRoadmapData.roadmap.id}`}
                  target="_blank"
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Eye size={16} /> View Interactive Graph
                </Link>
              )}
            </div>
          </div>

          {loadingDetails ? (
            <div className="skeleton" style={{ height: '300px' }} />
          ) : (
            <div>
              {(selectedRoadmapData?.modules || []).map((mod) => {
                const modTopics = (selectedRoadmapData?.topics || []).filter((t) => t.module_id === mod.id);
                return (
                  <div
                    key={mod.id}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      marginBottom: '1.5rem',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        padding: '1.25rem 1.5rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', padding: '0.2rem 0.5rem', background: 'rgba(99,102,241,0.1)', borderRadius: '4px' }}>
                          Module {mod.display_order}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {mod.title}
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          ({modTopics.length} Milestones)
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: '1rem 1.5rem' }}>
                      {modTopics.length === 0 ? (
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', margin: '0.5rem 0' }}>
                          No topics assigned to this module yet. Click &quot;Add Topic Milestone&quot; to assign one.
                        </p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                          {modTopics.map((top) => (
                            <div
                              key={top.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.85rem 1rem',
                                background: 'rgba(15,23,42,0.4)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-md)',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                <div
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    background: top.video_id ? 'rgba(99,102,241,0.15)' : 'rgba(6,182,212,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: top.video_id ? 'var(--primary)' : 'var(--accent-cyan)',
                                  }}
                                >
                                  {top.video_id ? <Video size={16} /> : <FileText size={16} />}
                                </div>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Link
                                      to={`/roadmaps/${selectedRoadmapData.roadmap?.slug || selectedRoadmapId}/topics/${top.id}`}
                                      target="_blank"
                                      style={{ fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none' }}
                                    >
                                      {top.title}
                                    </Link>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                      • {top.estimated_duration || '45 mins'}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                                    {top.video_id ? (
                                      <span>YouTube: {top.video_id}</span>
                                    ) : (
                                      <span>Fallback Article: {top.article_source || 'Documentation'}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenTopicModal(top)}
                                  className="btn btn-secondary btn-sm"
                                  title="Edit Topic Milestone"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTopic(top.id, top.title)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ color: '#ef4444' }}
                                  title="Delete Topic"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: MISSING RESOURCES AUDITOR                                     */}
      {/* ==================================================================== */}
      {activeTab === 'auditor' && (
        <div>
          <div
            style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(15,23,42,0.6))',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 'var(--radius-xl)',
              marginBottom: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-amber, #f59e0b)', marginBottom: '0.5rem' }}>
              <AlertTriangle size={20} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Learning Resource Health Check</h3>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Edunova Technologies enforces that every topic milestone must have either a verified in-app YouTube video ID or a reliable technical documentation article fallback. Topics flagged below require content assignment.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {/* Missing Videos */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Video size={18} color="var(--primary)" />
                  <span>Topics Without Video ({missingResources.missingVideos?.length || 0})</span>
                </h4>
              </div>
              {missingResources.missingVideos?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                  <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ margin: 0 }}>All topics have assigned videos!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '0.6rem', maxHeight: '400px', overflowY: 'auto' }}>
                  {missingResources.missingVideos.map((t) => (
                    <div key={t.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Roadmap: {t.roadmap_title || t.roadmap_id}</div>
                      <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-published" style={{ fontSize: '0.7rem' }}>Using Article Fallback: {t.article_source || 'Yes'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Articles */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} color="var(--accent-cyan)" />
                  <span>Topics Without Article Fallback ({missingResources.missingArticles?.length || 0})</span>
                </h4>
              </div>
              {missingResources.missingArticles?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                  <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ margin: 0 }}>All topics have article fallbacks configured!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '0.6rem', maxHeight: '400px', overflowY: 'auto' }}>
                  {missingResources.missingArticles.map((t) => (
                    <div key={t.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Roadmap: {t.roadmap_title || t.roadmap_id}</div>
                      <div style={{ marginTop: '0.4rem' }}>
                        <span className="badge badge-draft" style={{ fontSize: '0.7rem' }}>Missing Docs Fallback</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ROADMAP CREATE / EDIT MODAL                                          */}
      {/* ==================================================================== */}
      {showRoadmapModal && (
        <div className="modal-backdrop" onClick={() => setShowRoadmapModal(false)}>
          <div className="modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.3rem' }}>
              {editingRoadmap ? `Edit Roadmap: ${editingRoadmap.title}` : 'Create New Learning Path'}
            </h3>

            <form onSubmit={handleSaveRoadmap}>
              <div className="form-group">
                <label className="form-label">Roadmap Title *</label>
                <input
                  type="text"
                  required
                  value={roadmapFormData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setRoadmapFormData((prev) => ({ ...prev, title, slug: prev.slug || slug }));
                  }}
                  className="input-field"
                  placeholder="e.g. Generative AI Engineering"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={roadmapFormData.slug}
                    onChange={(e) => setRoadmapFormData({ ...roadmapFormData, slug: e.target.value })}
                    className="input-field"
                    placeholder="generative-ai"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={roadmapFormData.category}
                    onChange={(e) => setRoadmapFormData({ ...roadmapFormData, category: e.target.value })}
                    className="input-field"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Target Level</label>
                  <select
                    value={roadmapFormData.level}
                    onChange={(e) => setRoadmapFormData({ ...roadmapFormData, level: e.target.value })}
                    className="input-field"
                  >
                    {LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Weeks</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={roadmapFormData.estimated_weeks}
                    onChange={(e) => setRoadmapFormData({ ...roadmapFormData, estimated_weeks: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Skills Covered (comma separated)</label>
                <input
                  type="text"
                  value={roadmapFormData.skills_covered}
                  onChange={(e) => setRoadmapFormData({ ...roadmapFormData, skills_covered: e.target.value })}
                  className="input-field"
                  placeholder="e.g. React 19, TypeScript, Next.js, Redux Toolkit"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={roadmapFormData.description}
                  onChange={(e) => setRoadmapFormData({ ...roadmapFormData, description: e.target.value })}
                  className="input-field"
                  placeholder="Comprehensive step-by-step career path..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowRoadmapModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRoadmap ? 'Save Changes' : 'Create Roadmap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TOPIC CREATE / EDIT MODAL                                            */}
      {/* ==================================================================== */}
      {showTopicModal && (
        <div className="modal-backdrop" onClick={() => setShowTopicModal(false)}>
          <div className="modal-card" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.3rem' }}>
              {editingTopic ? `Edit Topic Milestone: ${editingTopic.title}` : 'Add Topic Milestone'}
            </h3>

            <form onSubmit={handleSaveTopic}>
              <div className="form-group">
                <label className="form-label">Topic Title *</label>
                <input
                  type="text"
                  required
                  value={topicFormData.title}
                  onChange={(e) => setTopicFormData({ ...topicFormData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g. React Functional Components & Props"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Belongs to Module *</label>
                  <select
                    value={topicFormData.module_id}
                    onChange={(e) => setTopicFormData({ ...topicFormData, module_id: e.target.value })}
                    className="input-field"
                    required
                  >
                    {(selectedRoadmapData?.modules || []).map((m) => (
                      <option key={m.id} value={m.id}>
                        Module {m.display_order}: {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Resource Type *</label>
                  <select
                    value={topicFormData.resource_type}
                    onChange={(e) => setTopicFormData({ ...topicFormData, resource_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="video">In-App YouTube Video</option>
                    <option value="article">Technical Article Fallback</option>
                  </select>
                </div>
              </div>

              {/* YouTube Video Section */}
              <div style={{ padding: '1rem', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--primary)' }}>In-App Video Configuration</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">YouTube Video ID (11 chars)</label>
                    <input
                      type="text"
                      value={topicFormData.video_id}
                      onChange={(e) => setTopicFormData({ ...topicFormData, video_id: e.target.value })}
                      className="input-field"
                      placeholder="e.g. dGcsHMXbSOA"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Duration</label>
                    <input
                      type="text"
                      value={topicFormData.video_duration}
                      onChange={(e) => setTopicFormData({ ...topicFormData, video_duration: e.target.value })}
                      className="input-field"
                      placeholder="35 mins"
                    />
                  </div>
                </div>
              </div>

              {/* Article Fallback Section */}
              <div style={{ padding: '1rem', background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '8px', marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--accent-cyan)' }}>Mandatory Article Fallback (MDN / Docs)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Article Title</label>
                    <input
                      type="text"
                      value={topicFormData.article_title}
                      onChange={(e) => setTopicFormData({ ...topicFormData, article_title: e.target.value })}
                      className="input-field"
                      placeholder="e.g. MDN React Component Guide"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Article Source</label>
                    <input
                      type="text"
                      value={topicFormData.article_source}
                      onChange={(e) => setTopicFormData({ ...topicFormData, article_source: e.target.value })}
                      className="input-field"
                      placeholder="e.g. MDN Web Docs"
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Article URL (Documentation Link)</label>
                  <input
                    type="url"
                    value={topicFormData.article_url}
                    onChange={(e) => setTopicFormData({ ...topicFormData, article_url: e.target.value })}
                    className="input-field"
                    placeholder="https://developer.mozilla.org/..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Subtopics / Milestones (one per line)</label>
                <textarea
                  rows={3}
                  value={topicFormData.subtopics_text}
                  onChange={(e) => setTopicFormData({ ...topicFormData, subtopics_text: e.target.value })}
                  className="input-field"
                  placeholder="Component Life Cycle&#10;Props vs State&#10;Conditional Rendering"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Topic Description *</label>
                <textarea
                  required
                  rows={2}
                  value={topicFormData.description}
                  onChange={(e) => setTopicFormData({ ...topicFormData, description: e.target.value })}
                  className="input-field"
                  placeholder="Technical overview of this milestone..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowTopicModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTopic ? 'Update Milestone' : 'Add Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

