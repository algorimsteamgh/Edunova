import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { roadmapApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import InteractiveRoadmap from '../components/InteractiveRoadmap';
import {
  Compass,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  BookOpen,
  UserCheck,
  LogIn,
} from 'lucide-react';

export default function RoadmapView() {
  const { idOrSlug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [modules, setModules] = useState([]);
  const [topics, setTopics] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  const fetchRoadmapData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await roadmapApi.getByIdOrSlug(idOrSlug);
      const data = res.data?.data || res.data || {};
      const rm = data.roadmap || data;
      setRoadmap(rm);
      setModules(data.modules || rm.modules || []);
      setTopics(data.topics || rm.topics || []);
      setUserProgress(data.userProgress || rm.userProgress || {});
      setIsEnrolled(Boolean(data.isEnrolled ?? rm.isEnrolled));
    } catch (err) {
      setError(err.message || 'Failed to load roadmap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmapData();
  }, [idOrSlug]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      await roadmapApi.enroll(roadmap.id);
      setIsEnrolled(true);
      fetchRoadmapData();
    } catch (err) {
      setError(err.message || 'Failed to enroll in roadmap.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUpdateStatus = async (topicId, nextStatus) => {
    try {
      await roadmapApi.updateTopicProgress(topicId, nextStatus);
      setUserProgress((prev) => ({
        ...prev,
        [topicId]: nextStatus,
      }));
    } catch (err) {
      console.error('Failed to update milestone progress:', err);
    }
  };

  if (loading) {
    return (
      <div className="container page-container" style={{ maxWidth: '1000px' }}>
        <div className="skeleton" style={{ height: '40px', width: '30%', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '120px', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ height: '400px' }} />
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="container page-container" style={{ maxWidth: '800px', textAlign: 'center' }}>
        <div className="alert alert-error">{error || 'Roadmap not found.'}</div>
        <Link to="/roadmaps" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to All Roadmaps
        </Link>
      </div>
    );
  }

  return (
    <div className="container page-container" style={{ maxWidth: '1100px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/roadmaps"
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} /> All Roadmaps
        </Link>
      </div>

      {/* Roadmap Hero Header */}
      <div
        style={{
          padding: '2.5rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(15, 23, 42, 0.7) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge badge-published" style={{ fontSize: '0.75rem' }}>
                {roadmap.domain || roadmap.category}
              </span>
              <span className="badge badge-student" style={{ fontSize: '0.75rem' }}>
                {roadmap.estimated_weeks || 12} Weeks
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {modules.length > 0 ? `${modules.length} Modules • ` : ''}{topics.length} Milestones
              </span>
            </div>

            <h1 style={{ fontSize: '2.4rem', lineHeight: 1.2, margin: '0 0 0.75rem 0', fontWeight: 800 }}>
              {roadmap.title}
            </h1>

            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 1rem 0' }}>
              {roadmap.description}
            </p>

            {/* Skills Covered Pills */}
            {(() => {
              const skills = typeof roadmap.skills_covered === 'string'
                ? JSON.parse(roadmap.skills_covered || '[]')
                : (roadmap.skills_covered || []);
              if (!skills || skills.length === 0) return null;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Skills Covered:</span>
                  {skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        color: 'var(--primary-light, #a5b4fc)',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Action: Enroll or Track */}
          <div style={{ flexShrink: 0 }}>
            {user ? (
              isEnrolled ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                >
                  <UserCheck size={18} />
                  <span>Enrolled in Path</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn btn-primary btn-glow btn-lg"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Sparkles size={18} />
                  <span>{enrolling ? 'Enrolling...' : 'Enroll in Career Path'}</span>
                </button>
              )
            ) : (
              <Link
                to="/login"
                className="btn btn-primary btn-glow btn-lg"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <LogIn size={18} />
                <span>Sign In to Track Progress</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Visual Roadmap Component */}
      <InteractiveRoadmap
        roadmap={roadmap}
        modules={modules}
        topics={topics}
        userProgress={userProgress}
        isEnrolled={isEnrolled}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}

