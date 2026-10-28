import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import { Plus, Edit2, Trash2, BookOpen, Layers, AlertCircle, CheckCircle2, Search } from 'lucide-react';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalCourse, setEditModalCourse] = useState(null);
  const [deleteTargetCourse, setDeleteTargetCourse] = useState(null);

  // Form states
  const initialCourseForm = {
    title: '',
    category: 'Web Development',
    description: '',
    status: 'draft',
    difficultyLevel: 'Beginner',
    estimatedDuration: '',
    learningObjectivesText: '',
  };

  const [formData, setFormData] = useState(initialCourseForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCourses = () => {
    setLoading(true);
    courseApi
      .list({ status: statusFilter, search: search.trim() || undefined, limit: 100 })
      .then((res) => {
        setCourses(res.data.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, [statusFilter, search]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      const payload = {
        ...formData,
        learningObjectives: formData.learningObjectivesText
          ? formData.learningObjectivesText.split('\n').map((o) => o.trim()).filter(Boolean)
          : [],
      };
      delete payload.learningObjectivesText;

      await courseApi.create(payload);
      setCreateModalOpen(false);
      setFormData(initialCourseForm);
      fetchCourses();
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
        learningObjectives: formData.learningObjectivesText
          ? formData.learningObjectivesText.split('\n').map((o) => o.trim()).filter(Boolean)
          : [],
      };
      delete payload.learningObjectivesText;

      await courseApi.update(editModalCourse.id, payload);
      setEditModalCourse(null);
      fetchCourses();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetCourse) return;
    try {
      await courseApi.delete(deleteTargetCourse.id);
      setDeleteTargetCourse(null);
      fetchCourses();
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const openEditModal = (c) => {
    setEditModalCourse(c);
    const objectives = c.learningObjectives || (typeof c.learning_objectives === 'string' ? JSON.parse(c.learning_objectives || '[]') : (c.learning_objectives || []));
    setFormData({
      title: c.title,
      category: c.category,
      description: c.description || '',
      status: c.status,
      difficultyLevel: c.difficulty_level || c.difficultyLevel || 'Beginner',
      estimatedDuration: c.estimated_duration || c.estimatedDuration || '',
      learningObjectivesText: Array.isArray(objectives) ? objectives.join('\n') : '',
    });
    setFormError('');
  };

  return (
    <div className="container page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Course Management</h1>
          <p className="page-subtitle">Author, publish, edit curriculum, and organize instructional tracks.</p>
        </div>
        <button
          onClick={() => {
            setFormData(initialCourseForm);
            setFormError('');
            setCreateModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={18} /> Create New Course
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Row */}
      <div
        className="card"
        style={{
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem', padding: '0.55rem 0.75rem 0.55rem 2.5rem', fontSize: '0.9rem' }}
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'published', 'draft', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textTransform: 'capitalize' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Course Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Lessons</th>
              <th>Enrolled</th>
              <th>Last Updated</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                  Loading courses...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                  No courses matching filters.
                </td>
              </tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      Instructor: {c.instructor_name || 'Staff'}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-published">{c.category}</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        c.status === 'published' ? 'badge-published' : c.status === 'draft' ? 'badge-draft' : 'badge-archived'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <BookOpen size={14} color="var(--primary)" />
                      <span>{c.total_lessons_count || 0}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Layers size={14} color="var(--accent-cyan)" />
                      <span>{c.enrollments_count || 0}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--text-dim)' }}>
                    {new Date(c.updated_at).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Link
                        to={`/admin/courses/${c.id}/lessons`}
                        className="btn btn-secondary btn-sm"
                        title="Manage Lessons Syllabus"
                      >
                        Lessons
                      </Link>
                      <button
                        onClick={() => openEditModal(c)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Course Details"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTargetCourse(c)}
                        className="btn btn-danger btn-sm"
                        title="Archive or Delete Course"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Course Modal */}
      {createModalOpen && (
        <div className="modal-overlay" onClick={() => setCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.25rem' }}>Create New Course</h3>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Distributed Database Engineering"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Database Engineering"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of course objectives and prerequisites..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Difficulty Level</label>
                  <select
                    className="form-select"
                    value={formData.difficultyLevel}
                    onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    placeholder="e.g. 6.5 hours"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Learning Objectives (One per line)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.learningObjectivesText}
                  onChange={(e) => setFormData({ ...formData, learningObjectivesText: e.target.value })}
                  placeholder="Understand core concepts&#10;Implement algorithms"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Public Catalog)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setCreateModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={formSubmitting} className="btn btn-primary">
                  {formSubmitting ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {editModalCourse && (
        <div className="modal-overlay" onClick={() => setEditModalCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.25rem' }}>Edit Course: {editModalCourse.title}</h3>
            {formError && <div className="alert alert-error">{formError}</div>}
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Difficulty Level</label>
                  <select
                    className="form-select"
                    value={formData.difficultyLevel}
                    onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    placeholder="e.g. 6.5 hours"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Learning Objectives (One per line)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.learningObjectivesText}
                  onChange={(e) => setFormData({ ...formData, learningObjectivesText: e.target.value })}
                  placeholder="Understand core concepts&#10;Implement algorithms"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Publication Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditModalCourse(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={formSubmitting} className="btn btn-primary">
                  {formSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete/Archive Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetCourse)}
        title="Delete or Archive Course"
        message={
          deleteTargetCourse?.enrollments_count > 0
            ? `This course currently has ${deleteTargetCourse.enrollments_count} active student enrollment(s). To protect relational data integrity, deleting will transition it to 'archived' status rather than removing student records.`
            : `Are you sure you want to permanently delete the course "${deleteTargetCourse?.title}"? This cannot be undone.`
        }
        confirmText={deleteTargetCourse?.enrollments_count > 0 ? 'Archive Course' : 'Delete Course'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetCourse(null)}
      />
    </div>
  );
}
