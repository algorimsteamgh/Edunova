import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseApi, enrollmentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoModal from '../components/VideoModal';
import {
  Search,
  BookOpen,
  Users,
  Layers,
  ChevronLeft,
  ChevronRight,
  Play,
  Clock,
  Youtube,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const FEATURED_CHANNELS = [
  { name: 'Hussein Nasser', topic: 'Database Engineering', tag: 'Database Internals' },
  { name: 'TechWorld with Nana', topic: 'Cloud Architecture', tag: 'DevOps & Docker' },
  { name: 'ByteByteGo', topic: 'Systems Architecture', tag: 'Distributed Systems' },
  { name: 'freeCodeCamp.org', topic: 'Web Development', tag: 'Full-Stack Foundations' },
  { name: 'Web Dev Simplified', topic: 'Web Development', tag: 'React & Node' },
  { name: 'Programming with Mosh', topic: 'Computer Science', tag: 'Core JS & SQL' },
  { name: 'Continuous Delivery', topic: 'Software Engineering', tag: 'Clean Architecture' },
  { name: 'Fireship', topic: 'Web Development', tag: 'Modern Cloud' },
];

export default function CourseCatalog() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [userEnrollments, setUserEnrollments] = useState({});

  // Active in-catalog embedded video player modal
  const [activeModalVideo, setActiveModalVideo] = useState(null);

  // Fetch categories and user enrollments on mount
  useEffect(() => {
    courseApi
      .getCategories()
      .then((res) => setCategories(res.data.data.categories || []))
      .catch((err) => console.error('Failed to load categories', err));

    if (user) {
      enrollmentApi
        .getMyEnrollments()
        .then((res) => {
          const map = {};
          (res.data.data || []).forEach((e) => {
            map[e.course_id] = e;
          });
          setUserEnrollments(map);
        })
        .catch(() => {});
    }
  }, [user]);

  // Fetch courses on filter/page change
  useEffect(() => {
    setLoading(true);
    const params = {
      page,
      limit: 9,
      sortBy,
      sortOrder: 'desc',
    };
    if (selectedCategory) params.category = selectedCategory;
    if (search.trim()) params.search = search.trim();

    courseApi
      .list(params)
      .then((res) => {
        setCourses(res.data.data || []);
        setPagination(res.data.pagination || { total: 0, totalPages: 1 });
      })
      .catch((err) => console.error('Failed to load courses', err))
      .finally(() => setLoading(false));
  }, [selectedCategory, search, sortBy, page]);

  // Handle direct embedded video preview
  const handleWatchPreview = (e, course) => {
    e.preventDefault();
    e.stopPropagation();

    setActiveModalVideo({
      videoId: course.preview_video_id || 'bMknfKXIFA8',
      title: `${course.title} — Course Video Preview`,
      courseTitle: course.title,
      courseId: course.id,
      description: course.description,
      channelName: 'Verified YouTube Educator',
      duration: course.estimated_duration || 'Full Course',
    });
  };

  return (
    <div className="container page-container">
      {/* Embedded Video Modal: Plays directly inside Course Catalog without redirect */}
      <VideoModal
        isOpen={Boolean(activeModalVideo)}
        onClose={() => setActiveModalVideo(null)}
        videoData={activeModalVideo}
      />

      {/* Hero Header */}
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          <Youtube size={16} /> Curated YouTube Video Lessons Embedded In-App
        </div>
        <h1 className="page-title" style={{ fontSize: '2.6rem', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
          Explore Verified Technical Courses
        </h1>
        <p className="page-subtitle" style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Master modernized engineering practices from full-stack React and Node architectures to database internals and cloud-native systems. Watch verified YouTube video tutorials directly inside LearnSphere.
        </p>
      </div>

      {/* Top Educational Channels Showcase */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
          border: '1px solid var(--border-accent)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Sparkles size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Curated Top YouTube Engineering Channels by Topic:
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {FEATURED_CHANNELS.map((ch) => {
            const isSelected = selectedCategory === ch.topic;
            return (
              <button
                key={ch.name}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setSelectedCategory('');
                    setSelectedChannel('');
                  } else {
                    setSelectedCategory(ch.topic);
                    setSelectedChannel(ch.name);
                  }
                  setPage(1);
                }}
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  borderRadius: '9999px',
                  padding: '0.35rem 0.75rem',
                }}
              >
                <Youtube size={13} />
                <strong>{ch.name}</strong>
                <span style={{ opacity: 0.75, fontSize: '0.75rem' }}>• {ch.tag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search courses by title, topic, or channel..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Sort by:</span>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="created_at">Recently Added</option>
            <option value="title">Course Title</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        <button
          onClick={() => {
            setSelectedCategory('');
            setSelectedChannel('');
            setPage(1);
          }}
          className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Topics
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setSelectedChannel('');
              setPage(1);
            }}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.75rem' }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card" style={{ height: '360px' }}>
              <div className="skeleton" style={{ height: '160px', marginBottom: '1rem' }} />
              <div className="skeleton" style={{ height: '24px', width: '70%', marginBottom: '0.75rem' }} />
              <div className="skeleton" style={{ height: '16px', width: '90%', marginBottom: '0.5rem' }} />
              <div className="skeleton" style={{ height: '16px', width: '60%' }} />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <BookOpen className="empty-icon" size={48} />
          <h3 className="empty-title">No Courses Found</h3>
          <p className="empty-desc">Try modifying your search keywords or resetting your category filter.</p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              setSelectedChannel('');
            }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.75rem' }}>
          {courses.map((course) => {
            const enrollment = userEnrollments[course.id];
            const isEnrolled = Boolean(enrollment);

            return (
              <div
                key={course.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.25rem',
                  position: 'relative',
                  transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
                }}
              >
                {/* Card Banner / Video Thumbnail */}
                <div
                  style={{
                    height: '160px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                    border: '1px solid var(--border-subtle)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Subtle Background Pattern */}
                  <Layers size={54} color="var(--primary)" opacity={0.25} />

                  {/* Category Badge */}
                  <span
                    className="badge badge-published"
                    style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1 }}
                  >
                    {course.category}
                  </span>

                  {/* Enrolled Badge if student is active */}
                  {isEnrolled && (
                    <span
                      className="badge badge-active"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <CheckCircle2 size={13} /> Enrolled
                    </span>
                  )}

                  {/* Direct Watch Preview Overlay Button */}
                  <button
                    type="button"
                    onClick={(e) => handleWatchPreview(e, course)}
                    className="btn btn-primary"
                    style={{
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.85rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.6)',
                      zIndex: 2,
                    }}
                    title="Play embedded YouTube video preview inside this catalog"
                  >
                    <Play size={16} fill="white" /> Watch Preview
                  </button>
                </div>

                {/* Course Title */}
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                  <Link to={`/courses/${course.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                    {course.title}
                  </Link>
                </h3>

                {/* Instructor */}
                <div style={{ fontSize: '0.825rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                  Instructor: <strong style={{ color: 'var(--text-muted)' }}>{course.instructor_name || 'Staff Instructor'}</strong>
                </div>

                {/* Course Description */}
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    marginBottom: '1.25rem',
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.5,
                  }}
                >
                  {course.description}
                </p>

                {/* Metadata Row: Lessons & Duration */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    borderTop: '1px solid var(--border-subtle)',
                    marginBottom: '1rem',
                    fontSize: '0.825rem',
                    color: 'var(--text-dim)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <BookOpen size={14} color="var(--primary)" />
                    <span>{course.published_lessons_count || 0} Video Lessons</span>
                  </div>

                  {course.estimated_duration && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                      <Clock size={14} />
                      <span>{course.estimated_duration}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={14} />
                    <span>{course.enrollments_count || 0}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    to={isEnrolled ? `/courses/${course.id}/learn` : `/courses/${course.id}`}
                    className={`btn ${isEnrolled ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, textAlign: 'center', justifyContent: 'center', fontSize: '0.9rem' }}
                  >
                    {isEnrolled ? 'Continue Learning' : 'View Course & Syllabus'}
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => handleWatchPreview(e, course)}
                    className="btn btn-secondary"
                    style={{ padding: '0.6rem 0.85rem' }}
                    title="Watch Video Preview directly in LMS"
                  >
                    <Play size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Page {page} of {pagination.totalPages}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
