import { Link, useLocation } from 'react-router-dom'
import { DEFAULT_COURSE_SLUG, getCourse, getLab, parsePath } from '../data/navigation'

export default function Header({ onMenuClick }) {
  const { courseSlug } = parsePath(useLocation().pathname)
  const course = getCourse(courseSlug) ?? getLab(courseSlug) ?? getCourse(DEFAULT_COURSE_SLUG)

  return (
    <header className="header">
      <button
        type="button"
        className="header-menu"
        aria-label="Open navigation"
        onClick={onMenuClick}
      >
        ☰
      </button>

      <Link to="/" className="header-brand">
        <span className="header-brand-icon" aria-hidden="true">⚡</span>
        Salesforce Study Hub
      </Link>

      <div className="header-course">
        <span className="header-course-label">Course</span>
        <span className="header-course-name">{course.title}</span>
      </div>

      <button
        type="button"
        className="header-search"
        title="Search is coming soon"
      >
        <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <line x1="12.8" y1="12.8" x2="17" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span>Search</span>
      </button>
    </header>
  )
}
