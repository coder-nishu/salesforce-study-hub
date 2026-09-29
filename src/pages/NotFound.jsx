import { Link } from 'react-router-dom'
import { CourseIcon } from '../components/CourseSwitcher'
import { catalog } from '../data/navigation'
import { JUMP_SHORTCUT } from '../lib/platform'

export default function NotFound() {
  return (
    <div className="page">
      <header className="page-header">
        <div className="page-eyebrow">404</div>
        <h1 className="page-title">Page not found</h1>
        <p className="page-subtitle">This page doesn’t exist in the study hub. Pick a course, or press {JUMP_SHORTCUT} to jump to any page.</p>
      </header>
      <ul className="notfound-list">
        {catalog.map((entry) => (
          <li key={entry.slug}>
            <Link to={entry.path} className="sidebar-catalog-link">
              <CourseIcon kind={entry.kind} />
              <span>
                <span className="sidebar-catalog-title">{entry.title}</span>
                <span className="sidebar-catalog-kind">{entry.kindLabel}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/" className="button">← All courses</Link>
    </div>
  )
}
