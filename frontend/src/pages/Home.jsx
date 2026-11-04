import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseApi, roadmapApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import {
  Search,
  Compass,
  BookOpen,
  FolderTree,
  Sparkles,
  Code,
  CheckCircle2,
  Award,
  ArrowRight,
  Clock,
  ShieldCheck,
  TrendingUp,
  LogIn,
  UserPlus,
  ChevronRight,
  Play,
  Database,
  Cpu,
  Cloud,
  Shield,
  Palette,
  Terminal,
  Layers,
  Star,
  ExternalLink,
  Server,
  Layout,
  Smartphone,
  BarChart3,
} from 'lucide-react';

// ============================================================================
// 1. THE 12 MAJOR SOFTWARE ENGINEERING DISCIPLINES
// ============================================================================
const LEARNING_CATEGORIES = [
  {
    name: 'Programming & Computer Science',
    slug: 'Programming & Computer Science',
    desc: 'C, C++, Java, Python, DSA, OOP, OS, Computer Networks, and DBMS Fundamentals.',
    icon: Code,
    color: '#6366f1',
    coursesCount: '5 Courses',
  },
  {
    name: 'Frontend Development',
    slug: 'Frontend Development',
    desc: 'HTML & CSS, JavaScript, TypeScript, React.js, Next.js, and Modern Responsive UI.',
    icon: Layout,
    color: '#06b6d4',
    coursesCount: '3 Courses',
  },
  {
    name: 'Backend Development',
    slug: 'Backend Development',
    desc: 'Node.js, Express, Python Backend, Java Spring Boot, Microservices, and REST APIs.',
    icon: Server,
    color: '#10b981',
    coursesCount: '3 Courses',
  },
  {
    name: 'Full Stack Development',
    slug: 'Full Stack Development',
    desc: 'MERN Stack, Java Full Stack, Python Full Stack, and Production Web Applications.',
    icon: Layers,
    color: '#8b5cf6',
    coursesCount: '5 Courses',
  },
  {
    name: 'Database Engineering',
    slug: 'Database Engineering',
    desc: 'SQL, PostgreSQL, MySQL, MongoDB, Redis Caching, and Query Optimization.',
    icon: Database,
    color: '#f59e0b',
    coursesCount: '2 Courses',
  },
  {
    name: 'Cloud Computing',
    slug: 'Cloud Computing',
    desc: 'AWS, Microsoft Azure, Google Cloud Platform, and Cloud-Native Architecture.',
    icon: Cloud,
    color: '#3b82f6',
    coursesCount: '2 Courses',
  },
  {
    name: 'DevOps & Site Reliability Engineering',
    slug: 'DevOps & Site Reliability Engineering',
    desc: 'Linux, Git/GitHub, Docker, Kubernetes, CI/CD Automation, Terraform, and SRE.',
    icon: Terminal,
    color: '#ec4899',
    coursesCount: '2 Courses',
  },
  {
    name: 'Artificial Intelligence & Machine Learning',
    slug: 'Artificial Intelligence & Machine Learning',
    desc: 'Python for AI, Deep Learning, Generative AI, LLMs, RAG Pipelines, and AI Agents.',
    icon: Cpu,
    color: '#a855f7',
    coursesCount: '3 Courses',
  },
  {
    name: 'Data Engineering',
    slug: 'Data Engineering',
    desc: 'Python for Data, Apache Spark, Kafka Streaming, Data Warehousing, and ETL Pipelines.',
    icon: BarChart3,
    color: '#14b8a6',
    coursesCount: '3 Courses',
  },
  {
    name: 'Software Testing & Quality Engineering',
    slug: 'Software Testing & Quality Engineering',
    desc: 'Manual QA, Automation Testing, Playwright, Selenium, API Testing, and CI Quality Gates.',
    icon: CheckCircle2,
    color: '#84cc16',
    coursesCount: '2 Courses',
  },
  {
    name: 'Cybersecurity & Application Security',
    slug: 'Cybersecurity & Application Security',
    desc: 'OWASP Top 10, Web App Security, JWT Auth, Network Security, and DevSecOps.',
    icon: ShieldCheck,
    color: '#ef4444',
    coursesCount: '2 Courses',
  },
  {
    name: 'Mobile App Development',
    slug: 'Mobile App Development',
    desc: 'Flutter, React Native, Android & iOS Architecture, and Cross-Platform Apps.',
    icon: Smartphone,
    color: '#f97316',
    coursesCount: '2 Courses',
  },
];

// ============================================================================
// 4. WHY USE THIS LMS? (Account Value Propositions)
// ============================================================================
const WHY_LMS_BENEFITS = [
  {
    title: 'Centralized Course Access',
    desc: 'All curriculum syllabuses, video classrooms, and practical reference exercises are unified in one clean workspace without external distractions.',
    icon: BookOpen,
    color: '#6366f1',
  },
  {
    title: 'Structured Learning Organization',
    desc: 'A clear hierarchy ensures you always understand how individual lessons relate to broad software engineering capabilities and career roadmaps.',
    icon: FolderTree,
    color: '#06b6d4',
  },
  {
    title: 'Personalized Learning Dashboard',
    desc: 'Your dedicated My Learning portal displays active enrollments, course shortcuts, and precise completion percentages at a single glance.',
    icon: Layers,
    color: '#8b5cf6',
  },
  {
    title: 'Course Enrollment Management',
    desc: 'Easily enroll, organize, and monitor all your ongoing and completed technical tracks in a single cohesive, lifetime-accessible library.',
    icon: ShieldCheck,
    color: '#3b82f6',
  },
  {
    title: 'Relational Progress Tracking',
    desc: 'Every completed topic is recorded with relational foreign-key validation, ensuring your progress is accurate, verifiable, and protected from data loss.',
    icon: TrendingUp,
    color: '#10b981',
  },
  {
    title: 'Continued Learning From Saved State',
    desc: 'Pick up immediately where you left off with smart session resume triggers that guide you directly to your next unfinished lesson.',
    icon: Sparkles,
    color: '#f59e0b',
  },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [featuredRoadmaps, setFeaturedRoadmaps] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await roadmapApi.searchGlobal(searchQuery);
        const data = res.data?.data || res.data || {};
        setSearchResults(data.results || data);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch real courses & roadmaps from SQLite database
  useEffect(() => {
    courseApi
      .list({ limit: 4, sortBy: 'created_at', sortOrder: 'desc' })
      .then((res) => {
        setFeaturedCourses(res.data.data || []);
      })
      .catch((err) => {
        console.error('Failed to load featured courses for LMS portal', err);
      })
      .finally(() => {
        setLoadingCourses(false);
      });

    roadmapApi
      .list({ limit: 4 })
      .then((res) => {
        const raw = res.data?.data || res.data?.roadmaps || [];
        setFeaturedRoadmaps(Array.isArray(raw) ? raw : (raw.roadmaps || []));
      })
      .catch((err) => {
        console.error('Failed to load featured roadmaps', err);
        setFeaturedRoadmaps([]);
      })
      .finally(() => {
        setLoadingRoadmaps(false);
      });
  }, []);

  const safeCourses = Array.isArray(featuredCourses) ? featuredCourses : [];
  const safeRoadmaps = Array.isArray(featuredRoadmaps) ? featuredRoadmaps : [];

  return (
    <div className="home-page-wrapper">
      {/* ============================================================== */}
      {/* 1. LMS INTRODUCTION / HERO                                     */}
      {/* ============================================================== */}
      <section className="home-hero-section lms-portal-hero">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="lms-hero-container">
            {/* Platform Identification Badge */}
            <div className="home-hero-badge" style={{ marginBottom: '1.25rem' }}>
              <Logo variant="compact" size="sm" />
              <span>Edunova Technologies • Learning Management System</span>
            </div>

            {/* Required Primary Heading */}
            <h1 className="home-hero-title lms-hero-heading">
              Structured Learning.{' '}
              <span className="text-gradient">Measurable Progress.</span>
            </h1>

            {/* Required Description */}
            <p className="home-hero-desc lms-hero-description">
              A centralized learning platform designed to organize courses, learning materials,
              and skill development through structured curriculums and roadmap.sh-style career paths.
            </p>

            {/* Interactive Global Search Bar with Live Dropdown */}
            <div style={{ position: 'relative', maxWidth: '640px', width: '100%', margin: '0 auto 2rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
                  borderRadius: '9999px',
                  padding: '0.4rem 0.5rem 0.4rem 1.25rem',
                }}
              >
                <Search size={18} color="var(--primary)" style={{ flexShrink: 0, marginRight: '0.75rem' }} />
                <input
                  type="text"
                  placeholder="Search 34 engineering roadmaps, skills, topics (e.g. React, Docker, AI, System Design)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchDropdown(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    width: '100%',
                  }}
                />
                {isSearching && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginRight: '0.75rem' }}>Searching...</span>
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults(null);
                      setShowSearchDropdown(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      padding: '0.2rem 0.5rem',
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Search Dropdown Results */}
              {showSearchDropdown && searchResults && (searchResults.roadmaps?.length > 0 || searchResults.topics?.length > 0) && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    background: 'rgba(15, 23, 42, 0.96)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                    maxHeight: '360px',
                    overflowY: 'auto',
                    zIndex: 100,
                    textAlign: 'left',
                    padding: '0.75rem',
                  }}
                >
                  {/* Roadmaps */}
                  {searchResults.roadmaps?.length > 0 && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', padding: '0.25rem 0.6rem' }}>
                        Matching Roadmaps
                      </div>
                      {searchResults.roadmaps.slice(0, 4).map((rm) => (
                        <Link
                          key={rm.id}
                          to={`/roadmaps/${rm.slug || rm.id}`}
                          onClick={() => setShowSearchDropdown(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.55rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-main)',
                            textDecoration: 'none',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Compass size={15} color="var(--primary)" />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rm.title}</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{rm.category}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Topics */}
                  {searchResults.topics?.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)', padding: '0.25rem 0.6rem' }}>
                        Matching Milestones & Lessons
                      </div>
                      {searchResults.topics.slice(0, 5).map((top) => (
                        <Link
                          key={top.id}
                          to={`/roadmaps/${top.roadmap_slug || top.roadmap_id}/topics/${top.id}`}
                          onClick={() => setShowSearchDropdown(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.55rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-main)',
                            textDecoration: 'none',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={14} color="var(--accent-cyan)" />
                            <span style={{ fontSize: '0.875rem' }}>{top.title}</span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{top.roadmap_title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Triggers */}
            <div className="home-hero-actions lms-hero-actions">
              <Link to="/courses" className="btn btn-primary btn-lg btn-glow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                <BookOpen size={18} />
                <span>Browse Course Catalog</span>
                <ArrowRight size={18} />
              </Link>

              <Link to="/roadmaps" className="btn btn-secondary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                <Compass size={18} />
                <span>Career Roadmaps</span>
              </Link>

              {user ? (
                <Link to="/my-learning" className="btn btn-secondary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Layers size={18} color="var(--primary)" />
                  <span>Go to My Learning</span>
                </Link>
              ) : (
                <Link to="/login" className="btn btn-secondary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Platform Architecture Highlights Bar */}
            <div className="lms-pillars-bar">
              <div className="lms-pillar-item">
                <Compass size={18} color="var(--primary)" />
                <span>Structured Curriculums</span>
              </div>
              <div className="lms-pillar-divider">•</div>
              <div className="lms-pillar-item">
                <FolderTree size={18} color="var(--accent-cyan)" />
                <span>Modular Topic Hierarchy</span>
              </div>
              <div className="lms-pillar-divider">•</div>
              <div className="lms-pillar-item">
                <Code size={18} color="#f59e0b" />
                <span>Hands-on Practical Exercises</span>
              </div>
              <div className="lms-pillar-divider">•</div>
              <div className="lms-pillar-item">
                <TrendingUp size={18} color="var(--success)" />
                <span>Relational Progress Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. LEARNING CATEGORIES (Disciplines in SQLite)                  */}
      {/* ============================================================== */}
      <section id="categories" className="lms-section lms-categories-section">
        <div className="container">
          <div className="section-header-flex">
            <div>
              <span className="section-eyebrow">Curriculum Domains</span>
              <h2 className="section-main-title">Structured Learning Disciplines</h2>
              <p className="section-main-subtitle" style={{ marginBottom: 0 }}>
                Explore specialized tracks organized by engineering domain and practical skill focus.
              </p>
            </div>
            <Link to="/courses" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>View All Courses</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="categories-grid">
            {LEARNING_CATEGORIES.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={idx}
                  className="category-card"
                  onClick={() => navigate(`/courses?category=${encodeURIComponent(cat.slug)}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/courses?category=${encodeURIComponent(cat.slug)}`);
                  }}
                >
                  <div className="category-header">
                    <div className="category-icon-box" style={{ background: `${cat.color}20`, color: cat.color }}>
                      <IconComp size={24} />
                    </div>
                    <span className="category-badge">{cat.coursesCount}</span>
                  </div>
                  <h3 className="category-name">{cat.name}</h3>
                  <p className="category-desc">{cat.desc}</p>
                  <div className="category-footer">
                    <span>Explore Category</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. STRUCTURED COURSE CATALOG PREVIEW                           */}
      {/* ============================================================== */}
      <section id="featured-courses" className="lms-section lms-courses-section">
        <div className="container">
          <div className="section-header-flex">
            <div>
              <span className="section-eyebrow">Active Curriculums</span>
              <h2 className="section-main-title">Structured Courses in the Catalog</h2>
              <p className="section-main-subtitle" style={{ marginBottom: 0 }}>
                Preview individual courses with modular topic breakdowns, difficulty ratings, and lesson preview access.
              </p>
            </div>
            <Link to="/courses" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Complete Catalog</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loadingCourses ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="card" style={{ height: '320px' }}>
                  <div className="skeleton" style={{ height: '140px', marginBottom: '1rem' }} />
                  <div className="skeleton" style={{ height: '22px', width: '70%', marginBottom: '0.75rem' }} />
                  <div className="skeleton" style={{ height: '14px', width: '90%', marginBottom: '0.5rem' }} />
                  <div className="skeleton" style={{ height: '14px', width: '60%' }} />
                </div>
              ))}
            </div>
          ) : safeCourses.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem 1rem' }}>
              <BookOpen size={48} className="empty-icon" />
              <h3 className="empty-title">Courses Available in Catalog</h3>
              <p className="empty-desc">Explore the complete course catalog to discover available curriculums.</p>
              <Link to="/courses" className="btn btn-primary">Browse All Courses</Link>
            </div>
          ) : (
            <div className="featured-courses-grid">
              {safeCourses.map((course) => (
                <div key={course.id} className="featured-course-card">
                  {/* Card Thumbnail Box */}
                  <div className="featured-card-thumbnail">
                    <div className="thumbnail-gradient-overlay"></div>
                    <Layers size={48} color="var(--primary)" opacity={0.3} />

                    {/* Category Tag */}
                    <span className="badge badge-published thumbnail-tag">
                      {course.category}
                    </span>

                    {/* Direct Details Link */}
                    <Link
                      to={`/courses/${course.id}`}
                      className="thumbnail-play-btn"
                      title="View course curriculum and details"
                    >
                      <BookOpen size={16} />
                      <span>Curriculum</span>
                    </Link>
                  </div>

                  {/* Card Body */}
                  <div className="featured-card-body">
                    {/* Level Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge badge-student" style={{ fontSize: '0.75rem' }}>
                        {course.difficulty_level || 'Beginner to Advanced'}
                      </span>
                      <div className="rating-pill">
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        <span>4.9</span>
                      </div>
                    </div>

                    <h3 className="featured-card-title">
                      <Link to={`/courses/${course.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                        {course.title}
                      </Link>
                    </h3>

                    <div className="featured-instructor">
                      Instructor: <strong>{course.instructor_name || 'Staff Instructor'}</strong>
                    </div>

                    <p className="featured-card-desc">
                      {course.description}
                    </p>

                    <div className="featured-card-footer">
                      <div className="featured-meta">
                        <Clock size={14} color="var(--text-muted)" />
                        <span>{course.estimated_duration || 'Full Course'}</span>
                      </div>
                      <Link to={`/courses/${course.id}`} className="btn btn-secondary btn-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/courses" className="btn btn-secondary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 2.25rem' }}>
              <span>Explore Complete Catalog (34+ Software Engineering Courses)</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5B. FEATURED CAREER ROADMAPS (roadmap.sh Style)                 */}
      {/* ============================================================== */}
      <section id="featured-roadmaps" className="lms-section" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
        <div className="container">
          <div className="section-header-flex">
            <div>
              <span className="section-eyebrow">Interactive Career Paths</span>
              <h2 className="section-main-title">Prerequisite-Driven Engineering Roadmaps</h2>
              <p className="section-main-subtitle" style={{ marginBottom: 0 }}>
                Visual skill graphs inspired by roadmap.sh to guide your journey from beginner to production architect.
              </p>
            </div>
            <Link to="/roadmaps" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={16} />
              <span>All 34 Career Roadmaps</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loadingRoadmaps ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="card" style={{ height: '220px' }}>
                  <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '1rem' }} />
                  <div className="skeleton" style={{ height: '50px' }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {safeRoadmaps.map((rm) => (
                <div
                  key={rm.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span className="badge badge-published" style={{ fontSize: '0.75rem' }}>
                        {rm.domain || rm.category}
                      </span>
                      <span className="badge badge-student" style={{ fontSize: '0.75rem' }}>
                        {rm.estimated_weeks || 12} Wks
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', margin: '0 0 0.5rem 0', lineHeight: 1.35 }}>
                      <Link to={`/roadmaps/${rm.slug || rm.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                        {rm.title}
                      </Link>
                    </h3>

                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {rm.description}
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: '1.25rem',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {rm.topics_count || 3} Core Milestones
                    </span>
                    <Link
                      to={`/roadmaps/${rm.slug || rm.id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <span>Explore</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. WHY USE THIS LMS? (Account Value Propositions)              */}
      {/* ============================================================== */}
      <section id="why-lms" className="lms-section lms-why-section">
        <div className="container">
          <div className="section-header-centered">
            <span className="section-eyebrow">Platform Value</span>
            <h2 className="section-main-title">Why Use Edunova Technologies?</h2>
            <p className="section-main-subtitle">
              Built on genuine application features, an account empowers you to organize, execute, and verify your technical education.
            </p>
          </div>

          <div className="why-grid">
            {WHY_LMS_BENEFITS.map((benefit, idx) => {
              const BenefitIcon = benefit.icon;
              return (
                <div key={idx} className="why-card">
                  <div className="why-icon-box" style={{ background: `${benefit.color}20`, color: benefit.color }}>
                    <BenefitIcon size={26} />
                  </div>
                  <h3 className="why-card-title">{benefit.title}</h3>
                  <p className="why-card-desc">{benefit.desc}</p>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            {user ? (
              <Link to="/my-learning" className="btn btn-primary btn-lg btn-glow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                <Layers size={18} />
                <span>Open Your Student Dashboard</span>
              </Link>
            ) : (
              <div style={{ display: 'inline-flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/register" className="btn btn-primary btn-lg btn-glow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                  <UserPlus size={18} />
                  <span>Create Student Account</span>
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                  <LogIn size={18} />
                  <span>Sign In to LMS</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
