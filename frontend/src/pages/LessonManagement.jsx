import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseApi, lessonApi } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import YouTubePlayer from '../components/YouTubePlayer';
import VideoModal from '../components/VideoModal';
import { extractYouTubeVideoId } from '../utils/youtube';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Play,
  Youtube,
  Clock,
} from 'lucide-react';

export default function LessonManagement() {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [deleteTargetLesson, setDeleteTargetLesson] = useState(null);
  const [previewModalVideo, setPreviewModalVideo] = useState(null);

  // Form State
  const initialForm = {
    title: '',
    content: '# Lesson Content\n\nWrite curriculum notes and instructions here.',
    position: 1,
    status: 'published',
    videoUrl: '',
    duration: '',
    description: '',
    channelName: '',
    isPreview: false,
    topicTitle: '',
    subtopicTitle: '',
    practicalExercise: '',
    referenceUrlsText: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([courseApi.getById(courseId), lessonApi.listByCourse(courseId)])
      .then(([courseRes, lessonsRes]) => {
        setCourse(courseRes.data.data.course);
        setLessons(lessonsRes.data.data.lessons || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      const payload = {
        ...formData,
        referenceUrls: formData.referenceUrlsText
          ? formData.referenceUrlsText.split('\n').map((u) => u.trim()).filter(Boolean)
          : [],
      };
      delete payload.referenceUrlsText;

      await lessonApi.create(courseId, payload);
      setCreateModalOpen(false);
      setFormData(initialForm);
      fetchData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      const payload = {
        ...formData,
        referenceUrls: formData.referenceUrlsText
          ? formData.referenceUrlsText.split('\n').map((u) => u.trim()).filter(Boolean)
          : [],
      };
      delete payload.referenceUrlsText;

      await lessonApi.update(editLesson.id, payload);
      setEditLesson(null);
      fetchData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetLesson) return;
    try {
      await lessonApi.delete(deleteTargetLesson.id);
      setDeleteTargetLesson(null);
      fetchData();
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const openCreateModal = () => {
    setFormData({
      ...initialForm,
      position: lessons.length + 1,
    });
    setFormError('');
    setCreateModalOpen(true);
  };

  const openEditModal = (lesson) => {
    setEditLesson(lesson);
    const refUrls = lesson.referenceUrls || (typeof lesson.reference_urls === 'string' ? JSON.parse(lesson.reference_urls || '[]') : (lesson.reference_urls || []));
    setFormData({
      title: lesson.title,
      content: lesson.content || '',
      position: lesson.position,
      status: lesson.status,
      videoUrl: lesson.video_url || (lesson.video_id ? `https://www.youtube.com/watch?v=${lesson.video_id}` : ''),
      duration: lesson.duration || '',
      description: lesson.description || '',
      channelName: lesson.channel_name || '',
      isPreview: Boolean(lesson.is_preview),
      topicTitle: lesson.topicTitle || lesson.topic_title || '',
      subtopicTitle: lesson.subtopicTitle || lesson.subtopic_title || '',
      practicalExercise: lesson.practicalExercise || lesson.practical_exercise || '',
      referenceUrlsText: Array.isArray(refUrls) ? refUrls.join('\n') : '',
    });
    setFormError('');
  };

  const extractedVideoId = extractYouTubeVideoId(formData.videoUrl);

  if (loading) {
    return (
      <div className="container page-container">
        <div className="card skeleton" style={{ height: '400px' }} />
      </div>
    );
  }

  return (
    <div className="container page-container">
      {/* Video Preview Modal */}
      <VideoModal
        isOpen={Boolean(previewModalVideo)}
        onClose={() => setPreviewModalVideo(null)}
        videoData={previewModalVideo}
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} /> Back to Course Management
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Curriculum Modules: {course?.title}</h1>
          <p className="page-subtitle">Add, reorder, update syllabus lessons, publication statuses, and embedded YouTube videos.</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} /> Add New Lesson
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Lesson List Table */}
      <div className="card table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Lesson Title & Channel</th>
              <th>YouTube Video</th>
              <th>Duration</th>
              <th>Preview</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No lessons found. Click "Add New Lesson" to get started.
                </td>
              </tr>
            ) : (
              lessons.map((lesson) => (
                <tr key={lesson.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)', width: '60px' }}>
                    #{lesson.position}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{lesson.title}</div>
                    {lesson.channel_name && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                        <Youtube size={12} color="var(--primary)" /> {lesson.channel_name}
                      </div>
                    )}
                  </td>
                  <td>
                    {lesson.video_id ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewModalVideo({
                            videoId: lesson.video_id,
                            title: lesson.title,
                            courseTitle: course?.title,
                            courseId: courseId,
                            description: lesson.description || lesson.content,
                            channelName: lesson.channel_name,
                            duration: lesson.duration,
                          })
                        }
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
                      >
                        <Play size={13} /> {lesson.video_id}
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>None</span>
                    )}
                  </td>
                  <td>
                    {lesson.duration ? (
                      <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {lesson.duration}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {lesson.is_preview ? (
                      <span className="badge badge-published" style={{ fontSize: '0.75rem' }}>
                        Free Preview
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Enrolled Only</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${lesson.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
                      {lesson.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEditModal(lesson)}
                        className="btn btn-secondary btn-sm"
                        title="Edit lesson"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTargetLesson(lesson)}
                        className="btn btn-danger btn-sm"
                        title="Delete lesson"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal Form */}
      {(createModalOpen || editLesson) && (
        <div
          className="modal-overlay"
          onClick={() => {
            setCreateModalOpen(false);
            setEditLesson(null);
          }}
        >
          <div
            className="modal-content"
            style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1.25rem' }}>
              {createModalOpen ? 'Add New Video Lesson' : `Edit Lesson: ${editLesson?.title}`}
            </h3>

            {formError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{formError}</div>}

            <form onSubmit={createModalOpen ? handleCreateSubmit : handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Lesson Title</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 1. Introduction to Relational Normalization"
                />
              </div>

              {/* YouTube Video URL Input with Live Validation */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>YouTube Video URL or ID</span>
                  {formData.videoUrl && (
                    <span style={{ fontSize: '0.8rem', color: extractedVideoId ? '#10b981' : 'var(--danger)' }}>
                      {extractedVideoId ? `✓ Valid Video ID: ${extractedVideoId}` : '✗ Invalid YouTube Link'}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="e.g. https://www.youtube.com/watch?v=clvir_bDDgk or youtu.be/clvir_bDDgk"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
                  Supports standard watch URLs, short links, shorts, and embed URLs from youtube.com and youtu.be.
                </span>
              </div>

              {/* Live Video Preview if valid ID */}
              {extractedVideoId && (
                <div style={{ marginBottom: '1rem', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Live Embedded Player Preview:
                  </div>
                  <YouTubePlayer videoId={extractedVideoId} autoplay={false} />
                </div>
              )}

              {/* Channel Name & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Channel / Creator Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.channelName}
                    onChange={(e) => setFormData({ ...formData, channelName: e.target.value })}
                    placeholder="e.g. Hussein Nasser, freeCodeCamp"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 42:15 or 35 mins"
                  />
                </div>
              </div>

              {/* Position Sequence & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Position Sequence #</label>
                  <input
                    type="number"
                    min={1}
                    className="form-input"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Publication Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Topic & Subtopic Hierarchy */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Topic Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.topicTitle}
                    onChange={(e) => setFormData({ ...formData, topicTitle: e.target.value })}
                    placeholder="e.g. Introduction to Artificial Intelligence"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subtopic Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.subtopicTitle}
                    onChange={(e) => setFormData({ ...formData, subtopicTitle: e.target.value })}
                    placeholder="e.g. Intelligent agents, PEAS framework"
                  />
                </div>
              </div>

              {/* Free Preview Checkbox */}
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isPreviewCheckbox"
                  checked={Boolean(formData.isPreview)}
                  onChange={(e) => setFormData({ ...formData, isPreview: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="isPreviewCheckbox" style={{ fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                  Enable Free Video Preview (Allow students to view without enrolling)
                </label>
              </div>

              {/* Short Description */}
              <div className="form-group">
                <label className="form-label">Lesson Short Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key concepts and summary of this video lesson"
                />
              </div>

              {/* Practical Exercise */}
              <div className="form-group">
                <label className="form-label">Hands-on Practical Lab Exercise</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '80px' }}
                  value={formData.practicalExercise}
                  onChange={(e) => setFormData({ ...formData, practicalExercise: e.target.value })}
                  placeholder="Exercise prompt, lab steps, and expected outputs"
                />
              </div>

              {/* Reference Documentation URLs */}
              <div className="form-group">
                <label className="form-label">Reference Documentation URLs (One per line)</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '60px' }}
                  value={formData.referenceUrlsText}
                  onChange={(e) => setFormData({ ...formData, referenceUrlsText: e.target.value })}
                  placeholder="https://docs.python.org/3/&#10;https://scikit-learn.org"
                />
              </div>

              {/* Markdown Content */}
              <div className="form-group">
                <label className="form-label">Lesson Content & Notes (Markdown)</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '140px' }}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalOpen(false);
                    setEditLesson(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={formSubmitting} className="btn btn-primary">
                  {formSubmitting ? 'Saving...' : createModalOpen ? 'Create Video Lesson' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Lesson */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetLesson)}
        title="Delete Lesson Module"
        message={`Are you sure you want to delete "${deleteTargetLesson?.title}"? Any student progress associated with this lesson will be cascade deleted.`}
        confirmText="Delete Lesson"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetLesson(null)}
      />
    </div>
  );
}
