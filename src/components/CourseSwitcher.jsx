import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { catalog, catalogPlaceholder, currentCatalogEntry } from '../data/navigation'

export function CourseIcon({ kind }) {
  return (
    <span className={`course-icon course-icon-${kind}`} aria-hidden="true">
      {kind === 'lab' ? (
        <svg viewBox="0 0 20 20" width="14" height="14">
          <path d="M7.5 2.5h5M8.5 2.5v5l-4.5 8a1.5 1.5 0 0 0 1.3 2.2h9.4a1.5 1.5 0 0 0 1.3-2.2l-4.5-8v-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" width="14" height="14">
          <path d="M3 4.5h5.5a2 2 0 0 1 2 2V17a1.5 1.5 0 0 0-1.5-1.5H3zM17 4.5h-5.5a2 2 0 0 0-2 2V17a1.5 1.5 0 0 1 1.5-1.5H17z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}

// Shows which course you're in and lets you switch to any other one.
// variant="header" is a compact button; variant="sidebar" is a card at the top of the sidebar.
export default function CourseSwitcher({ variant = 'header' }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const current = currentCatalogEntry(pathname)
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    // Move focus into the menu so arrow keys work straight away.
    rootRef.current?.querySelector('[role="menuitem"]')?.focus()
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Close when the page changes.
  const [prevPath, setPrevPath] = useState(pathname)
  if (pathname !== prevPath) {
    setPrevPath(pathname)
    setOpen(false)
  }

  function onMenuKey(e) {
    const items = [...rootRef.current.querySelectorAll('[role="menuitem"]')]
    const index = items.indexOf(document.activeElement)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = e.key === 'ArrowDown' ? (index + 1) % items.length : (index - 1 + items.length) % items.length
      items[next].focus()
    }
  }

  return (
    <div className={`course-switcher course-switcher-${variant}`} ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="course-switcher-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
      >
        {current ? <CourseIcon kind={current.kind} /> : <span className="course-icon" aria-hidden="true">⌂</span>}
        <span className="course-switcher-text">
          {variant === 'sidebar' && <span className="course-switcher-kicker">{current ? current.kindLabel : 'Salesforce Study Hub'}</span>}
          <span className="course-switcher-title">{current ? current.title : 'All courses'}</span>
          {variant === 'sidebar' && <span className="course-switcher-hint">Switch course</span>}
        </span>
        <svg className="course-switcher-caret" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div id={menuId} className="course-switcher-menu" role="menu" aria-label="Courses" onKeyDown={onMenuKey}>
          <div className="course-switcher-menu-label">Courses on Salesforce Study Hub</div>
          {catalog.map((entry) => {
            const isCurrent = entry.slug === current?.slug
            return (
              <button
                key={entry.slug}
                type="button"
                role="menuitem"
                className={`course-switcher-item${isCurrent ? ' is-current' : ''}`}
                aria-current={isCurrent ? 'true' : undefined}
                onClick={() => navigate(entry.path)}
              >
                <CourseIcon kind={entry.kind} />
                <span className="course-switcher-item-body">
                  <span className="course-switcher-item-title">
                    {entry.title}
                    {isCurrent && <span className="course-switcher-check"> ✓ You’re here</span>}
                  </span>
                  <span className="course-switcher-item-kind">{entry.kindLabel}</span>
                  <span className="course-switcher-item-desc">{entry.tagline}</span>
                </span>
              </button>
            )
          })}
          <div className="course-switcher-soon">
            <span aria-hidden="true">＋</span> {catalogPlaceholder.title}
          </div>
          <Link to="/" role="menuitem" className="course-switcher-all">
            Browse all courses →
          </Link>
        </div>
      )}
    </div>
  )
}
